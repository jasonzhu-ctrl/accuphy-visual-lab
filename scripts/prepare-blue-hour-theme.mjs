// Prepare a reviewable US-only patch from a fresh remote backup. Never uploads.
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
const [backup,out]=process.argv.slice(2)
assert(backup&&out,'Usage: node scripts/prepare-blue-hour-theme.mjs <backup directory> <build directory>')
const meta=JSON.parse(fs.readFileSync(path.join(backup,'manifest.json'),'utf8'))
assert.equal(meta.shop,'bhuekt-nw.myshopify.com');assert.equal(meta.id,'gid://shopify/OnlineStoreTheme/189488890029');assert.equal(meta.role,'UNPUBLISHED')
const filename='templates/index.context.us.json',text=fs.readFileSync(path.join(backup,filename),'utf8')
const source=JSON.parse(text.replace(/^\/\*[\s\S]*?\*\//,'')),next=structuredClone(source)
assert.equal(source.context.market,'us');assert.equal(source.parent,'index.json');assert.equal(source.order[0],'us_mini_interactive_20261028')
next.sections.us_mini_interactive_20261028={type:'accuphy-blue-hour',name:'Blue Hour Lake',settings:{title:'SEE BENEATH THE SURFACE.',subtitle:'BE PART OF THE ACTION.',cta:'Explore PingLive Mini',product_url:'/en-us/products/pinglive-mini'}}
const unchanged=o=>{o=structuredClone(o);delete o.sections.us_mini_interactive_20261028;return o}
assert.deepEqual(unchanged(source),unchanged(next))
const target=path.join(out,'theme',filename);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(next,null,2)+'\n')
const assets=fs.readdirSync(path.join(out,'theme/assets')).map(f=>'assets/'+f)
const report={status:'PREPARED_NOT_UPLOADED',themeId:meta.id,sourceChecksumMd5:meta.templateChecksums.find(f=>f.filename===filename).checksumMd5,localBackupSha256:crypto.createHash('sha256').update(text).digest('hex'),onlyChangedSection:'us_mini_interactive_20261028',unchangedSectionsAndOrder:true,whitelist:[...assets,'sections/accuphy-blue-hour.liquid',filename]}
fs.writeFileSync(path.join(out,'theme-change-manifest.json'),JSON.stringify(report,null,2));console.log(report)
