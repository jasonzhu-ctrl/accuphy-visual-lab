import { createRequire } from 'node:module'
const req=createRequire('/Users/jason_zhujishuaihotmail.com/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/package.json')
const { chromium } = req('playwright-core')
import fs from 'node:fs'
const out=process.argv[2];fs.mkdirSync(out,{recursive:true})
const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--ignore-gpu-blocklist','--use-angle=metal']})
const ctxOf=(ph)=>b.newContext(ph?{viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:{width:1728,height:1000}})
const load=async(q,ph,ice)=>{const c=await ctxOf(ph);await c.addInitScript(()=>{try{localStorage.setItem('accuphy_sonar_signup_v1','1')}catch{}});const p=await c.newPage();const e=[];p.on('pageerror',x=>e.push(x.message));await p.goto(`http://localhost:${process.env.PORT||5173}/?${q}#${ice?'2026-10-16-sonar-ice-3d':'2026-09-23-sonar-lake-3d'}`);await p.waitForTimeout(6000);return{c,p,e}}
const snap=async(p,f)=>{const d=await p.evaluate(()=>window.__sonarSnap(768,384));fs.writeFileSync(f,Buffer.from(d.split(',')[1],'base64'))}
const spots=[[-6,4],[-40,-5],[22,8],[4,-40],[-14,-52.5],[-3,-14]],views=[['PingLive','Down'],['PingLive','Forward'],['PingLive','Panoramic'],['PingLive Mini','Down'],['PingLive Mini','Forward'],['PingLive Mini','Combo']]
for(const [tag,q] of [['off','beamfish=off'],['on','']]){const {c,p,e}=await load(q);
 for(const [d,v] of views){await p.getByRole('button',{name:d,exact:true}).first().click();await p.waitForTimeout(300);await p.getByRole('button',{name:v}).first().click();await p.waitForTimeout(600)
  for(const [i,s] of spots.entries()){await p.evaluate(([x,z])=>{const s=window.__sonarState;s.target.x=x;s.target.z=z},s);await p.waitForTimeout(tag==='on'?9000:1800);await snap(p,`${out}/${tag}-${d.replace(' ','')}-${v}-${i}.png`)}}
 console.log('grid',tag,'errs',e.length,e[0]||'');await c.close()}
// ice grid
for(const [tag,q] of [['off','beamfish=off'],['on','']])for(const v of ['Live Ice','Combo','Forward','Down']){const {c,p,e}=await load(q,false,true);if(v!=='Live Ice')await p.getByRole('button',{name:v}).first().click();await p.waitForTimeout(3000);await snap(p,`${out}/ice-${tag}-${v.replace(' ','')}.png`);if(e.length)console.log('ice err',e[0]);await c.close()}
// sheet shots: phone-frame page, same seed on/off, 8 s after open
for(const [nm,t] of [['MiniDown',['PingLive Mini','Down']],['MiniForward',['PingLive Mini','Forward']],['MiniCombo',['PingLive Mini','Combo']],['PLForward',[]]])for(const [tag,q] of [['before','beamfish=off'],['after','']]){const {c,p}=await load(q);for(const n of t){await p.getByRole('button',{name:n,exact:n.startsWith('Ping')}).first().click();await p.waitForTimeout(400)}await p.waitForTimeout(2500);await p.screenshot({path:`${out}/sheet-${nm}-${tag}.png`});await c.close()}
for(const [tag,q] of [['before','beamfish=off'],['after','']]){const {c,p}=await load(q,false,true);await p.getByRole('button',{name:'Combo'}).first().click();await p.waitForTimeout(2500);await p.screenshot({path:`${out}/sheet-IceCombo-${tag}.png`});await c.close()}
await b.close()
