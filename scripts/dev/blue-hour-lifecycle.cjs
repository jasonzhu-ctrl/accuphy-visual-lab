const {chromium}=require(process.env.PLAYWRIGHT_PACKAGE||'C:/Users/Arjen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path');
const hash=o=>crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex');
(async()=>{
 const out=process.argv[2];fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({channel:'chrome',headless:true});
 const p=await b.newPage({viewport:{width:1440,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5180/#2026-10-29-blue-hour-lake');await p.waitForFunction(()=>window.__sonarState?.apex.y<0,null,{timeout:120000});
 const snap=()=>p.evaluate(()=>{const meshes=[];__scene.traverse(o=>{if(o.isInstancedMesh&&o.layers.mask===8)meshes.push({matrix:[...o.instanceMatrix.array],swim:[...o.geometry.attributes.aSwim.array]})});return {fish:__fish,meshes,time:__lakeClock.elapsedTime,boat:{...__sonarState.boat},target:{...__sonarState.target}}});
 await p.getByRole('button',{name:'Pause',exact:true}).click();await p.waitForTimeout(200);const paused=await snap();
 await p.setViewportSize({width:1024,height:768});await p.getByRole('button',{name:'Expand view',exact:true}).click();await p.getByRole('button',{name:'Gain +',exact:true}).click();await p.waitForTimeout(500);const resized=await snap();
 await p.screenshot({path:path.join(out,'paused-resize.png'),fullPage:true});
 await p.getByRole('button',{name:'Resume',exact:true}).click();await p.waitForTimeout(500);const resumed=await snap();
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(500);await p.getByRole('button',{name:/STEP 2/}).click();await p.waitForTimeout(700);const reduced=await snap();
 const result={pauseStable:hash(paused)===hash(resized),pausedTime:paused.time,resizedTime:resized.time,resumedTime:resumed.time,resumeDelta:resumed.time-resized.time,reducedBoat:reduced.boat,reducedTarget:reduced.target,errors};
 fs.writeFileSync(path.join(out,'lifecycle.json'),JSON.stringify(result,null,2));console.log(result);await b.close();
 if(!result.pauseStable||result.resumeDelta<0||result.resumeDelta>2||Math.hypot(reduced.boat.x-22,reduced.boat.z-8)>.01)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
