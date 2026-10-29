const {chromium}=require(process.env.PLAYWRIGHT_PACKAGE||'C:/Users/Arjen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const out=process.argv[2];fs.mkdirSync(out,{recursive:true});
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const allViews=process.argv.includes('--all-views');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true,args:process.env.BLUE_HOUR_GPU==='swiftshader'?['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']:[]});const results=[];
for(const [name,url] of [['base-a','http://127.0.0.1:5181/?depth=70#2026-09-23-sonar-lake-3d'],['base-b','http://127.0.0.1:5181/?depth=70#2026-09-23-sonar-lake-3d'],['candidate',`http://127.0.0.1:5180/?depth=70#${allViews?'2026-09-23-sonar-lake-3d':'2026-10-29-blue-hour-lake'}`]]){
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.addInitScript(()=>{
   let seed=1234,frameworkSeed=5678,n=0,now=0,id=0;const q=new Map();
   // Supply identical random INPUTS to the actual fish callbacks. Framework UUID
   // allocation is a separate stream; additional presentation objects must not
   // shift the test input sequence. Production Math.random is never changed.
   Math.random=()=>{if(new Error().stack.includes('/fish.js')){n++;seed=(1664525*seed+1013904223)>>>0;return seed/4294967296}frameworkSeed=(1664525*frameworkSeed+1013904223)>>>0;return frameworkSeed/4294967296};
   performance.now=()=>now;
   window.requestAnimationFrame=f=>{q.set(++id,f);return id};window.cancelAnimationFrame=i=>q.delete(i);
   window.__qaTick=()=>{now+=1000/60;const callbacks=[...q.values()];q.clear();callbacks.forEach(f=>f(now));return {n,seed,now}};
 });
 await page.goto(url);
 // Wait for React/ResizeObserver to commit without running a simulation frame.
 // Pumping RAF here made asset startup speed change the first fish timestamp.
 await page.waitForFunction(()=>!!window.__scene && !!window.__fish,null,{polling:50,timeout:120000});
 if(name.startsWith('base')&&!allViews){await page.getByRole('button',{name:'PingLive Mini',exact:true}).click({timeout:10000,noWaitAfter:true});await page.waitForTimeout(100)}
 await page.evaluate(()=>{window.__qaRoot=window.__scene.__r3f.root;const r=__qaRoot.getState();r.setFrameloop('never');r.internal.frames=0;r.clock.elapsedTime=0;window.__qaFrame=0;
   const render=r.gl.render.bind(r.gl);r.gl.render=(sc,cam)=>{sc.traverse(o=>{if(o.material?.uniforms?.uBox0)window.__qaSonarUniforms=o.material.uniforms});return render(sc,cam)};
   r.advance(0,false);});
 await page.waitForTimeout(250);
 // Directly advance the real R3F root. No reimplementation of any sonar/fish logic.
 const views=allViews?[['PL','down'],['PL','forward'],['PL','panoramic'],['PLM','down'],['PLM','forward'],['PLM','combo']]:[['PLM','forward'],['PLM','down'],['PLM','combo']];
 for(const [spot,x,z] of [['default',-6,4],['shelf',-40,-5],['hump',22,8],['deep',4,-40],['lockup',-14,-52.5],['dropoff',-3,-14]]) for(const [device,mode] of views) {
 if(name.startsWith('base')||allViews) {
   if(allViews) await page.getByRole('button',{name:device==='PL'?'PingLive':'PingLive Mini',exact:true}).click({noWaitAfter:true});
   await page.getByRole('button',{name:{forward:'Forward',down:'Down',panoramic:'Panoramic',combo:'Combo'}[mode],exact:true}).click({noWaitAfter:true});
 } else await page.getByRole('combobox',{name:'Mini view'}).selectOption(mode);
 await page.waitForTimeout(100);
 const data=await page.evaluate(({x,z})=>{
   const r=__qaRoot.getState(),s0=__sonarState;
   // React view commits restore the declared frameloop; take back manual
   // control after each commit, in seconds, before advancing either version.
   r.setFrameloop('never');r.internal.frames=0;r.clock.elapsedTime=window.__qaFrame/60;
   s0.boat.x=s0.target.x=x;s0.boat.z=s0.target.z=z;
   for(let i=0;i<30;i++){window.__qaFrame++;r.advance(window.__qaFrame/60,false)}
   const s=__sonarState;const models={boat:s.boat,target:s.target,apex:s.apex,mode:s.mode,device:s.deviceId,range:s.rangeM,depth:s.depthM,specs:s.specs,fish:__fish};
   const fishGPU=[];__scene.traverse(o=>{if(o.isInstancedMesh&&o.layers.mask===8)fishGPU.push({matrix:Array.from(o.instanceMatrix.array),swim:Array.from(o.geometry.attributes.aSwim?.array||[])})});
   const uniforms=Object.fromEntries(Object.entries(__qaSonarUniforms).filter(([k,u])=>!u.value?.isTexture&&!Array.isArray(u.value)).map(([k,u])=>[k,u.value?.toArray?u.value.toArray():u.value]));
   return {models:JSON.parse(JSON.stringify(models)),fishGPU,uniforms,png:__sonarFlat(832,400),time:r.clock.elapsedTime};
 },{x,z});
 const key=`${name}-${spot}-${device}-${mode}`;const png=Buffer.from(data.png.split(',')[1],'base64');fs.writeFileSync(path.join(out,key+'.png'),png);delete data.png;
 results.push({name:key,...data,pngHash:hash(png)});
 }
 await page.close();
}
fs.writeFileSync(path.join(out,'records.json'),JSON.stringify(results,null,2));
const summary=results.map(r=>({name:r.name,pngHash:r.pngHash,modelHash:hash(JSON.stringify(r.models)),fishGPUHash:hash(JSON.stringify(r.fishGPU)),time:r.time}));console.log(summary);fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(summary,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
