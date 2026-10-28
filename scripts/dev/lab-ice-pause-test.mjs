// Execute IceCamp's actual useFrame callback without a browser or renderer.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import { parseSync } from 'rolldown/experimental'
import * as THREE from 'three'
import * as ice from '../../src/experiments/2026-09-23-sonar-lake-3d/iceScene.js'
import { DEVICES } from '../../src/experiments/2026-09-23-sonar-beam/devices.js'
import { wedgeSpecs } from '../../src/experiments/2026-09-23-beam-shapes-3d/wedge.js'

const sourcePath = 'src/experiments/2026-09-23-sonar-lake-3d/IceCamp.jsx'
const current = fs.readFileSync(new URL('../../' + sourcePath, import.meta.url), 'utf8')
const baseline = execFileSync('git', ['show', `5c576fbc18cc13f979952393a97128b26c7b3ae8:${sourcePath}`], { cwd: new URL('../..', import.meta.url), encoding: 'utf8', windowsHide: true })
const plain = value => JSON.parse(JSON.stringify(value))
function fixture(source) {
  const parsed = parseSync('IceCamp.jsx', source)
  assert.equal(parsed.errors.length, 0)
  const nodes = parsed.program.body.map(node => node.declaration || node)
  const component = nodes.find(node => node.type === 'FunctionDeclaration' && node.id.name === 'IceCamp')
  const calls = component.body.body.filter(node => node.type === 'ExpressionStatement' && node.expression.callee?.name === 'useFrame')
  assert.equal(calls.length, 1)
  const callback = calls[0].expression.arguments[0]
  const constants = {}
  for (const name of ['LIFT', 'DUR', 'ease']) {
    const declaration = nodes.filter(node => node.type === 'VariableDeclaration').flatMap(node => node.declarations).find(node => node.id.name === name)
    constants[name] = new Function(...Object.keys(ice), `return (${source.slice(declaration.init.start, declaration.init.end)})`)(...Object.values(ice))
  }
  const object = () => new THREE.Object3D()
  const fishline = object(), jig = object()
  fishline.userData.tip = new THREE.Vector3(.2, 0, .3)
  fishline.geometry = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(6), 3))
  jig.userData.mat = { emissiveIntensity: 0 }
  const parts = { fishline, jig, auger: object(), rig: object(), head: object(), park: new THREE.Vector3(.7, 0, .3), lean: .2 }
  const state = { current: { boat: { x: 0, z: 0 }, target: { x: 12, z: 4 }, drill: { phase: 'idle', t: 0, opened: false }, holes: [{ x: 0, z: 0, r: ice.HOLE_DRAW_R, live: true }], mode: 'liveice', view: 'top', specs: wedgeSpecs(DEVICES.PLM, 'liveice', 20), apex: new THREE.Vector3() } }
  const uniforms = { uCutC: { value: new THREE.Vector2() }, uCutR: { value: 0 }, uIsland: { value: 0 }, uCutBox: { value: [new THREE.Vector4(), new THREE.Vector4()] }, uBeamOn: { value: 1 }, uLamp: { value: new THREE.Vector4() } }
  const iceMat = { userData: { uniforms } }, beamMats = [{ userData: { uniforms: { uBeamGain: { value: 1 } } } }]
  const reticle = object(), aim = object(), kit = object()
  reticle.userData.rip = { scale: new THREE.Vector3(), material: { opacity: 0 } }
  const camp = { x: -8, z: 5, yaw: 0, lamp: new THREE.Vector3(-7, 2, 4) }
  let now = 10000, holeUpdates = 0, beamUpdates = 0
  const scope = {
    ...ice, ...constants, parts, state, iceMat, beamMats, reticle, aim, kit, camp,
    T: { lamp: 1 }, depthAt: () => 10,
    setHoles: () => { holeUpdates++ }, setBeamUniforms: () => { beamUpdates++ },
    performance: { now: () => now }, presentationTime: { current: { jig: null, reticle: null } },
    glowRef: { current: object() }, campG: { current: object() }, sledG: { current: object() }, lampRef: { current: object() },
    campAt: (x, z, dx, dz) => ({ ...camp, x: x + dx, z: z + dz }),
  }
  const run = new Function(...Object.keys(scope), `return (${source.slice(callback.start, callback.end)})`)(...Object.values(scope))
  const frame = (frameloop, dt, wallTime = now) => { now = wallTime; run({ frameloop }, dt) }
  const snapshot = () => plain({ state: state.current, jigRotation: jig.rotation.toArray(), jigIntensity: jig.userData.mat.emissiveIntensity, jigPosition: jig.position.toArray(), rigY: parts.rig.position.y, augerPosition: parts.auger.position.toArray(), augerRotation: parts.auger.rotation.toArray(), headRotation: parts.head.rotation.toArray(), cutBoxes: uniforms.uCutBox.value.map(v => v.toArray()), reticleScale: reticle.userData.rip.scale.toArray(), holeUpdates, beamUpdates })
  return { state: state.current, frame, snapshot }
}

test('running ice initialization and complete hole hop match baseline, including initial delta=0', () => {
  const before = fixture(baseline), after = fixture(current)
  for (let i = 0; i < 100; i++) {
    const dt = i === 0 || i % 13 === 0 ? 0 : .1
    for (const subject of [before, after]) subject.frame('always', dt, 10000 + i * 100)
    assert.deepEqual(after.snapshot(), before.snapshot(), `frame ${i}`)
  }
  assert.equal(after.state.drill.phase, 'idle')
  assert.equal(after.state.holes.length, 2)
})

test('paused redraw does not start a pending hop or move the wall-clock-driven jig', () => {
  const subject = fixture(current)
  subject.state.target = { ...subject.state.boat }
  subject.state.view = 'section'
  subject.state.hintAnchor = { x: 1, z: 2 }
  subject.frame('always', .016)
  subject.state.target = { x: 12, z: 4 }
  const before = subject.snapshot()
  for (let i = 0; i < 100; i++) subject.frame('never', 0, 20000 + i * 137)
  const after = subject.snapshot()
  assert.equal(after.state.drill.phase, 'idle')
  assert.equal(after.beamUpdates, before.beamUpdates + 100, 'presentation uniforms must still refresh')
  after.beamUpdates = before.beamUpdates
  assert.deepEqual(after, before)
})

test('paused draw does not cross a phase boundary or open a new hole', () => {
  for (const [phase, t] of [['lift', .55], ['move', .9], ['drill', 1.5], ['drop', .7]]) {
    const subject = fixture(current)
    subject.state.drill = { phase, t, opened: false, from: { x: 0, z: 0 }, to: { x: 12, z: 4 }, moveT: .9 }
    const drill = plain(subject.state.drill), boat = plain(subject.state.boat), holes = plain(subject.state.holes)
    subject.frame('never', 0)
    assert.deepEqual(subject.state.drill, drill, phase)
    assert.deepEqual(subject.state.boat, boat, phase)
    assert.deepEqual(subject.state.holes, holes, phase)
  }
})

test('paused mode changes still update cutaway and beam presentation', () => {
  const subject = fixture(current)
  subject.state.target = { ...subject.state.boat }
  subject.frame('always', .016)
  const before = subject.snapshot()
  subject.state.mode = 'forward'
  subject.state.specs = wedgeSpecs(DEVICES.PLM, 'forward', 20)
  subject.frame('never', 0, 30000)
  const after = subject.snapshot()
  assert.notDeepEqual(after.cutBoxes, before.cutBoxes)
  assert.deepEqual(after.state.drill, before.state.drill)
  assert.deepEqual(after.jigRotation, before.jigRotation)
})
