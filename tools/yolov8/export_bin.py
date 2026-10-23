# Export YOLOv8n-cls vers un format compact lu par le moteur JavaScript de l'appli :
#  - <nom>.bin : bloc float32 (échelles + biais) puis bloc int8 (poids quantifiés par canal)
#  - <nom>.json : liste des opérations et décalages, libellés ImageNet
import sys, os, json, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import load_pt

F, Q, ops = [], [], []
fo, qo = [0], [0]
cnt = [0]
def nid(p): cnt[0] += 1; return f'{p}{cnt[0]}'
def addf(a):
    a = np.ascontiguousarray(a, np.float32).ravel(); off = fo[0]; F.append(a); fo[0] += a.size; return off
def addq(a):
    a = np.ascontiguousarray(a, np.int8).ravel(); off = qo[0]; Q.append(a); qo[0] += a.size; return off
def P(m, k): return m._parameters[k].astype(np.float32)
def B(m, k): return m._buffers[k].astype(np.float32)

def conv(mod, x, act=True):
    cv, bn = mod._modules['conv'], mod._modules['bn']
    w = P(cv, 'weight'); g, b0 = P(bn, 'weight'), P(bn, 'bias')
    s = g / np.sqrt(B(bn, 'running_var') + bn.eps)
    w = w * s[:, None, None, None]; b = b0 - B(bn, 'running_mean') * s
    sc = np.abs(w).reshape(w.shape[0], -1).max(1) / 127.0; sc[sc == 0] = 1e-8
    q = np.clip(np.round(w / sc[:, None, None, None]), -127, 127)
    assert cv.groups == 1 and cv.kernel_size[0] == cv.kernel_size[1]
    o = nid('t')
    ops.append(dict(t='conv', i=x, o=o, ic=int(w.shape[1]), oc=int(w.shape[0]), k=int(cv.kernel_size[0]),
                    s=int(cv.stride[0]), p=int(cv.padding[0]), w=addq(q), sc=addf(sc), b=addf(b)))
    return o

def c2f(mod, x):
    y = conv(mod._modules['cv1'], x); a, b2 = nid('t'), nid('t')
    ops.append(dict(t='split', i=y, o=[a, b2], c=int(mod.c)))
    ys = [a, b2]
    for bott in mod._modules['m']._modules.values():
        h = conv(bott._modules['cv2'], conv(bott._modules['cv1'], ys[-1]))
        if bott.add:
            o = nid('t'); ops.append(dict(t='add', a=ys[-1], b=h, o=o)); h = o
        ys.append(h)
    c = nid('t'); ops.append(dict(t='cat', i=ys, o=c))
    return conv(mod._modules['cv2'], c)

def main(pt, labels_json, out_dir, name):
    m = load_pt.load(pt)['model']; seq = m._modules['model']._modules
    x = 'images'
    for k in [str(i) for i in range(9)]:
        mod = seq[k]; x = conv(mod, x) if mod._cls.endswith('.Conv') else c2f(mod, x)
    head = seq['9']; x = conv(head._modules['conv'], x)
    g = nid('t'); ops.append(dict(t='gap', i=x, o=g))
    lin = head._modules['linear']; W, bb = P(lin, 'weight'), P(lin, 'bias')
    sc = np.abs(W).max(1) / 127.0; sc[sc == 0] = 1e-8
    q = np.clip(np.round(W / sc[:, None]), -127, 127)
    ops.append(dict(t='fc', i=g, o='logits', n_in=int(W.shape[1]), n_out=int(W.shape[0]), w=addq(q), sc=addf(sc), b=addf(bb)))
    fl = np.concatenate(F).astype('<f4'); qq = np.concatenate(Q).astype(np.int8)
    open(os.path.join(out_dir, name + '.bin'), 'wb').write(fl.tobytes() + qq.tobytes())
    spec = dict(model='yolov8n-cls (Ultralytics, AGPL-3.0)', size=224, nfloat=int(fl.size), nq=int(qq.size), ops=ops,
                labels=json.load(open(labels_json)))
    json.dump(spec, open(os.path.join(out_dir, name + '.json'), 'w'), separators=(',', ':'))
    print('floats', fl.size, 'int8', qq.size, 'ops', len(ops))

if __name__ == '__main__':
    main(*sys.argv[1:5])
