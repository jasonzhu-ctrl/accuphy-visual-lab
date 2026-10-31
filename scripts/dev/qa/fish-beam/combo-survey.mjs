const base = 'file://'+process.cwd()+'/src/experiments/2026-09-23-sonar-lake-3d/'
const { makePopulation, fishPose } = await import(base + 'fish.js')
const { buildObstacles, toCircles } = await import(base + 'obstacles.js')
const { bedY, depthAt } = await import(base + 'terrain.js')
const FT=.3048, d2r=Math.PI/180, HALF=21.5*d2r, TH=9*d2r, TILT=(90-21.5)*d2r
const circles=toCircles(buildObstacles()), pop=makePopulation(bedY,circles).filter(f=>f.radius)
console.log('pop (moving)',pop.length, Object.entries(pop.reduce((a,f)=>(a[f.species]=(a[f.species]||0)+1,a),{})).map(e=>e.join(':')).join(' '))
const STEPS=[20,25,30,35,40,45,50,60,70,80,90,100,110,120,140,160,180,200]
const RS=[20,30,40,50,60,70,80,100,120,150,180,200,240]
const autoD=r=>STEPS.find(v=>v>=r/.8)??200
const comboR=d=>{const w=Math.min(160,Math.max(40,3*d));return RS.filter(v=>v<=w).at(-1)}
const fanHit=(dx,dy,dz,tilt,R,box)=>{const X=dx,Y=-dy,c=Math.atan2(X,Y);if(Math.abs(c-tilt)>HALF)return false
 const u=X*Math.sin(tilt)+Y*Math.cos(tilt);if(Math.abs(dz)>Math.max(.08,u*Math.tan(TH)))return false
 if(Math.hypot(dx,dy,dz)>R)return false; if(box&&(X>box.x||Y>box.y))return false; return true}
function stats(bx,bz,fwdFt,opt={}){const ax=bx+2.99,az=bz+.47,ay=-.95,read=depthAt(ax,az)/FT,D=autoD(read),R=(fwdFt??comboR(D))*FT
 const hF=Math.max(D*FT,Math.min(.7*R,Math.sqrt(.7*R*1.3*D*FT)))
 const o={};let nd=0,nf=0,fd=0,ff=0,either=0,n=0,big=0;const N=opt.N??120
 for(let t=0;t<N*2;t+=2){let cd=0,cf=0,cb=0;for(const f of pop){if(f.species==='smelt'&&!opt.smelt)continue;fishPose(f,t,o);const dx=o.x-ax,dy=o.y-ay,dz=o.z-az
  if(fanHit(dx,dy,dz,0,1.05*D*FT))cd++; if(fanHit(dx,dy,dz,TILT,Math.hypot(R,hF),{x:R,y:hF}))cf++}
  nd+=cd;nf+=cf;if(cd)fd++;if(cf)ff++;if(cd&&cf)either++;n++}
 return {read:+read.toFixed(0),D,R:Math.round(R/FT),down:+(nd/n).toFixed(2),fwd:+(nf/n).toFixed(2),pDown:Math.round(100*fd/n),pFwd:Math.round(100*ff/n),pBoth:Math.round(100*either/n)}}
console.log('desk',JSON.stringify(stats(-6,4)));console.log('phone',JSON.stringify(stats(16,11)));console.log('ice-nocamp',JSON.stringify(stats(1,1)))
for(const R of [40,60,80,100,120,160]) console.log('desk fwd R',R,JSON.stringify(stats(-6,4,R)),'phone',JSON.stringify(stats(16,11,R)))
console.log('smelt incl desk',JSON.stringify(stats(-6,4,null,{smelt:1})),'phone',JSON.stringify(stats(16,11,null,{smelt:1})));const rows=[];for(let x=-54;x<=54;x+=6)for(let z=-54;z<=30;z+=6){if(depthAt(x,z)<3)continue;rows.push({x,z,...stats(x,z,null,{N:60})})}
console.log('grid',rows.length,'median pFwd',rows.map(r=>r.pFwd).sort((a,b)=>a-b)[rows.length>>1],'median pDown',rows.map(r=>r.pDown).sort((a,b)=>a-b)[rows.length>>1],'pBoth>=80:',rows.filter(r=>r.pBoth>=80).length)
console.log(rows.sort((a,b)=>(b.pBoth-a.pBoth)||(b.down+b.fwd-a.down-a.fwd)).slice(0,14).map(r=>JSON.stringify(r)).join('\n'))
