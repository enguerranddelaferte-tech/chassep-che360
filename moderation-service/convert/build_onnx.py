# Conversion YOLOv8n-cls (.pt) -> ONNX sans torch ni onnx : BN fusionnée dans les convolutions,
# protobuf écrit à la main, poids des convolutions quantifiés en int8 par canal (DequantizeLinear, opset 13).
import sys, struct, numpy as np
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import load_pt

# ---------- protobuf minimal ----------
def varint(n):
    out = bytearray()
    while True:
        b = n & 0x7F; n >>= 7
        if n: out.append(b | 0x80)
        else: out.append(b); return bytes(out)
def key(f, wt): return varint((f << 3) | wt)
def f_int(f, v): return key(f, 0) + varint(v if v >= 0 else v + (1 << 64))
def f_bytes(f, b): return key(f, 2) + varint(len(b)) + b
def f_str(f, s): return f_bytes(f, s.encode())
def f_float(f, v): return key(f, 5) + struct.pack('<f', v)

FLOAT, UINT8, INT8, INT64 = 1, 2, 3, 7
def tensor(name, arr):
    arr = np.ascontiguousarray(arr)
    dt = {np.float32: FLOAT, np.int8: INT8, np.uint8: UINT8, np.int64: INT64}[arr.dtype.type]
    b = b''.join(f_int(1, d) for d in arr.shape) + f_int(2, dt) + f_str(8, name) + f_bytes(9, arr.tobytes())
    return b
def attr_i(n, v): return f_str(1, n) + f_int(3, v) + f_int(20, 2)
def attr_f(n, v): return f_str(1, n) + f_float(2, v) + f_int(20, 1)
def attr_ints(n, vs): return f_str(1, n) + b''.join(f_int(8, v) for v in vs) + f_int(20, 7)
def node(op, ins, outs, name, attrs=()):
    return (b''.join(f_str(1, i) for i in ins) + b''.join(f_str(2, o) for o in outs) + f_str(3, name) + f_str(4, op)
            + b''.join(f_bytes(5, a) for a in attrs))
def value_info(name, shape):
    dims = b''.join(f_bytes(1, f_int(1, d) if isinstance(d, int) else f_str(2, d)) for d in shape)
    tt = f_int(1, FLOAT) + f_bytes(2, dims)
    return f_str(1, name) + f_bytes(2, f_bytes(1, tt))

# ---------- graphe ----------
nodes, inits = [], []
uid = [0]
def nm(p): uid[0] += 1; return f'{p}_{uid[0]}'
def P(m, k): return m._parameters[k].astype(np.float32)
def B(m, k): return m._buffers[k].astype(np.float32)

QUANT = os.environ.get('Q','1')=='1'
def conv_block(mod, x, quant=None):
    quant = QUANT if quant is None else quant
    cv, bn = mod._modules['conv'], mod._modules['bn']
    w = P(cv, 'weight'); g, b0 = P(bn, 'weight'), P(bn, 'bias')
    mean, var = B(bn, 'running_mean'), B(bn, 'running_var')
    s = g / np.sqrt(var + bn.eps)
    w = w * s[:, None, None, None]; b = b0 - mean * s
    wn, bn_ = nm('w'), nm('b'); inits.append(tensor(bn_, b.astype(np.float32)))
    if quant:
        sc = np.abs(w).reshape(w.shape[0], -1).max(1) / 127.0; sc[sc == 0] = 1e-8
        q = np.clip(np.round(w / sc[:, None, None, None]), -127, 127).astype(np.int8)
        qn, sn, zn = nm('wq'), nm('ws'), nm('wz')
        inits.extend([tensor(qn, q), tensor(sn, sc.astype(np.float32)), tensor(zn, np.zeros(w.shape[0], np.int8))])
        nodes.append(node('DequantizeLinear', [qn, sn, zn], [wn], nm('dq'), [attr_i('axis', 0)]))
    else:
        inits.append(tensor(wn, w.astype(np.float32)))
    k, st, pd = cv.kernel_size, cv.stride, cv.padding
    y = nm('conv')
    nodes.append(node('Conv', [x, wn, bn_], [y], nm('Conv'), [attr_ints('kernel_shape', k), attr_ints('strides', st),
                       attr_ints('pads', list(pd) * 2), attr_i('group', cv.groups), attr_ints('dilations', cv.dilation)]))
    sg, out = nm('sig'), nm('silu')
    nodes.append(node('Sigmoid', [y], [sg], nm('Sigmoid')))
    nodes.append(node('Mul', [y, sg], [out], nm('Mul')))
    return out

