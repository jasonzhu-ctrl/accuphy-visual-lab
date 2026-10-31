# Wreck comparison, app recording vs Lab, on the same boxes and colour classes (2026-10-31 re-measure of the 10-24 gap list).
# usage: python3 -I measure.py <lab burst dir> [more dirs]     (needs numpy pillow scipy; see README.md)
# The app side is reference/vivo-bursts-2026-10-23/pl-down/d00-d19.png (local only, 2504x2312); scale 28.2 px/ft across, 27.75 px/ft down.
import sys, glob, os, numpy as np
from PIL import Image
from scipy import ndimage as nd
REC=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','..','reference','vivo-bursts-2026-10-23','pl-down','d[01][0-9].png')
PXF, PYF = 28.2, 27.75
X=lambda f: int(1128+f*PXF); Y=lambda f:int(f*PYF)
def load(p):
    im=Image.open(p)
    if im.size[0]==2048: im=im.crop((532,0,1516,1024)).resize((2256,2220), Image.BICUBIC)
    else: im=im.crop((124,125,124+2256,125+2220))
    return np.asarray(im.convert('RGB')).astype(float)
def classes(A):
    r,g,b=A[...,0],A[...,1],A[...,2]; W=(r>235)&(g>225)&(b>200); Yl=(r>220)&(g>160)&~W; O=(r>180)&(g>80)&~W&~Yl; R=(r>110)&~W&~Yl&~O; lit=A.sum(-1)>=30; D=lit&~W&~Yl&~O&~R
    c=np.zeros(A.shape[:2],int); c[D]=1; c[R]=2; c[O]=3; c[Yl]=4; c[W]=5; return c
def box(A,x0,y0,x1,y1): return A[Y(y0):Y(y1), X(x0):X(x1)]
def share(A):
    c=classes(A); lit=c>0; n=max(lit.sum(),1); return {'lit%':round(lit.mean()*100), **{k:round((c==i).sum()/n*100,1) for i,k in [(5,'w'),(4,'y'),(3,'o'),(2,'r'),(1,'d')]}}
def analyse(files, tag):
    hullS,botS,cov_h,rim,bands,edges,above,flick,flickL,wat=[],[],[],[],[],[],[],[],[],[]
    prevC=prevL=prevS=None
    for p in files:
        A=load(p); hb=box(A,2,23,38,33); hL=hb.sum(-1)
        lit=hL>=60; sil=nd.binary_opening(nd.binary_closing(lit,np.ones((5,5))),np.ones((3,3)))
        dist=nd.distance_transform_edt(sil)/28.0*12; core=sil&(dist>9)
        if core.sum()>200: v=hL[core]; cov_h.append(v.std()/v.mean())
        rim.append([hL[sil&(dist>a)&(dist<=b)].mean() if (sil&(dist>a)&(dist<=b)).sum()>50 else np.nan for a,b in [(0,2),(2,4),(4,9),(9,18),(18,99)]])
        hullS.append(share(hb)); botS.append(share(box(A,-40,31,-5,36)))
        w=box(A,4,7,38,17); wat.append((w.sum(-1)>=60).mean()*100)
        bb=box(A,-40,25,-5,42).sum(-1); th40=[];w75=[];w15=[];top=[];tail=[];edge=[]
        for j in range(bb.shape[1]):
            col=nd.uniform_filter1d(bb[:,j],3); pk=col.max(); i=col.argmax()
            if pk<150: continue
            th40.append((col>=0.4*pk).sum()/PYF*12); w75.append((col>=0.75*pk).sum()/PYF*12); w15.append((col>=0.15*pk).sum()/PYF*12)
            up=np.where(col[:i]<0.15*pk)[0]; dn=np.where(col[i:]<0.15*pk)[0]
            top.append((i-(up[-1] if len(up) else 0))/PYF*12); tail.append((dn[0] if len(dn) else len(col)-i)/PYF*12)
            e=np.where(col>=0.4*pk)[0]; edge.append(e[0] if len(e) else np.nan)
        bands.append([np.median(th40),np.median(w75),np.median(w15),np.median(top),np.median(tail)]); edges.append(np.array(edge,float))
        dk=box(A,6,18,30,30).sum(-1); ab=[]
        for j in range(dk.shape[1]):
            col=dk[:,j]; e=np.where(col>=250)[0]
            if not len(e): continue
            t=e[0]; seg=col[max(t-int(PYF),0):t]; ab.append((seg>=60).sum()/PYF*12)
        above.append(np.median(ab) if ab else np.nan)
        c=classes(box(A,-40,30,-5,37))
        if prevC is not None:
            m=(c>0)|(prevC>0); flick.append(((c!=prevC)&m).sum()/max(m.sum(),1)*100)
            hm=sil|prevS; flickL.append(np.abs(hL-prevL)[hm].mean()/max(hL[hm].mean(),1))
        prevC=c; prevL=hL; prevS=sil
    m=min(map(len,edges)); E=np.array([e[:m] for e in edges]); emove=np.nanmedian(np.abs(np.diff(E,axis=0)))/PYF*12
    f=lambda xs: np.round(np.nanmean(np.array(xs,float),axis=0),2)
    avg=lambda ds: {k: round(float(np.mean([d[k] for d in ds])),1) for k in ds[0]}
    print(f'=== {tag} ({len(files)} frames)')
    print(' hull classes  ', avg(hullS)); print(' bottom classes', avg(botS))
    print(' hull core CoV %.3f' % np.mean(cov_h))
    print(' hull rim L by depth inside [0-2,2-4,4-9,9-18,18+ in]', f(rim))
    print(' band [>40%% thick, 75%% w, 15%% w, top rise, tail] in', f(bands))
    print(' outline lit in within 1 ft above hull top: %.1f' % np.nanmean(above))
    print(' ping-to-ping: band class change %.0f%%, hull |dL|/L %.2f, band edge move %.1f in' % (np.mean(flick), np.mean(flickL), emove))
    print(' water box x4..38 ft, 7..17 ft deep: lit %.2f%%' % np.mean(wat))
if __name__=='__main__':
    rec=sorted(glob.glob(REC))
    analyse(rec,'APP recording (vivo PL Down)')
    for d in sys.argv[1:]: analyse(sorted(glob.glob(d+'/f*.png')),'LAB today '+d.split('/')[-1])
