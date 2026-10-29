import { build } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import postcss from 'postcss'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {execFileSync} from 'node:child_process'
const out=path.resolve(process.argv[2]||'dist/blue-hour');fs.mkdirSync(out,{recursive:true})
await build({configFile:false,plugins:[react(),tailwind()],base:'./',publicDir:false,define:{'process.env.NODE_ENV':'"production"','import.meta.env.VITE_NO_GATE':'"1"'},build:{outDir:out,emptyOutDir:false,lib:{entry:'share/blue-hour.jsx',formats:['es'],fileName:'blue-hour',cssFileName:'blue-hour'},assetsInlineLimit:10000000}})
const hash=b=>crypto.createHash('sha256').update(b).digest('hex')
const cssPath=path.join(out,'blue-hour.css');let css=fs.readFileSync(cssPath,'utf8')
css=css.replace(/url\(["']?\/brand\/([^"')]+)["']?\)/g,(_,f)=>`url(data:font/woff2;base64,${fs.readFileSync(path.join('public/brand',f)).toString('base64')})`)
const scope=':where([data-accuphy-blue-hour])';const ast=postcss.parse(css)
ast.walkRules(r=>{if(r.parent?.type==='atrule'&&/keyframes/.test(r.parent.name))return;r.selectors=r.selectors.map(s=>/^(html|body|:root|:host)(\b|\s|,|$)/.test(s)?s.replace(/^(html|body|:root|:host)/,scope):`${scope} ${s}`)})
fs.writeFileSync(cssPath,ast.toString())
const jsName=`accuphy-blue-hour-${hash(fs.readFileSync(path.join(out,'blue-hour.js'))).slice(0,12)}.js`
const cssName=`accuphy-blue-hour-${hash(fs.readFileSync(cssPath)).slice(0,12)}.css`
fs.renameSync(path.join(out,'blue-hour.js'),path.join(out,jsName));fs.renameSync(cssPath,path.join(out,cssName))
const loader=`import {mount} from './${jsName}';const instances=new Map();function scan(root=document){const els=[...(root.matches?.('[data-accuphy-blue-hour]')?[root]:[]),...root.querySelectorAll('[data-accuphy-blue-hour]')];for(const el of els)if(!instances.has(el))instances.set(el,mount(el));}scan();document.addEventListener('shopify:section:load',e=>scan(e.target));document.addEventListener('shopify:section:unload',e=>{for(const [el,app] of instances)if(e.target.contains(el)){app.unmount();instances.delete(el)}});`
fs.writeFileSync(path.join(out,'accuphy-blue-hour-loader.js'),loader)
fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>ACCUPHY — Blue Hour Lake</title><link rel="stylesheet" href="./${cssName}"><style>body{margin:0;background:#10253d}footer{padding:60px;color:white;font:16px system-ui}</style><div data-accuphy-blue-hour><header style="padding:48px 24px;color:white;text-align:center;font:16px system-ui"><h1>SEE BENEATH THE SURFACE.</h1><p>BE PART OF THE ACTION.</p><p>Interactive simulation. If the lake does not load, explore PingLive Mini.</p><a style="color:white" href="https://shop.accuphy.com/en-us/products/pinglive-mini">Explore PingLive Mini</a></header></div><footer>Interactive simulation. <a style="color:white" href="https://shop.accuphy.com/en-us/products/pinglive-mini">Explore PingLive Mini</a></footer><script type="module" src="./accuphy-blue-hour-loader.js"></script></html>`)
const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();const dirty=!!execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim()
const protectedFiles=execFileSync('git',['ls-files','src/experiments/2026-09-23-sonar-lake-3d/*.js','src/experiments/2026-09-23-sonar-beam/devices.js','src/experiments/2026-09-23-beam-shapes-3d/wedge.js'],{encoding:'utf8'}).trim().split('\n').filter(Boolean)
const protectedSourceHashes=Object.fromEntries(protectedFiles.map(f=>[f,hash(fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n'))]))
const manifest={sourceCommit:sha,dirty,coreVersion:'48f15ccc990fdb69f9edd1a04d14257d100da610',protectedSourceHashes,sourceAssetHashes:Object.fromEntries(['reference/blue-hour/approved.png','src/experiments/2026-09-23-sonar-lake-3d/assets/blue-hour/distant-skyline.png','public/brand/fonts/InstrumentSans-Variable.woff2','public/brand/fonts/Eurostile-Heavy.woff2'].map(f=>[f,hash(fs.readFileSync(f))])),base:'48f15ccc990fdb69f9edd1a04d14257d100da610',targets:['standalone','shopify-us'],assets:Object.fromEntries(fs.readdirSync(out).filter(f=>/\.(js|css)$/.test(f)).map(f=>[f,hash(fs.readFileSync(path.join(out,f)))]))}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));console.log(JSON.stringify(manifest))
const theme=path.join(out,'theme');fs.mkdirSync(path.join(theme,'assets'),{recursive:true});fs.mkdirSync(path.join(theme,'sections'),{recursive:true});fs.mkdirSync(path.join(theme,'locales'),{recursive:true});
for(const f of [jsName,cssName,'accuphy-blue-hour-loader.js'])fs.copyFileSync(path.join(out,f),path.join(theme,'assets',f))
fs.writeFileSync(path.join(theme,'sections/accuphy-blue-hour.liquid'),fs.readFileSync('shopify/sections/accuphy-blue-hour.liquid','utf8').replace('accuphy-blue-hour.css',cssName))
