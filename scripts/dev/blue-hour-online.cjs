const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/Arjen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
async function input(){process.stdin.setRawMode?.(true);process.stdin.resume();console.log('Ready for private Site credential on hidden stdin');return new Promise(resolve=>{let s='';const receive=b=>{s+=b.toString();if(s.includes('\n')||s.includes('\r')){process.stdin.off('data',receive);process.stdin.setRawMode?.(false);process.stdin.pause();resolve(s.trim())}};process.stdin.on('data',receive)})}
(async()=>{
const token=await input(),url='https://accuphy-blue-hour-lake-20261029.accuphy-1012.chatgpt.site',out='D:/shopify/output/blue-hour/'+(process.argv.includes('--smoke')?'online-after-shutdown':'online-final');fs.mkdirSync(out,{recursive:true});
const headers={'OAI-Sites-Authorization':'Bearer '+token};
const anon=await fetch(url,{redirect:'manual'});const report={url,checkedAt:new Date().toISOString(),anonymous:{status:anon.status,requiresSignIn:(anon.headers.get('location')||'').includes('signin')},assets:[],viewports:[],authentication:'Sites-supported service access, token retained in memory only; owner browser sign-in flow not tested'};
const manifest=JSON.parse(fs.readFileSync('D:/shopify/output/blue-hour/release-final/manifest.json','utf8'));
report.sourceCommit=manifest.sourceCommit;
const browser=await chromium.launch({channel:'chrome',headless:true});
for(const [width,height]of (process.argv.includes('--smoke')?[[1440,900]]:[[1920,1080],[1440,900],[1024,768],[768,1024],[390,844],[375,812]])){
 const ctx=await browser.newContext({viewport:{width,height},recordVideo:{dir:path.join(out,'video'),size:{width,height}}});
 await ctx.route('**/*',async route=>{const r=route.request();await route.continue(new URL(r.url()).origin===url?{headers:{...r.headers(),...headers}}:{});});
 const p=await ctx.newPage(),errors=[],failed=[];p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>failed.push({url:r.url(),reason:r.failure()?.errorText}));
 const response=await p.goto(url);await p.waitForFunction(()=>{const b=document.querySelector('.bh-steps button');return b&&!b.disabled},null,{timeout:120000});
 if(!report.assets.length)for(const [name,expected] of Object.entries(manifest.assets)){const a=await p.evaluate(async name=>{const r=await fetch('./'+name);const b=await r.arrayBuffer(),hash=await crypto.subtle.digest('SHA-256',b);return {name,status:r.status,bytes:b.byteLength,sha256:Array.from(new Uint8Array(hash)).map(x=>x.toString(16).padStart(2,'0')).join('')}},name);report.assets.push({...a,matchesBuild:a.sha256===expected})}
 await p.getByRole('button',{name:/STEP 1/}).click();await p.waitForTimeout(2500);await p.getByRole('button',{name:/STEP 2/}).click();await p.waitForTimeout(2800);
 await p.getByRole('button',{name:/STEP 3/}).click();const step3Notice=await p.locator('.bh-status').count()?await p.locator('.bh-status').innerText():await p.locator('[role="status"]').allTextContents();
 const scroll=[];for(const sel of ['.bh-canvas','.bh-steps button','.bh-sonar-content','.bh-screen-controls button']){await p.evaluate(()=>window.scrollTo(0,0));await p.locator(sel).first().hover({force:true});const y0=await p.evaluate(()=>scrollY),direction=await p.evaluate(()=>document.documentElement.scrollHeight-innerHeight-scrollY<20?-400:400);await p.mouse.wheel(0,direction);await p.waitForTimeout(200);scroll.push({selector:sel,direction,delta:await p.evaluate(y=>scrollY-y,y0)});}
 await p.evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:path.join(out,`${width}x${height}.png`),fullPage:true});
 await p.reload();await p.waitForFunction(()=>{const b=document.querySelector('.bh-steps button');return b&&!b.disabled},null,{timeout:120000});
 const item={width,height,status:response.status(),step3Notice,scroll,refreshReady:true,canvasCount:await p.locator('canvas').count(),horizontalOverflow:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),brokenImages:await p.evaluate(()=>Array.from(document.images).filter(i=>!i.complete||!i.naturalWidth).map(i=>i.alt||'unnamed')),errors,failed};report.viewports.push(item);console.log(JSON.stringify(item));await ctx.close();
}
await browser.close();fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({anonymous:report.anonymous,assets:report.assets,viewports:report.viewports.length}));
})().catch(e=>{console.error(e.message);process.exit(1)});
