// Private, static sonar QA bundle: existing dev hooks, no HMR or source checkout.
// Scope: model/state and sonar framebuffer (FBO) regression only. Tailwind scans
// the current worktree even for --base, so historical full-screen UI utilities
// may be missing. Compare UI using each version's own original production build.
// node scripts/dev/build-lab-qa.mjs --out ../output/accuphy-baseline/qa-before --base 5c576fb
// node scripts/dev/build-lab-qa.mjs --out ../output/accuphy-baseline/qa-after
import { build } from 'vite'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const workspace = fs.realpathSync(path.dirname(root))
const owner = 'accuphy-static-lab-qa-v1'
const args = process.argv.slice(2)
const options = {}
for (let i = 0; i < args.length; i += 2) {
  if (!['--out', '--base'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) {
    throw new Error('Usage: node scripts/dev/build-lab-qa.mjs --out <workspace-output-directory> [--base <commit>]')
  }
  if (options[args[i]]) throw new Error(`Duplicate option: ${args[i]}`)
  options[args[i]] = args[i + 1]
}
if (!options['--out']) throw new Error('--out is required; output must be inside the workspace and outside the source repository')
const git = (...argv) => execFileSync('git', argv, { cwd: root, maxBuffer: 64 * 1024 * 1024, windowsHide: true })
const textGit = (...argv) => git(...argv).toString('utf8').trim()
const revision = options['--base'] ? textGit('rev-parse', '--verify', '--end-of-options', `${options['--base']}^{commit}`) : null
if (revision && !/^[a-f0-9]{40}$/.test(revision)) throw new Error('Base must resolve to a commit')
const sha256 = value => createHash('sha256').update(value).digest('hex')
const sourceHash = value => sha256(value.toString('utf8').replace(/\r\n/g, '\n'))
const relative = value => path.relative(root, value).split(path.sep).join('/')
const inside = (parent, child) => {
  const rel = path.relative(parent, child)
  return rel !== '' && !rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel)
}
// Resolve existing ancestors too, so a junction/symlink cannot redirect emptyOutDir outside the workspace.
function realDestination(file) {
  if (fs.existsSync(file)) return fs.realpathSync(file)
  return path.join(realDestination(path.dirname(file)), path.basename(file))
}
const outDir = realDestination(path.resolve(root, options['--out']))
if (!inside(workspace, outDir) || outDir === root || inside(root, outDir)) {
  throw new Error(`Unsafe QA output: ${outDir}; choose a directory inside ${workspace}, outside ${root}`)
}
const manifestPath = path.join(outDir, 'qa-build.json')
if (fs.existsSync(outDir) && fs.readdirSync(outDir).length) {
  const previous = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : null
  if (previous?.owner !== owner || previous?.outDir !== outDir) throw new Error(`Refusing to empty an unowned nonempty directory: ${outDir}`)
}

const basePaths = new Set(revision ? textGit('ls-tree', '-r', '--name-only', revision, '--', 'src', 'share', 'public').split('\n') : [])
const readBase = file => git('show', `${revision}:${file}`)
const sourceRecords = new Map()
const assetRecords = new Map()
const sourceFile = file => /^(src|share)\/.+\.(?:[cm]?js|jsx|css|html)$/.test(file)
const scopeFile = file => /^(src|share)\//.test(file)
function readSource(file) {
  if (revision && !basePaths.has(file)) throw new Error(`Baseline cannot import a current-only file: ${file}`)
  const bytes = revision ? readBase(file) : fs.readFileSync(path.join(root, file))
  sourceRecords.set(file, { path: file, sha256Lf: sourceHash(bytes), from: revision || 'WORKTREE' })
  return bytes.toString('utf8')
}
function checkAsset(file) {
  if (assetRecords.has(file)) return
  const bytes = fs.readFileSync(path.join(root, file))
  const record = { path: file, sha256: sha256(bytes), bytes: bytes.length }
  if (revision) {
    if (!basePaths.has(file)) throw new Error(`Baseline asset is absent from Git: ${file}`)
    const baseline = readBase(file)
    record.baseSha256 = sha256(baseline)
    record.matchesBaseBytes = record.sha256 === record.baseSha256
    record.comparison = /\.(svg|txt|json)$/.test(file) ? 'UTF-8 with CRLF normalized to LF' : 'exact bytes'
    record.matchesBase = record.matchesBaseBytes || (/\.(svg|txt|json)$/.test(file) && sourceHash(bytes) === sourceHash(baseline))
    if (!record.matchesBase) throw new Error(`Baseline asset differs from current public/source asset: ${file}`)
  }
  assetRecords.set(file, record)
}
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name)
    if (entry.isSymbolicLink()) throw new Error(`QA asset directory must not contain a symlink: ${file}`)
    return entry.isDirectory() ? walk(file) : [file]
  })
}
for (const file of walk(path.join(root, 'public'))) checkAsset(relative(file))
if (revision) {
  for (const file of basePaths) {
    if (file.startsWith('public/') && !assetRecords.has(file)) throw new Error(`Baseline public asset missing from worktree: ${file}`)
  }
}
const configPath = 'vite.share.config.js'
const configHash = sourceHash(fs.readFileSync(path.join(root, configPath)))
if (revision && configHash !== sourceHash(readBase(configPath))) throw new Error('The share config differs from the base; audit it before comparing QA bundles')

