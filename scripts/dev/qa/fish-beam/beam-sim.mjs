const base='file://'+process.cwd()+'/src/experiments/2026-09-23-sonar-lake-3d/'
const F=await import(base+'fish.js'),B=await import(base+'fishBeam.js');const {buildObstacles,toCircles}=await import(base+'obstacles.js');const {bedY,depthAt}=await import(base+'terrain.js')
const {wedgeSpecs}=await import('file://'+process.cwd()+'/src/experiments/2026-09-23-beam-shapes-3d/wedge.js');const {DEVICES}=await import('file://'+process.cwd()+'/src/experiments/2026-09-23-sonar-beam/devices.js')
const FT=.3048,circles=toCircles(buildObstacles())
function specsFor(dev,mode,rFt,x,z){const d=depthAt(x,z),D=[20,25,30,35,40,45,50,60,70,80,90,100,110,120,140,160,180,200].find(v=>v>=d/FT/.8)??200
 const R=(rFt||80)*FT,dv=DEVICES[dev];
 if(mode==='down'){const s=wedgeSpecs(dv,'down',D*FT);return s}
 if(mode==='forward'){const s=wedgeSpecs(dv,'forward',R);s[0]={...s[0],R:Math.hypot(R,D*FT)*1.001,box:{xMin:-.25*R,xMax:R,yMax:D*FT}};return s}
 if(mode==='panoramic'){const s=wedgeSpecs(dv,'panoramic',R);s[0]={...s[0],R:1.6*R,box:{xMin:-1e5,xMax:R,yMax:1e5,zMax:.936*R}};return s}
 const rr=[...[20,30,40,50,60,70,80,100,120,150,180,200,240]].filter(v=>v<=Math.min(160,Math.max(40,3*D))).at(-1)*FT,hF=Math.max(D*FT,Math.min(.7*rr,Math.sqrt(.7*rr*1.3*D*FT)));const s=wedgeSpecs(dv,'combo',rr);s[1]={...s[1],R:Math.hypot(rr,hF)*1.001,box:{xMin:-.25*rr,xMax:rr,yMax:hF}};return s}
const min=(dev,m)=>m==='panoramic'?(dev==='PL'?6:4):dev==='PL'?4:3
const spots=[];if(process.env.SPOTS)spots.push(...JSON.parse(process.env.SPOTS));else for(let x=-54;x<=54;x+=12)for(let z=-54;z<=30;z+=12)if(depthAt(x+3,z+.5)>=4)spots.push([x,z])
const only=process.env.VIEWS?process.env.VIEWS.split(','):null
const pct=(a,p)=>{a=a.slice().sort((x,y)=>x-y);return a[Math.min(a.length-1,Math.floor(a.length*p))]}
for(const [dev,m] of [['PLM','down'],['PLM','forward'],['PLM','combo'],['PL','down'],['PL','forward'],['PL','panoramic'],['PLM','panoramic']]){if(only&&!only.includes(dev+'-'+m))continue;const per=[]
 const first=[],full=[];let nofull=0,viol=0,maxv=0;const nearby=[]
 for(const [bx,bz] of spots){let tries=0
  const {makePopulation}=F;const pop=makePopulation(bedY,circles);const apex={x:bx+2.99,y:-.95,z:bz+.47};const specs=specsFor(dev,m,80,apex.x,apex.z),o={};const K=specs.length
  // warm 5s elsewhere: nothing; measure from stop
  let tF=specs.map(()=>null),tM=specs.map(()=>null);const mn=min(dev,m);const dt=1/10
  for(let t=5;t<65;t+=dt){F.stepBehaviours(pop,t,dt,apex,circles,bedY);B.stepBeamFish(pop,t,specs,dev,m,apex,t<5.05,-1.6,circles,bedY)
   for(let k=0;k<K;k++){let n=0;for(const f of pop){if(f.species==='smelt'||!f.radius)continue;F.fishPose(f,t,o);if(B.inFan(specs[k],o.x-apex.x,o.y-apex.y,o.z-apex.z))n++
     if(k==0&&f.act?.kind==='visit'){maxv=Math.max(maxv,o.speed);if(o.y-.12*F.drawnLen(f)-bedY(o.x,o.z)<.05||o.y>-1)viol++}}
    if(n>=1&&tF[k]==null)tF[k]=t-5;if(n>=mn&&tM[k]==null)tM[k]=t-5}}
  for(let k=0;k<K;k++){first.push(tF[k]??99);if(tM[k]==null)nofull++;else full.push(tM[k])}
  per.push(bx+','+bz+':'+tM.map(v=>v==null?'—':v.toFixed(0)).join('/'))
 }
 const all=first.length,w10=[...full].filter(v=>v<=10).length,w15=[...full].filter(v=>v<=15).length,w30=[...full].filter(v=>v<=30).length
 console.log(dev,m,'| ≤10s',(100*w10/all).toFixed(0)+'%','≤15s',(100*w15/all).toFixed(0)+'%','≤30s',(100*w30/all).toFixed(0)+'%','|',first.length,'first p50',pct(first,.5).toFixed(1),'p90',pct(first,.9).toFixed(1),'| min reached',full.length,'/',first.length,'within60s; p50',(pct(full,.5)||0).toFixed(1),'p90',(pct(full,.9)||0).toFixed(1),'| maxV',maxv.toFixed(2),'viol',viol)
 if(process.env.SPOTS)console.log('   ',per.join('  '))
}
