// Offline geometry/configuration baseline, NOT a sonar hit or GPU echo test.
// Reads the real source modules; --base loads their Git versions in memory, without a checkout or source edits.
// Usage: node scripts/dev/lab-scene-baseline.mjs --base <commit> --out ../output/accuphy-baseline/scene-contract
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { registerHooks } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const script = fileURLToPath(import.meta.url)
const root = path.resolve(path.dirname(script), '../..')
const sourcePrefix = pathToFileURL(path.join(root, 'src') + path.sep).href
const lake = 'src/experiments/2026-09-23-sonar-lake-3d/'
const sha256 = value => createHash('sha256').update(value).digest('hex')
const jsonHash = value => sha256(JSON.stringify(value))
const lfHash = value => sha256(value.replace(/\r\n/g, '\n'))
const args = process.argv.slice(2)
const valueOf = flag => { const i = args.indexOf(flag); return i < 0 ? null : args[i + 1] }
const git = (...argv) => execFileSync('git', argv, { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, windowsHide: true })

if (args[0] === '--collect') {
  const revision = args[1]
  assert(revision === 'WORKTREE' || /^[a-f0-9]{40}$/.test(revision), 'Collector requires a full commit SHA or WORKTREE')
  // Production .js modules use extensionless relative imports. No shader, business formula, env constant or
  // application source is rewritten. Only the bytes supplied to Node's loader change when reading --base.
  const importedSources = new Map()
  const readSource = relative => revision === 'WORKTREE'
    ? readFileSync(path.join(root, relative), 'utf8')
    : git('show', `${revision}:${relative}`)
  registerHooks({
    resolve(specifier, context, nextResolve) {
      try { return nextResolve(specifier, context) } catch (error) {
        if (!specifier.startsWith('.') || path.extname(specifier)) throw error
        return nextResolve(`${specifier}.js`, context)
      }
    },
    load(url, context, nextLoad) {
      if (!url.startsWith(sourcePrefix) || !url.endsWith('.js')) return nextLoad(url, context)
      const relative = path.relative(root, fileURLToPath(url)).split(path.sep).join('/')
      const source = readSource(relative)
      importedSources.set(relative, lfHash(source))
      return { format: 'module', source, shortCircuit: true }
    },
  })
  // No browser is created and no page/event module is imported. Unexpected network use fails closed.
  globalThis.fetch = () => { throw new Error('Network is forbidden in this offline collector') }
  const load = relative => import(pathToFileURL(path.join(root, relative)).href)
  const THREE = await import('three')
  const { DEVICES, FT } = await load('src/experiments/2026-09-23-sonar-beam/devices.js')
  const { wedgeSpecs, wedgeGeometry } = await load('src/experiments/2026-09-23-beam-shapes-3d/wedge.js')
  const { depthAt, bedY, HALF, DEEP_HOLE } = await load(`${lake}terrain.js`)
  const { makePopulation, fishPose, drawnLen } = await load(`${lake}fish.js`)
  const { buildObstacles, toCircles } = await load(`${lake}obstacles.js`)
  const { TRANSDUCER_OFFSET } = await load(`${lake}boat.js`)
  const { bakeTerrain } = await load(`${lake}sonarMarks.js`)
  const { makeLakeMaterial, setBeamUniforms } = await load(`${lake}lakeMaterial.js`)

  const clocks = [0, 4, 12]
  const rangeFt = 80
  const spots = [
    ['default', -6, 4], ['shelf', -40, -5], ['hump', 22, 8],
    ['deep', 4, -40], ['lockup', -14, -52.5], ['drop-off', -3, -14],
  ]
  const views = [['PL', 'down'], ['PL', 'forward'], ['PL', 'panoramic'], ['PLM', 'down'], ['PLM', 'forward'], ['PLM', 'combo']]
  const obstacles = buildObstacles()
  const circles = toCircles(obstacles)
  // Once per isolated process: makePopulation owns its seeded RNG. Do not reseed/copy its formula.
  const population = makePopulation(bedY, circles)
  assert(population.length > 0 && population.every(f => !f.script), 'Expected normal seeded lake population')
  const populationData = population.map((f, id) => ({ id, ...f, drawnLengthM: drawnLen(f) }))
  const frames = clocks.map(t => {
    const poses = population.map((f, id) => ({ id, species: f.species, ...fishPose(f, t, {}) }))
    assert(poses.every(p => [p.x, p.y, p.z, p.speed, p.heading, p.pitch].every(Number.isFinite)))
    return { elapsedSeconds: t, sha256: jsonHash(poses), poses }
  })

  const terrain = bakeTerrain()
  const terrainBytes = Buffer.from(terrain.tex.image.data.buffer, terrain.tex.image.data.byteOffset, terrain.tex.image.data.byteLength)
  const samples = [[0, 0], [255, 255], [256, 256], [511, 511]].map(([i, j]) => ({
    cell: [i, j], halfFloatBits: terrain.tex.image.data[j * terrain.N + i],
    decodedDepthM: THREE.DataUtils.fromHalfFloat(terrain.tex.image.data[j * terrain.N + i]),
  }))
  const terrainTexture = {
    width: terrain.N, height: terrain.N, worldHalfExtentM: terrain.H, sha256: sha256(terrainBytes),
    byteLength: terrainBytes.length, storage: 'Uint16Array / THREE.HalfFloatType',
    minFilter: terrain.tex.minFilter, magFilter: terrain.tex.magFilter, samples,
  }
  terrain.tex.dispose()

  const specData = s => ({
    a0: s.a0, a1: s.a1, s0: s.s0, s1: s.s1, radiusM: s.R, thicknessRadians: s.theta,
    frame: Object.fromEntries(['c', 'h', 'n'].map(k => [k, s.frame[k].toArray()])), box: s.box ?? null,
  })
  const geometries = views.map(([device, mode]) => {
    const specs = wedgeSpecs(DEVICES[device], mode, rangeFt * FT)
    const fans = specs.map(spec => {
      const geometry = wedgeGeometry(spec)
      geometry.computeBoundingBox()
      const positions = geometry.attributes.position.array
      assert(positions.length > 0 && [...positions].every(Number.isFinite))
      const result = {
        spec: specData(spec), positionCount: geometry.attributes.position.count,
        positionFloat32Sha256: sha256(Buffer.from(positions.buffer, positions.byteOffset, positions.byteLength)),
        boundingBoxM: { min: geometry.boundingBox.min.toArray(), max: geometry.boundingBox.max.toArray() },
      }
      geometry.dispose()
      return result
    })
    return { key: `${device}/${mode}`, device, mode, fixtureRangeFt: rangeFt, fans }
  })

  const material = makeLakeMaterial()
  const beamUniforms = (specs, apex) => {
    setBeamUniforms([material], specs, apex)
    const u = material.userData.uniforms, count = u.uBeamCount.value
    return {
      count,
      ...Object.fromEntries(['uApex', 'uC', 'uH', 'uN', 'uAng', 'uRT', 'uBox']
        .map(k => [k, u[k].value.slice(0, count).map(v => v.toArray())])),
    }
  }
  const locations = spots.map(([name, x, z]) => {
    // Supplied test transform matches the baseline boat group's 0.02 m lift. This is a fixture, not React state.
    const translation = new THREE.Vector3(x, 0.02, z)
    const apex = TRANSDUCER_OFFSET.clone().add(translation)
    return {
      name, fixtureBoatTranslationM: translation.toArray(), fixtureApexM: apex.toArray(),
      terrainDepthAtBoatM: depthAt(x, z), terrainDepthAtApexM: depthAt(apex.x, apex.z),
      bedSamples: [-12, 0, 12].flatMap(dx => [-12, 0, 12].map(dz => ({ x: x + dx, z: z + dz, y: bedY(x + dx, z + dz) }))),
      views: views.map(([device, mode]) => ({
        key: `${device}/${mode}`,
        beamUniforms: beamUniforms(wedgeSpecs(DEVICES[device], mode, rangeFt * FT), apex),
        clocks: frames.map(f => ({ elapsedSeconds: f.elapsedSeconds, worldFishPosesSha256: f.sha256 })),
      })),
    }
  })
  material.dispose()
  const data = {
    unit: 'metres unless named otherwise', feetToMetres: FT, devices: DEVICES,
    fixtureRangeFt: rangeFt, transducerOffsetM: TRANSDUCER_OFFSET.toArray(), lakeHalfExtentM: HALF,
    deepHole: DEEP_HOLE, terrainTexture, obstacleCount: obstacles.length, obstacleSha256: jsonHash(obstacles),
    circleCount: circles.length, circleSha256: jsonHash(circles),
    populationCount: population.length, populationSha256: jsonHash(populationData), population: populationData,
    fishFrames: frames, geometries, locations,
  }
  const evidenceFiles = [`${lake}index.jsx`, `${lake}Scene.jsx`, `${lake}SonarScreen.jsx`, `${lake}sonarShader.js`]
  const result = {
    schemaVersion: 1,
    coverage: {
      description: '实际函数的离线几何/配置基线；没有实现另一套命中判定。',
      spots: spots.length, views: views.length, clocksSeconds: clocks, spotViewClockCases: spots.length * views.length * clocks.length,
      actualFunctions: ['depthAt', 'bedY', 'bakeTerrain', 'buildObstacles', 'toCircles', 'makePopulation', 'fishPose', 'drawnLen', 'wedgeSpecs', 'wedgeGeometry', 'setBeamUniforms'],
      scope: '固定 80 ft 标准扇体；没有运行 index.jsx 的 AUTO / screen-box 裁剪，也没有模拟 React 状态。',
      fishClockScope: '同一新建种群的基础轨道 t=0/4/12；未调用 stepBehaviours、winterCamp 或 jig，不能代表浏览器随机行为历史。',
      notVerified: ['鱼体/鱼中心命中列表', '结构遮挡、first-hit / far-hit', 'GPU echo 亮度、纹理采样与像素', 'index.jsx 最终裁剪与 AUTO 档位', '真实浏览器/手机/冰钓交互', 'Shopify / Meta / Klaviyo 数据送达或历史统计'],
    },
    provenance: {
      source: revision, head: git('rev-parse', 'HEAD').trim(), node: process.version, threeRevision: THREE.REVISION,
      scriptSha256Lf: lfHash(readFileSync(script, 'utf8')),
      requestedPackageLockSha256Lf: lfHash(readSource('package-lock.json')),
      installedDependencyLockSha256Lf: lfHash(readFileSync(path.join(root, 'package-lock.json'), 'utf8')),
      importedSourceSha256Lf: Object.fromEntries([...importedSources].sort(([a], [b]) => a.localeCompare(b))),
      notExecutedSourceSha256Lf: Object.fromEntries(evidenceFiles.map(file => [file, lfHash(readSource(file))])),
    },
    dataSha256: jsonHash(data), data,
  }
  process.stdout.write(JSON.stringify(result))
} else {
  const baseArg = valueOf('--base'), outArg = valueOf('--out')
  assert(baseArg && outArg, 'Usage: node scripts/dev/lab-scene-baseline.mjs --base <commit> --out <directory>')
  const base = git('rev-parse', '--verify', `${baseArg}^{commit}`).trim()
  const collect = revision => {
    const result = spawnSync(process.execPath, [script, '--collect', revision], {
      cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, windowsHide: true,
    })
    assert.equal(result.status, 0, `Collector ${revision} failed: ${result.stderr || result.error || result.stdout}`)
    return JSON.parse(result.stdout)
  }
  const before = collect(base), after = collect('WORKTREE'), repeat = collect('WORKTREE')
  const differences = []
  const diff = (a, b, at = 'data') => {
    if (Object.is(a, b)) return
    if (a && b && typeof a === 'object' && typeof b === 'object' && Array.isArray(a) === Array.isArray(b)) {
      for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) diff(a[key], b[key], `${at}.${key}`)
    } else differences.push({ path: at, before: a ?? null, after: b ?? null })
  }
  diff(before.data, after.data)
  const sourceChanges = []
  for (const group of ['importedSourceSha256Lf', 'notExecutedSourceSha256Lf']) {
    for (const file of new Set([...Object.keys(before.provenance[group]), ...Object.keys(after.provenance[group])])) {
      if (before.provenance[group][file] !== after.provenance[group][file]) sourceChanges.push({ group, file })
    }
  }
  const dependencyLockMatches = before.provenance.requestedPackageLockSha256Lf === after.provenance.installedDependencyLockSha256Lf
  const deterministic = after.dataSha256 === repeat.dataSha256
  const equal = differences.length === 0 && dependencyLockMatches && deterministic
  const comparison = {
    schemaVersion: 1, createdAt: new Date().toISOString(), base,
    result: equal ? 'PASS_GEOMETRY_CONFIG_ONLY' : 'FAIL_GEOMETRY_CONFIG_OR_REPRODUCIBILITY',
    beforeSha256: before.dataSha256, afterSha256: after.dataSha256,
    cases: after.coverage.spotViewClockCases, dependencyLockMatches, deterministic,
    semanticDifferences: differences, sourceChanges,
    limitations: after.coverage,
  }
  const out = path.resolve(root, outArg)
  mkdirSync(out, { recursive: true })
  for (const [name, value] of [['before.json', before], ['after.json', after], ['comparison.json', comparison]]) {
    writeFileSync(path.join(out, name), JSON.stringify(value, null, 2) + '\n')
  }
  const report = [
    '# 场景几何与配置基线', '',
    `结果：${comparison.result}；基线源码 ${base}。`, '',
    `固定 6 个 QA 船位 × 6 个型号/视图 × t=0/4/12，共 ${comparison.cases} 个引用案例。所有视图固定 80 ft，未应用 AUTO 或 index.jsx 屏幕裁剪。`, '',
    `实际函数数据差异 ${differences.length} 项；独立进程重跑一致：${deterministic}；依赖锁文件一致：${dependencyLockMatches}。`, '',
    `种群 ${after.data.populationCount} 条；地形纹理 ${after.data.terrainTexture.width} × ${after.data.terrainTexture.height}。`, '',
    'before.json 通过 Node loader 在内存中读取 git show 的真实模块；after.json 导入工作区实际模块。未改写应用算法，未模拟另一套命中；Three 仅创建 CPU 几何、材质与纹理对象，没有 WebGL renderer。', '',
    'fishFrames 保存完整 fishPose 输出；各位置/视图引用相同固定世界时钟快照。未推进随机行为，因此不能把 t=12 当成真实浏览器运行 12 秒后的鱼行为状态。', '',
    '**这不是 hit / echo 验收通过。** 未输出鱼命中列表；index.jsx 最终裁剪、AUTO 档位、结构遮挡、GPU echo、冰钓和真实交互仍需浏览器核验。', '',
    '详细 hash、顶点数量、包围盒、探头偏移、beam uniforms、固定采样湖底、鱼姿态与差异路径见 JSON。notExecutedSourceSha256Lf 只记录未执行代码的版本，不能证明其运行结果。', '',
    `源码文件 hash 变化 ${sourceChanges.length} 项：${sourceChanges.map(s => s.file).join('；') || '无'}。`, '',
    '本脚本未启动网页、未触发任何 Shopify / Meta / Klaviyo 事件；不证明历史统计或送达。', '',
  ].join('\n')
  writeFileSync(path.join(out, 'report.zh-CN.md'), report)
  console.log(JSON.stringify({ result: comparison.result, output: out, cases: comparison.cases, differences: differences.length, deterministic, dependencyLockMatches, dataSha256: after.dataSha256 }))
  if (!equal) process.exitCode = 1
}