// Runs before the application module only in explicit deterministic QA sessions.
// Keep this harness in generated HTML: production app sources and release builds never import it.
const qaHarness = `<script data-lab-qa-harness>
{
const qaMode = new URLSearchParams(location.search).get('qa');
if (qaMode === '1' || qaMode === 'lockstep') {
  let seed = 20261028;
  let randomCalls = 0;
  Math.random = () => { randomCalls++; seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
  window.__qaNow = 10000;
  performance.now = () => window.__qaNow;
  window.__labEvents = [];
  window.addEventListener('accuphy-lab', event => window.__labEvents.push(event.detail));
  if (qaMode === 'lockstep') {
    const nativeRAF = window.requestAnimationFrame.bind(window);
    const nativeCancelRAF = window.cancelAnimationFrame.bind(window);
    const pending = new Map();
    let nextId = 1, advancing = false, guardedStore = null, originalAdvance = null;
    let ready = false, blockedAdvances = 0, frameCount = 0, initialRandomCalls = null;
    const frames = [];
    window.requestAnimationFrame = callback => { const id = nextId++; pending.set(id, callback); return id; };
    window.cancelAnimationFrame = id => pending.delete(id);
    const getStore = () => window.__scene?.__r3f?.root;
    const freeze = () => {
      const state = getStore()?.getState();
      if (state) { state.internal.active = false; state.internal.frames = 0; }
      return state;
    };
    const nativeTurn = () => new Promise(resolve => nativeRAF(() => setTimeout(resolve, 0)));
    const guard = store => {
      if (guardedStore === store) return;
      if (guardedStore) throw new Error('QA Canvas was replaced; use a fresh navigation for each case');
      guardedStore = store;
      originalAdvance = store.getState().advance;
      store.setState({ advance: (...args) => {
        if (!advancing) { blockedAdvances++; return; }
        return originalAdvance(...args);
      } });
      store.subscribe(freeze);
      freeze();
    };
    const clockRecord = state => ({ elapsedTime: state.clock.elapsedTime, oldTime: state.clock.oldTime, running: state.clock.running, frameloop: state.frameloop });
    window.__qa = {
      nativeRAF, nativeCancelRAF,
      get frameCount() { return frameCount; },
      get randomCalls() { return randomCalls; },
      get randomSeed() { return seed; },
      get pendingRAF() { return pending.size; },
      get blockedAdvances() { return blockedAdvances; },
      frames,
      resetRandom(value = 20261028) {
        if (frameCount) throw new Error('Reset the random stream before the first simulation frame only');
        seed = value >>> 0; randomCalls = 0;
        return { seed, randomCalls };
      },
      async ready(timeoutMs = 15000) {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
          const store = getStore();
          const state = freeze();
          if (store && state?.internal.subscribers.length && Array.isArray(window.__fish) && typeof window.__sonarHist === 'function' && typeof window.__sonarSnap === 'function' && window.__labEvents.some(event => event.event === 'ready')) {
            guard(store);
            const count = state.internal.subscribers.length;
            await nativeTurn(); await nativeTurn();
            freeze();
            if (store.getState().internal.subscribers.length !== count) continue;
            if (store.getState().frameloop !== 'always') store.getState().setFrameloop('always');
            freeze();
            ready = true;
            initialRandomCalls = randomCalls;
            return { ready, frameCount, subscribers: count, fishCount: window.__fish.length, pendingRAF: pending.size, initialRandomCalls, clock: clockRecord(store.getState()) };
          }
          await nativeTurn();
        }
        throw new Error('QA hooks/subscribers did not become ready without rendering');
      },
      step(deltaSeconds = 0) {
        if (!ready) throw new Error('Await __qa.ready() before stepping');
        if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) throw new Error('deltaSeconds must be finite and nonnegative');
        const state = freeze();
        if (getStore() !== guardedStore) throw new Error('QA Canvas changed; reload the case');
        if (state.frameloop !== 'always') throw new Error('Keep the UI running and the page visible; lockstep must use normal running semantics');
        const callsBefore = randomCalls;
        window.__qaNow += deltaSeconds * 1000;
        advancing = true;
        try { state.advance(undefined, false); } finally { advancing = false; freeze(); }
        frameCount++;
        const record = { frameCount, deltaSeconds, now: window.__qaNow, clock: clockRecord(state), randomCalls, frameRandomCalls: randomCalls - callsBefore, randomSeed: seed, subscribers: state.internal.subscribers.length };
        frames.push(record);
        return record;
      },
      async drainUI(turns = 1) {
        if (!ready) throw new Error('Await __qa.ready() first');
        for (let i = 0; i < turns; i++) {
          freeze();
          const batch = [...pending];
          for (const [id, callback] of batch) {
            if (pending.delete(id)) callback(window.__qaNow);
            freeze();
          }
          await nativeTurn();
          freeze();
        }
        return { frameCount, pendingRAF: pending.size, blockedAdvances, randomCalls };
      },
      capture() {
        if (!ready) throw new Error('Await __qa.ready() first');
        const state = freeze();
        const fishMeshes = [];
        window.__scene.traverse(object => {
          const swim = object.geometry?.getAttribute?.('aSwim');
          if (object.isInstancedMesh && swim && object.instanceMatrix) fishMeshes.push({ index: fishMeshes.length, count: object.count, instanceMatrix: Array.from(object.instanceMatrix.array), aSwim: Array.from(swim.array) });
        });
        const sonar = window.__sonarState;
        return {
          frameCount, clock: clockRecord(state), now: window.__qaNow, initialRandomCalls, randomCalls, randomSeed: seed, pendingRAF: pending.size, blockedAdvances,
          fish: JSON.parse(JSON.stringify(window.__fish)), fishMeshes,
          scene: JSON.parse(JSON.stringify({ boat: sonar.boat, target: sonar.target, apex: sonar.apex, holes: sonar.holes, jig: sonar.jig, jigY: sonar.jigY, jigTrail: sonar.jigTrail, drill: sonar.drill, signal: sonar.signal, mode: sonar.mode, deviceId: sonar.deviceId, rangeM: sonar.rangeM, depthM: sonar.depthM, imperial: sonar.imperial, gain: sonar.gain })),
          sonarTime: window.__sonar?.mat?.uniforms?.uTime?.value,
        };
      },
    };
  }
}
}
</script>`

