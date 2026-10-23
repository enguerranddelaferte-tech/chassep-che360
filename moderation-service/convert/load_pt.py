# Lecture d'un checkpoint PyTorch sans torch : objets génériques + tenseurs numpy
import pickle, zipfile, numpy as np, sys, collections
DT={'HalfStorage':np.float16,'FloatStorage':np.float32,'LongStorage':np.int64,'IntStorage':np.int32,'BoolStorage':np.bool_,'ByteStorage':np.uint8,'DoubleStorage':np.float64}
class Obj:
    def __init__(self,*a,**k): self._args=a
    def __setstate__(self,st):
        if isinstance(st,tuple) and len(st)==2 and isinstance(st[1],dict): st={**(st[0] or {}),**st[1]}
        if isinstance(st,dict): self.__dict__.update(st)
        else: self._state=st
    def __repr__(self): return '<%s>'%getattr(self,'_cls','Obj')
def mk(mod,name):
    return type(name,(Obj,),{'_cls':mod+'.'+name})
def load(path):
    z=zipfile.ZipFile(path); root=z.namelist()[0].split('/')[0]
    def rebuild(storage,offset,size,stride,*rest):
        dt,key=storage
        buf=np.frombuffer(z.read(f'{root}/data/{key}'),dtype=dt)
        if not size: return buf[offset:offset+1].reshape(())
        n=int(np.prod(size));arr=buf[offset:offset+ (max((s-1)*st for s,st in zip(size,stride))+1 if n else 0)]
        return np.lib.stride_tricks.as_strided(arr,shape=size,strides=[s*buf.itemsize for s in stride]).copy()
    class U(pickle.Unpickler):
        def find_class(self,mod,name):
            if mod=='torch._utils' and name=='_rebuild_tensor_v2': return rebuild
            if mod=='torch._utils' and name=='_rebuild_parameter': return lambda d,rg,bh: d
            if mod=='collections' and name=='OrderedDict': return collections.OrderedDict
            if mod=='torch' and name in DT: return name
            if mod.startswith('builtins'): return getattr(__builtins__,name) if hasattr(__builtins__,name) else __import__('builtins').__dict__[name]
            return mk(mod,name)
        def persistent_load(self,pid):
            _,stype,key,loc,n=pid
            return (DT[stype],key)
    return U(z.open(f'{root}/data.pkl')).load()