def c2f(mod, x):
    c = mod.c
    y = conv_block(mod._modules['cv1'], x)
    a, b2 = nm('a'), nm('b')
    sp = nm('split'); inits.append(tensor(sp, np.array([c, c], np.int64)))
    nodes.append(node('Split', [y, sp], [a, b2], nm('Split'), [attr_i('axis', 1)]))
    ys = [a, b2]
    for k2, bott in mod._modules['m']._modules.items():
        h = conv_block(bott._modules['cv2'], conv_block(bott._modules['cv1'], ys[-1]))
        if bott.add:
            o = nm('add'); nodes.append(node('Add', [ys[-1], h], [o], nm('Add'))); h = o
        ys.append(h)
    cat = nm('cat'); nodes.append(node('Concat', ys, [cat], nm('Concat'), [attr_i('axis', 1)]))
    return conv_block(mod._modules['cv2'], cat)

def build(pt, out_path, labels_out):
    ck = load_pt.load(pt); m = ck['model']; seq = m._modules['model']._modules
    x = 'images'
    for k2 in [str(i) for i in range(9)]:
        mod = seq[k2]; kind = mod._cls.split('.')[-1]
        x = conv_block(mod, x) if kind == 'Conv' else c2f(mod, x)
    head = seq['9']
    x = conv_block(head._modules['conv'], x)
    p = nm('pool'); nodes.append(node('GlobalAveragePool', [x], [p], nm('GAP')))
    fl = nm('flat'); nodes.append(node('Flatten', [p], [fl], nm('Flatten'), [attr_i('axis', 1)]))
    lin = head._modules['linear']; W, bb = P(lin, 'weight'), P(lin, 'bias')
    # couche finale en int8 par ligne, elle aussi
    sc = np.abs(W).max(1) / 127.0; sc[sc == 0] = 1e-8
    q = np.clip(np.round(W / sc[:, None]), -127, 127).astype(np.int8)
    qn, sn, zn, wn, bn_ = nm('lq'), nm('ls'), nm('lz'), nm('lw'), nm('lb')
    inits.extend([tensor(qn, q), tensor(sn, sc.astype(np.float32)), tensor(zn, np.zeros(W.shape[0], np.int8)), tensor(bn_, bb)])
    nodes.append(node('DequantizeLinear', [qn, sn, zn], [wn], nm('dq'), [attr_i('axis', 0)]))
    lo = nm('logits'); nodes.append(node('Gemm', [fl, wn, bn_], [lo], nm('Gemm'), [attr_i('transB', 1)]))
    nodes.append(node('Softmax', [lo], ['probs'], nm('Softmax'), [attr_i('axis', 1)]))
    graph = (b''.join(f_bytes(1, n) for n in nodes) + f_str(2, 'yolov8n-cls') + b''.join(f_bytes(5, t) for t in inits)
             + f_bytes(11, value_info('images', [1, 3, 224, 224])) + f_bytes(12, value_info('probs', [1, 1000])))
    model = f_int(1, 8) + f_str(2, 'cp360-convert') + f_str(3, '1') + f_bytes(7, graph) + f_bytes(8, f_str(1, '') + f_int(2, 13))
    open(out_path, 'wb').write(model)
    return m.names

if __name__ == '__main__':
    names = build(sys.argv[1], sys.argv[2], None)
    print('ok', len(names))
