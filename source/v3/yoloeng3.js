/* ----- Moteur d’inférence YOLOv8n-cls en JavaScript pur (aucune dépendance) ----- */
/* Modèle : Ultralytics YOLOv8n-cls (ImageNet, licence AGPL-3.0), converti par l’équipe 360° : BN fusionnée, poids int8 par canal. */
/* Écrit pour tourner dans un Web Worker : la fonction ne dépend d’aucune variable extérieure. */
function S3YoloEngine(spec,buffer){
  var nf=spec.nfloat,F=new Float32Array(buffer,0,nf),Q=new Int8Array(buffer,nf*4,spec.nq);
  /* poids déquantifiés une fois pour toutes */
  var layers=spec.ops.map(function(op){
    if(op.t==="conv"){
      var n=op.oc*op.ic*op.k*op.k,per=op.ic*op.k*op.k,w=new Float32Array(n);
      for(var oc=0;oc<op.oc;oc++){var s=F[op.sc+oc];for(var j=0;j<per;j++)w[oc*per+j]=Q[op.w+oc*per+j]*s}
      return {op:op,w:w,b:F.subarray(op.b,op.b+op.oc)};
    }
    if(op.t==="fc"){
      var w2=new Float32Array(op.n_out*op.n_in);
      for(var r=0;r<op.n_out;r++){var s2=F[op.sc+r];for(var c=0;c<op.n_in;c++)w2[r*op.n_in+c]=Q[op.w+r*op.n_in+c]*s2}
      return {op:op,w:w2,b:F.subarray(op.b,op.b+op.n_out)};
    }
    return {op:op};
  });
  function conv(L,x){
    var op=L.op,k=op.k,s=op.s,p=op.p,C=x.c,H=x.h,W=x.w,OC=op.oc;
    var OH=Math.floor((H+2*p-k)/s)+1,OW=Math.floor((W+2*p-k)/s)+1,HW=H*W,OHW=OH*OW;
    var out=new Float32Array(OC*OHW),inp=x.d,w=L.w,b=L.b;
    for(var oc=0;oc<OC;oc++){
      var ob=oc*OHW,bv=b[oc];
      for(var j=0;j<OHW;j++)out[ob+j]=bv;
      if(k===1&&s===1&&p===0){
        for(var ic=0;ic<C;ic++){var wv=w[oc*C+ic],ib=ic*HW;if(wv===0)continue;for(var t=0;t<HW;t++)out[ob+t]+=wv*inp[ib+t]}
        continue;
      }
      for(var ic2=0;ic2<C;ic2++){
        var ibase=ic2*HW,wb=(oc*C+ic2)*k*k;
        for(var ky=0;ky<k;ky++)for(var kx=0;kx<k;kx++){
          var wv2=w[wb+ky*k+kx];if(wv2===0)continue;
          var ox0=Math.max(0,Math.ceil((p-kx)/s)),ox1=Math.min(OW-1,Math.floor((W-1+p-kx)/s));
          for(var oy=0;oy<OH;oy++){
            var iy=oy*s+ky-p;if(iy<0||iy>=H)continue;
            var ri=ibase+iy*W+kx-p,ro=ob+oy*OW;
            for(var ox=ox0;ox<=ox1;ox++)out[ro+ox]+=wv2*inp[ri+ox*s];
          }
        }
      }
    }
    for(var z=0;z<out.length;z++){var v=out[z];out[z]=v/(1+Math.exp(-v))}
    return {d:out,c:OC,h:OH,w:OW};
  }
  return function run(chw){
    var T={images:{d:chw,c:3,h:spec.size,w:spec.size}};
    for(var i=0;i<layers.length;i++){
      var L=layers[i],op=L.op,x,hw;
      if(op.t==="conv")T[op.o]=conv(L,T[op.i]);
      else if(op.t==="split"){x=T[op.i];hw=x.h*x.w;T[op.o[0]]={d:x.d.subarray(0,op.c*hw),c:op.c,h:x.h,w:x.w};T[op.o[1]]={d:x.d.subarray(op.c*hw,2*op.c*hw),c:op.c,h:x.h,w:x.w}}
      else if(op.t==="add"){var a=T[op.a],bb=T[op.b],r=new Float32Array(a.d.length);for(var q=0;q<r.length;q++)r[q]=a.d[q]+bb.d[q];T[op.o]={d:r,c:a.c,h:a.h,w:a.w}}
      else if(op.t==="cat"){var parts=op.i.map(function(n){return T[n]}),tot=0,cc=0;parts.forEach(function(pp){tot+=pp.d.length;cc+=pp.c});var cat=new Float32Array(tot),off=0;parts.forEach(function(pp){cat.set(pp.d,off);off+=pp.d.length});T[op.o]={d:cat,c:cc,h:parts[0].h,w:parts[0].w}}
      else if(op.t==="gap"){x=T[op.i];hw=x.h*x.w;var g=new Float32Array(x.c);for(var c3=0;c3<x.c;c3++){var sm=0;for(var t3=0;t3<hw;t3++)sm+=x.d[c3*hw+t3];g[c3]=sm/hw}T[op.o]={d:g,c:x.c,h:1,w:1}}
      else if(op.t==="fc"){x=T[op.i];var lo=new Float32Array(op.n_out);for(var rr=0;rr<op.n_out;rr++){var acc=L.b[rr],wo=rr*op.n_in;for(var cc2=0;cc2<op.n_in;cc2++)acc+=L.w[wo+cc2]*x.d[cc2];lo[rr]=acc}T[op.o]={d:lo}}
    }
    var lg=T.logits.d,mx=-1e30;for(var m=0;m<lg.length;m++)if(lg[m]>mx)mx=lg[m];
    var se=0,pr=new Float32Array(lg.length);for(var m2=0;m2<lg.length;m2++){pr[m2]=Math.exp(lg[m2]-mx);se+=pr[m2]}
    for(var m3=0;m3<lg.length;m3++)pr[m3]/=se;
    return pr;
  };
}
