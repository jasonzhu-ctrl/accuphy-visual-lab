const base='file://'+process.cwd()+'/src/experiments/2026-09-23-sonar-lake-3d/'
const {buildObstacles,toCircles}=await import(base+'obstacles.js');const {bedY,depthAt}=await import(base+'terrain.js')
const c=toCircles(buildObstacles()),a={x:18.99,z:11.47}
for(let x=-4;x<=24;x+=4){let s='';for(let z=-4;z<=4;z+=2){const X=a.x+x,Z=a.z+z,hit=c.filter(k=>Math.hypot(k.x-X,k.z-Z)<k.r+.9&&k.y1>bedY(X,Z)+.5).length;s+=` ${(depthAt(X,Z)/.3048).toFixed(0)}${hit?'*'+hit:''}`}console.log('x+'+x,s)}
