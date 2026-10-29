const {chromium}=require(process.env.PLAYWRIGHT_PACKAGE||'C:/Users/Arjen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const out=process.argv[2];fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
 for(const [width,height] of [[1920,1080],[1440,900],[1024,768],[768,1024],[390,844],[375,812]]){
 const ctx=await browser.newContext({viewport:{width,height},recordVideo:{dir:path.join(out,'video'),size:{width,height}}});const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5180/#2026-10-29-blue-hour-lake');await p.waitForFunction(()=>window.__sonarState?.apex.y!==undefined && window.__sonarState.apex.y!==0,null,{timeout:120000});
 const state=()=>p.evaluate(()=>{const s=__sonarState;return {boat:{...s.boat},target:{...s.target},apex:{x:s.apex.x,y:s.apex.y,z:s.apex.z},mode:s.mode,fishCount:__fish.length,clock:__lakeClock.elapsedTime}});
 const before=await state();await p.getByRole('button',{name:/STEP 1/}).click();await p.waitForTimeout(100);const during=await state();await p.waitForTimeout(2400);const arrived=await state();
 await p.getByRole('button',{name:/STEP 2/}).click();await p.waitForTimeout(150);await p.getByRole('button',{name:'Move boat left',exact:true}).click();const manual=await state();
 await p.getByRole('button',{name:/STEP 3/}).click();const unavailable=await state();
 await p.getByRole('button',{name:'Reset camera',exact:true}).click();const reset=await state();
 await p.screenshot({path:path.join(out,`${width}x${height}.png`),fullPage:true});
 results.push({width,height,before,during,arrived,manual,unavailable,reset,errors,horizontalOverflow:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});await ctx.close();
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log(results.map(r=>({width:r.width,boatMoved:JSON.stringify(r.before.boat)!==JSON.stringify(r.arrived.boat),mode:r.unavailable.mode,errors:r.errors,overflow:r.horizontalOverflow})));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