const sourcePlugin = {
  name: 'lab-qa-source-snapshot',
  enforce: 'pre',
  resolveId(specifier, importer) {
    if (!revision || !importer || !specifier.startsWith('.')) return null
    const target = path.resolve(path.dirname(importer.split('?')[0]), specifier.split('?')[0])
    const file = relative(target)
    if (!scopeFile(file)) return null
    // Resolve old extensionless imports against the Git tree, never against newly added current files.
    const candidates = path.extname(file) ? [file] : [file, ...['.mjs', '.js', '.jsx', '.css', '/index.js', '/index.jsx'].map(ext => file + ext)]
    const found = candidates.find(candidate => basePaths.has(candidate))
    if (!found) throw new Error(`Baseline import is absent from Git: ${file} (from ${relative(importer.split('?')[0])})`)
    return path.join(root, found) + (specifier.includes('?') ? '?' + specifier.split('?').slice(1).join('?') : '')
  },
  load(id) {
    const file = relative(id.split('?')[0])
    if (!scopeFile(file)) return null
    if (sourceFile(file)) return readSource(file)
    if (fs.existsSync(path.join(root, file)) && fs.statSync(path.join(root, file)).isFile()) checkAsset(file)
    return null
  },
  transformIndexHtml: {
    order: 'pre',
    handler(html, context) {
      const file = relative(context.filename)
      if (!sourceFile(file)) return html
      return readSource(file).replace('</head>', `<meta name="robots" content="noindex, nofollow">\n${qaHarness}\n</head>`)
    },
  },
}

