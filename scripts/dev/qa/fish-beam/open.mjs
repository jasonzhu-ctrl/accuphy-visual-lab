const base='file://'+process.cwd()+'/src/experiments/2026-09-23-sonar-lake-3d/'
const F=await import(base+'fish.js'),B=await import(base+'fishBeam.js');const {buildObstacles,toCircles}=await import(base+'obstacles.js');const {bedY,depthAt}=await import(base+'terrain.js')
const {wedgeSpecs}=await import('file://'+process.cwd()+'/src/experiments/2026-09-23-beam-shapes-3d/wedge.js');const {DEVICES}=await import('file://'+process.cwd()+'/src/experiments/2026-09-23-sonar-beam/devices.js')
const FT=.3048,c=toCircles(buildObstacles())
for(const [name,a,ice] of [['desk',{x:-3.01,y:-.95,z:4.47}],['phone',{x:18.99,y:-.95,z:11.47}],['ice',{x:1,y:-.61,z:1},1],['hole',{x:-21,y:-.95,z:-44.5}]]){
 const pop=F.makePopulation(bedY,c);const d=depthAt(a.x,a.z);B.seedBeamFish(pop,0,a,!!ice,ice?-2.5:-1.6,d,c,bedY)
 const D=[20,25,30,35,40,45,50,60,70,80,90,100,110,120,140,160,180,200].find(v=>v>=d/FT/.8)*FT,R=80*FT,rows={}
 for(const dev of ['PL','PLM'])for(const m of ['down','forward','panoramic']){let s=wedgeSpecs(DEVICES[dev],m,m==='down'?D:R);if(m==='forward')s[0]={...s[0],R:Math.hypot(R,D),box:{xMin:-.25*R,xMax:R,yMax:D}};if(m==='panoramic')s[0]={...s[0],R:1.6*R,box:{xMin:-1e5,xMax:R,yMax:1e5,zMax:.936*R}}
  const o={};let min=99;for(let t=0;t<30;t+=.5){let n=0;for(const f of pop){if(f.species==='smelt'||!f.radius)continue;F.fishPose(f,t,o);if(B.inFan(s[0],o.x-a.x,o.y-a.y,o.z-a.z))n++}min=Math.min(min,n)}rows[dev+m]=min}
 console.log(name,Math.round(d/FT)+'ft',JSON.stringify(rows),'seeded',pop.filter(f=>f.act).length)}
