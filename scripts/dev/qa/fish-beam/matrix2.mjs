import { createRequire } from 'node:module'
const req=createRequire('/Users/jason_zhujishuaihotmail.com/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/package.json')
const { chromium } = req('playwright-core')
import fs from 'node:fs'
const out=process.argv[2]; fs.mkdirSync(out,{recursive:true}); const cfg=JSON.parse(process.argv[3])
const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--ignore-gpu-blocklist','--use-angle=metal']})
const countFn=async()=>{const m=await import('/src/experiments/2026-09-23-sonar-lake-3d/fish.js'),B=await import('/src/experiments/2026-09-23-sonar-lake-3d/fishBeam.js');const s=window.__sonarState,pop=window.__fish,t=window.__lakeClock.elapsedTime,o={},a=s.apex;const n=s.specs.map(()=>0);let visit=0;for(const f of pop){if(f.act?.kind==='visit')visit++;if(f.species==='smelt'||!f.radius)continue;m.fishPose(f,t,o);s.specs.forEach((sp,k)=>{if(B.inFan(sp,o.x-a.x,o.y-a.y,o.z-a.z))n[k]++})}return {n,visit,t,mode:s.mode,dev:s.deviceId,range:Math.round(s.rangeM/.3048)}}
for(const c of cfg.cases){
 const ctx=await b.newContext(c.phone?{viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:{width:1400,height:900}})
 await ctx.addInitScript(()=>{try{localStorage.setItem('accuphy_sonar_signup_v1','1')}catch{}})
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message))
 await p.goto(`http://localhost:${process.env.PORT||5173}/?${c.q||''}#${c.ice?'2026-10-16-sonar-ice-3d':'2026-09-23-sonar-lake-3d'}`);await p.waitForFunction(()=>window.__lakeClock&&window.__sonarState&&window.__fish,null,{timeout:60000});await p.waitForTimeout(2500)
 try{
 const pickTiles=async()=>{if(c.tiles)for(const name of c.tiles){await p.locator('button.ac-btn,button.ac-view').filter({hasText:new RegExp('^\\s*'+name+'\\s*$')}).first().click({timeout:6000});await p.waitForTimeout(300)}}
 await pickTiles()
 await p.waitForTimeout(800)
 const res=[]
 for(const sp of c.spots){
  if(sp.at) await p.evaluate(([x,z])=>{const s=window.__sonarState;s.dragging=true;s.target.x=x;s.target.z=z},sp.at),await p.waitForTimeout(1500),await p.evaluate(()=>{window.__sonarState.dragging=false}),await pickTiles() // re-select: a step card or anything else may have changed the view (Combo column, 10-31)
  const t0=Date.now(),rec=[];let f1=null,fm=null
  const need=c.min
  for(let i=0;i<sp.secs;i++){const r=await p.evaluate(countFn);rec.push(r);const lo=Math.min(...r.n),hi=Math.max(...r.n);const el=(Date.now()-t0)/1000;if(f1==null&&lo>=1)f1=el;if(fm==null&&lo>=need)fm=el;await p.waitForTimeout(1000)}
  const modes=[...new Set(rec.map(r=>r.mode))];const last=rec.at(-1);res.push({modes,at:sp.at||'open',first0:rec[0].n,first:f1&&+f1.toFixed(0),toMin:fm&&+fm.toFixed(0),end:last.n,visit:last.visit,range:last.range,mode:last.mode})
  await p.screenshot({path:`${out}/${c.name}-${(sp.at||['open']).join('_')}.png`})
 }
 console.log(c.name,JSON.stringify(res),errs.length?JSON.stringify(errs.slice(0,2)):'')
 }catch(e){console.log(c.name,'ERR',String(e).slice(0,160));await p.screenshot({path:`${out}/${c.name}-err.png`})}
 await ctx.close()
}
await b.close()