fs.mkdirSync(outDir, { recursive: true })
await build({
  root,
  configFile: path.join(root, configPath),
  mode: 'production',
  plugins: [sourcePlugin],
  define: { 'import.meta.env.DEV': true },
  build: { outDir, emptyOutDir: true, copyPublicDir: true },
})
const generated = walk(outDir).filter(file => /\.(js|css|html)$/.test(file))
const html = fs.readFileSync(path.join(outDir, 'share/index.html'), 'utf8')
if (html.indexOf('data-lab-qa-harness') < 0 || html.indexOf('data-lab-qa-harness') > html.indexOf('<script type="module"')) throw new Error('QA harness must precede the application module')
const js = generated.filter(file => file.endsWith('.js')).map(file => fs.readFileSync(file, 'utf8')).join('\n')
const hooks = Object.fromEntries(['__sonarState', '__sonarHist', '__sonarSnap'].map(key => [key, js.includes(key)]))
if (Object.values(hooks).some(present => !present)) throw new Error(`Required QA hooks missing: ${JSON.stringify(hooks)}`)
if (js.includes('/@vite/client') || js.includes('import.meta.hot')) throw new Error('Unexpected HMR client in static QA build')
const manifest = {
  owner, createdAt: new Date().toISOString(), root, workspace, outDir,
  revision: revision || 'WORKTREE', head: textGit('rev-parse', 'HEAD'),
  purpose: 'Private model/state and sonar framebuffer (FBO) regression QA; not a release or full-screen UI comparison',
  scope: {
    supported: ['Model/state regression', 'Sonar framebuffer (FBO) regression'],
    excluded: ['Historical full-screen UI/CSS fidelity', 'Production loading-cover comparison'],
    uiComparison: "Use each version's own original production build for UI comparisons.",
  },
  html: 'share/index.html', configPath, configSha256Lf: configHash,
  define: { 'import.meta.env.DEV': true, VITE_NO_GATE: 'inherited from vite.share.config.js' },
  variant: { devices: process.env.VITE_DEVICES || '', scene: process.env.VITE_SCENE || '', lab: process.env.VITE_LAB || '' },
  hooks, hmr: false,
  deterministicHarness: { enabledBy: '?qa=1 or ?qa=lockstep', initialSeed: 20261028, generator: 'LCG: imul(1664525, seed) + 1013904223 modulo 2^32', initialPerformanceNow: 10000, advanceWith: 'qa=1: window.__qaNow = 16000; lockstep: await __qa.ready(); __qa.resetRandom(); __qa.step(0); __qa.step(6)', events: 'window.__labEvents (accuphy-lab detail)', location: 'inline HTML, before application module', lockstep: 'Queues RAF before app initialization; keeps normal always semantics; root automatic frames/advance blocked; capture includes full population and instanced fish matrices/aSwim' },
  limitations: ['Tailwind scans the current worktree for utility candidates even with --base. Baseline CSS source comes from Git, but utilities used only by historical markup may be missing and current-only utilities may be added. Historical full-screen UI CSS may therefore be incomplete; compare UI using each version\'s own original production build.', 'React and dependency packages are the currently installed versions for both snapshots.', 'Serve this output as its own HTTP root so absolute /brand paths resolve. No /__snap POST endpoint is included.'],
  sources: [...sourceRecords.values()].sort((a, b) => a.path.localeCompare(b.path)),
  assets: [...assetRecords.values()].sort((a, b) => a.path.localeCompare(b.path)),
  generated: generated.map(file => ({ path: path.relative(outDir, file).split(path.sep).join('/'), sha256: sha256(fs.readFileSync(file)) })),
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
console.log(JSON.stringify({ outDir, html: path.join(outDir, 'share/index.html'), revision: manifest.revision, hooks, sourceCount: manifest.sources.length, assetCount: manifest.assets.length, manifest: manifestPath }, null, 2))
