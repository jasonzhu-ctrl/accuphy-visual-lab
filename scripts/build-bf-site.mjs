// Builds the Black Friday site (#213) from clean git checkouts, never the working copy (other chats edit it):
//   /        the locked version (src/experiments/2026-11-03-sonar-lake-bf, lock always on)
//   /base/   the clean base, as the normal build
//   /mini/, /ice/   base, as before; /base/ice/ = a copy of /ice/ (the base's phone ice tiles go to <its path>/ice/)
// Usage: node scripts/build-bf-site.mjs <outDir> [ref]      (ref of the locked version, default HEAD)
//   BASE_REF=<ref>      the commit for /base/, /mini/, /ice/ (default: the same ref)
//   VITE_BF_LIST_ID=W24Qdc   only for HQ's go-live build: the Klaviyo list of the lock (#191). Unset (test links): nothing is sent.
// /embed/ (scripts/build-embed.mjs) is not built here: the store frames lab.accuphy.ca/ itself.
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
  const tmp = path.join(dir, '.out-' + (sub || 'root'))
  sh(`node scripts/build-share.mjs "${tmp}"`, { cwd: dir, env: env(extra) })
  const dest = path.join(outDir, sub)
  fs.mkdirSync(dest, { recursive: true })
  fs.cpSync(path.join(tmp, 'pages'), dest, { recursive: true })
}

fs.rmSync(outDir, { recursive: true, force: true })
fs.mkdirSync(outDir, { recursive: true })
const bfDir = checkout(ref)
if (!fs.existsSync(path.join(bfDir, 'src/experiments/2026-11-03-sonar-lake-bf'))) throw new Error(`no locked version at ${ref}`)
const baseDir = baseRef === ref ? bfDir : checkout(baseRef)
const list = process.env.VITE_BF_LIST_ID
if (!list) delete process.env.VITE_BF_LIST_ID
buildPage(bfDir, { VITE_LAB: 'bf', ...(list ? { VITE_BF_LIST_ID: list } : {}) }, '') // root: its robots.txt, .nojekyll and vercel.json serve the whole site
delete process.env.VITE_BF_LIST_ID
buildPage(baseDir, {}, 'base')
buildPage(baseDir, { VITE_DEVICES: 'PLM' }, 'mini')
buildPage(baseDir, { VITE_SCENE: 'ice' }, 'ice')
fs.cpSync(path.join(outDir, 'ice'), path.join(outDir, 'base/ice'), { recursive: true })
for (const sub of ['base', 'mini', 'ice', 'base/ice']) for (const f of ['vercel.json', 'robots.txt', '.nojekyll']) fs.rmSync(path.join(outDir, sub, f), { force: true })
for (const d of new Set([bfDir, baseDir])) fs.rmSync(d, { recursive: true, force: true })
console.log(`${outDir}: / = locked ${commit(ref)}${list ? ' (list ' + list + ')' : ' (no list: test mode / not open)'}; /base/, /mini/, /ice/, /base/ice/ = base ${commit(baseRef)}`)
