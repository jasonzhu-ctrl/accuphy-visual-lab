// Builds the Lab site with the Black Friday locked version beside the base (#213, layout #228: the marketing version never
// replaces the base), from clean git checkouts, never the working copy (other chats edit it):
//   /, /mini/, /ice/   the base, as the normal builds
//   /mktbf2026/        the locked version (#233: same name as the store page /pages/sonarlab-mktbf2026) (src/experiments/2026-11-03-sonar-lake-bf, lock always on)
//   /mktbf2026/ice/    a copy of the base's /ice/ (the locked page's phone ice tiles go to <its path>/ice/)
// Usage: node scripts/build-bf-site.mjs <outDir> [ref]      (ref of the locked version, default HEAD)
//   BASE_REF=<ref>      the commit for /, /mini/, /ice/ (default: the same ref)
//   VITE_BF_LIST_ID=W24Qdc   only for HQ's go-live build: the Klaviyo list of the lock (#191). Unset (test links): nothing is sent.
// /embed/ (scripts/build-embed.mjs) is not built here.
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const root = process.cwd()
const outDir = path.resolve(process.argv[2] || 'dist-bf')
const ref = process.argv[3] || 'HEAD'
const baseRef = process.env.BASE_REF || ref
const sh = (cmd, opts = {}) => execSync(cmd, { stdio: 'inherit', ...opts })
const commit = (r) => execSync(`git rev-parse --short ${r}`, { encoding: 'utf8' }).trim()

// one clean checkout per commit, with this copy's node_modules linked in
const checkout = (r) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lab-bf-' + commit(r) + '-'))
  sh(`git archive ${r} | tar -x -C "${dir}"`)
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(dir, 'node_modules'))
  return dir
}
const env = (extra) => { const e = { ...process.env, ...extra }; for (const k of ['VITE_LAB', 'VITE_DEVICES', 'VITE_SCENE', 'VITE_COMBO_LOCK']) if (!(k in extra)) delete e[k]; return e }
const buildPage = (dir, extra, sub) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lab-bf-out-')) // outside the checkout: Tailwind would scan a built page there into the next build's CSS
  sh(`node scripts/build-share.mjs "${tmp}"`, { cwd: dir, env: env(extra) })
  const dest = path.join(outDir, sub)
  fs.mkdirSync(dest, { recursive: true })
  fs.cpSync(path.join(tmp, 'pages'), dest, { recursive: true })
  fs.rmSync(tmp, { recursive: true, force: true })
}

fs.rmSync(outDir, { recursive: true, force: true })
fs.mkdirSync(outDir, { recursive: true })
const bfDir = checkout(ref)
if (!fs.existsSync(path.join(bfDir, 'src/experiments/2026-11-03-sonar-lake-bf'))) throw new Error(`no locked version at ${ref}`)
const baseDir = checkout(baseRef) // its own checkout even at the same ref, so the base pages are built as on their own
const list = process.env.VITE_BF_LIST_ID
delete process.env.VITE_BF_LIST_ID
buildPage(baseDir, {}, '') // root: its robots.txt, .nojekyll and vercel.json serve the whole site
buildPage(baseDir, { VITE_DEVICES: 'PLM' }, 'mini')
buildPage(baseDir, { VITE_SCENE: 'ice' }, 'ice')
buildPage(bfDir, { VITE_LAB: 'bf', ...(list ? { VITE_BF_LIST_ID: list } : {}) }, 'mktbf2026')
fs.cpSync(path.join(outDir, 'ice'), path.join(outDir, 'mktbf2026/ice'), { recursive: true })
for (const sub of ['mini', 'ice', 'mktbf2026', 'mktbf2026/ice']) for (const f of ['vercel.json', 'robots.txt', '.nojekyll']) fs.rmSync(path.join(outDir, sub, f), { force: true })
for (const d of [bfDir, baseDir]) fs.rmSync(d, { recursive: true, force: true })
console.log(`${outDir}: /, /mini/, /ice/, /mktbf2026/ice/ = base ${commit(baseRef)}; /mktbf2026/ = locked ${commit(ref)}${list ? ' (list ' + list + ')' : ' (no list: test mode / not open)'}`)
