// Executes the actual useFrame callbacks parsed from Scene.jsx, with real Three
// matrices and fish functions. No copied subscriber formulas, DOM or WebGL.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import { parseSync } from 'rolldown/experimental'
import * as THREE from 'three'
import { fishPose, drawnLen, stepBehaviours } from '../../src/experiments/2026-09-23-sonar-lake-3d/fish.js'

const sourcePath = 'src/experiments/2026-09-23-sonar-lake-3d/Scene.jsx'
const current = fs.readFileSync(new URL('../../' + sourcePath, import.meta.url), 'utf8')
const baseline = execFileSync('git', ['show', `5c576fbc18cc13f979952393a97128b26c7b3ae8:${sourcePath}`], { cwd: new URL('../..', import.meta.url), encoding: 'utf8', windowsHide: true })
function subscriber(source, component, scope) {
  const parsed = parseSync('Scene.jsx', source)
  assert.equal(parsed.errors.length, 0)
  const fn = parsed.program.body.find(node => node.type === 'FunctionDeclaration' && node.id.name === component)
  const calls = fn.body.body.filter(node => node.type === 'ExpressionStatement' && node.expression.type === 'CallExpression' && node.expression.callee.name === 'useFrame')
  assert.equal(calls.length, 1, `Review test adapter if ${component} gains another frame callback`)
  const callback = calls[0].expression.arguments[0]
  const code = source.slice(callback.start, callback.end).replaceAll('import.meta.env.DEV', 'false')
  return new Function(...Object.keys(scope), `return (${code})`)(...Object.values(scope))
}
const fishData = () => [
  { species: 'largemouth', len: .5, home: [2, -8, 3], phase: .2, rot: .3, radius: 2, speed: .2 },
  { species: 'walleye', len: .6, home: [-4, -10, 2], phase: 2, rot: .1, radius: 3, speed: .25 },
]
function group(source) {
  const fish = fishData()
  const matrices = []
  const swim = new Float32Array([0, .4, 0, .95, 2.39996, .4, 0, .95])
  const geo = { attributes: { aSwim: { array: swim, needsUpdate: false } } }
  const tmp = { m: new THREE.Matrix4(), q: new THREE.Quaternion(), e: new THREE.Euler(), p: new THREE.Vector3(), s: new THREE.Vector3(), pose: {}, heading: new Float32Array(2), speed: new Float32Array(2), accel: new Float32Array(2), first: true }
  const ref = { current: { setMatrixAt: (i, matrix) => { matrices[i] = matrix.toArray() }, instanceMatrix: { needsUpdate: false } } }
  const smooth01 = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u) }
  const frame = subscriber(source, 'FishGroup', { fish, geo, tmp, ref, fishPose, drawnLen, smooth01 })
  const snapshot = () => structuredClone({ matrices, swim: [...swim], heading: [...tmp.heading], speed: [...tmp.speed], accel: [...tmp.accel], first: tmp.first })
  return { frame, snapshot, tmp, matrices, swim }
}

test('running FishGroup matches the Git baseline, including ordinary initial delta=0', () => {
  const before = group(baseline), after = group(current)
  let elapsed = 0
  for (const dt of [0, .016, .1, 0, .4, .016]) {
    elapsed += dt
    for (const subject of [before, after]) subject.frame({ frameloop: 'always', clock: { elapsedTime: elapsed } }, dt)
    assert.deepEqual(after.snapshot(), before.snapshot())
  }
})

test('paused redraw preserves initialized matrices, tail phase, smoothing and first-frame state', () => {
  const subject = group(current)
  subject.frame({ frameloop: 'always', clock: { elapsedTime: 6 } }, .016)
  const frozen = subject.snapshot()
  for (let i = 0; i < 100; i++) subject.frame({ frameloop: 'never', clock: { elapsedTime: 6 } }, 0)
  assert.deepEqual(subject.snapshot(), frozen)
})

test('initial paused draw initializes visible matrices without consuming the normal first frame', () => {
  const subject = group(current), reference = group(baseline)
  const originalSwim = [...subject.swim]
  subject.frame({ frameloop: 'never', clock: { elapsedTime: 0 } }, 0)
  assert.equal(subject.matrices.length, 2)
  assert(subject.matrices.flat().every(Number.isFinite))
  assert(subject.matrices.every(matrix => matrix[0] !== 0 && matrix[15] === 1))
  assert.deepEqual([...subject.swim], originalSwim)
  assert.equal(subject.tmp.first, true)
  for (const item of [subject, reference]) item.frame({ frameloop: 'always', clock: { elapsedTime: 0 } }, 0)
  assert.deepEqual(subject.snapshot(), reference.snapshot())
})

function behaviours(source) {
  const pop = [{ species: 'salmon', len: .7, home: [0, -8, 0], phase: .2, rot: .3, radius: 2, speed: .2 }]
  let calls = 0, campCalls = 0
  const frame = subscriber(source, 'Fish', {
    window: {}, pop, circles: [], bedY: () => -30, campKey: { current: '' },
    state: { current: { apex: { x: 0, y: -.93, z: 0 } } },
    stepBehaviours: (...args) => { calls++; return stepBehaviours(...args) },
    winterCamp: () => { campCalls++ },
  })
  return { frame, snapshot: () => structuredClone({ pop, calls, campCalls }) }
}

test('paused Fish subscriber runs no behaviours, camp initialization or random draws', () => {
  const subject = behaviours(current)
  const frozen = subject.snapshot()
  const originalRandom = Math.random
  let randomCalls = 0
  Math.random = () => { randomCalls++; return .99 }
  try {
    for (let i = 0; i < 100; i++) subject.frame({ frameloop: 'never', clock: { elapsedTime: 6 } }, 0)
    assert.deepEqual(subject.snapshot(), frozen)
    assert.equal(randomCalls, 0)
  } finally { Math.random = originalRandom }
})

test('running Fish zero-delta initialization and random-call count match the Git baseline', () => {
  const results = []
  const originalRandom = Math.random
  try {
    for (const source of [baseline, current]) {
      const subject = behaviours(source)
      let randomCalls = 0
      Math.random = () => { randomCalls++; return .99 }
      subject.frame({ frameloop: 'always', clock: { elapsedTime: 0 } }, 0)
      results.push({ ...subject.snapshot(), randomCalls })
    }
  } finally { Math.random = originalRandom }
  assert(results[0].calls > 0 && results[0].randomCalls > 0)
  assert.deepEqual(results[1], results[0])
})
