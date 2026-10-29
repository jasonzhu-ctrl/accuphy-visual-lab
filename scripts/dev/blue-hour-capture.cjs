const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE || 'C:/Users/Arjen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({headless:true, channel:'chrome', args:['--enable-webgl','--ignore-gpu-blocklist']});
  const records=[];
  for(const [width,height] of [[1440,900],[390,844]]) {
    const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:path.join(out,'video'),size:{width,height}}});
    const page=await context.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.goto(process.argv[3] || 'http://127.0.0.1:5180/#2026-09-23-sonar-lake-3d');
    await page.waitForFunction(()=>!!window.__sonarState && !!window.__sonarFlat,{},{timeout:120000});
    await page.waitForTimeout(3500);
    await page.screenshot({path:path.join(out,`${width}.png`)});
    const state=await page.evaluate(()=>{const s=window.__sonarState;return {device:s.deviceId,mode:s.mode,boat:s.boat,target:s.target,apex:s.apex,rangeM:s.rangeM,depthM:s.depthM,fishCount:window.__fish?.length}});
    records.push({width,height,state,errors});
    await context.close();
  }
  fs.writeFileSync(path.join(out,'records.json'),JSON.stringify(records,null,2));
  await browser.close(); console.log(JSON.stringify(records));
})().catch(e=>{console.error(e);process.exit(1)});
