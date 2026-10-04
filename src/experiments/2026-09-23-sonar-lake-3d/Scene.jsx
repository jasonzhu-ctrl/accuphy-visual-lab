import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries as _merge } from 'three/addons/utils/BufferGeometryUtils.js'
// Extrude geometries are non-indexed, primitives are indexed — normalise first.
const mergeGeometries = (parts) => _merge(parts.map((g) => (g.index ? g.toNonIndexed() : g)))
import { HALF, SEG, bedY, fbm } from './terrain'
import { SPECIES, makePopulation, fishPose, stepBehaviours, forceRise, rnd, drawnLen } from './fish'
import { makeLakeMaterial, setBeamUniforms } from './lakeMaterial'
import { wedgeGeometry } from '../2026-09-23-beam-shapes-3d/wedge'
import { makeTallTree, makeBushTree, makeStump, makeLog, makeWeedTuft, makeRock, placeAll } from './vegetation'
import { makeBassBoat, makeWaterContact, TRANSDUCER_OFFSET } from './boat'
import { makeFishGeometry } from './fishGeometry'
import { makeCargoWreck, makeWreckDebris, WRECK_L, BIG_WRECK, SMALL_WRECK } from './wreck'
import { makeLogoGeometry, makePlinthGeometry, logoFrame } from './logo'
import { buildObstacles, toCircles } from './obstacles'
import SonarScreen, { SONAR_HIDE_LAYER, LAKEBED_LAYER, FISH_LAYER, LOGO_LAYER } from './SonarScreen'

// ---------- lakebed ----------
function Lakebed({ mat }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(HALF * 2, HALF * 2, SEG, SEG)
    g.rotateX(-Math.PI / 2)
    const p = g.attributes.position
    const col = new Float32Array(p.count * 3)
    const sand = new THREE.Color('#8f7f5c'), mud = new THREE.Color('#4a4536'), weed = new THREE.Color('#4f6a3a')
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i)
      const y = bedY(x, z)
      p.setY(i, y)
      const t = THREE.MathUtils.clamp((-y - 4) / 16, 0, 1)
      const c = sand.clone().lerp(mud, t)
      const w = fbm(x * 0.12 + 9, z * 0.12 + 2)
      if (-y < 9 && w > 0.62) c.lerp(weed, 0.6)
      c.multiplyScalar(0.9 + 0.2 * fbm(x * 0.5, z * 0.5))
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    g.computeVertexNormals()
    return g
  }, [])
  return <mesh geometry={geo} material={mat} onUpdate={(o) => o.layers.set(LAKEBED_LAYER)} />
}

// ---------- structures ----------
// One InstancedMesh per geometry variant; items are dealt round-robin across variants.
function Instanced({ mat, geos, items, layer }) {
  const refs = useRef([])
  const buckets = useMemo(() => geos.map((_, k) => items.filter((_, i) => i % geos.length === k)), [geos, items])
  useEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3()
    buckets.forEach((list, k) => {
      const mesh = refs.current[k]; if (!mesh) return
      list.forEach((it, i) => {
        e.set(it.tilt || 0, it.rot || 0, (it.tilt || 0) * 0.5); q.setFromEuler(e)
        p.set(it.x, it.y, it.z); sc.set(it.s * (it.sx ?? 1), it.s * (it.sy ?? 1), it.s * (it.sz ?? 1))
        m.compose(p, q, sc); mesh.setMatrixAt(i, m)
      })
      mesh.instanceMatrix.needsUpdate = true
    })
  }, [buckets])
  return geos.map((g, k) => <instancedMesh key={k} ref={(el) => { refs.current[k] = el }} args={[g, mat, Math.max(1, buckets[k].length)]} frustumCulled={false} onUpdate={(o) => { if (layer != null) o.layers.set(layer) }} />)
}
function Structures({ mat }) {
  const geos = useMemo(() => ({
    tall: [0, 1, 2, 3].map(makeTallTree), bush: [0, 1, 2, 3, 4].map(makeBushTree), stump: [makeStump()], log: [makeLog()],
    weed: [makeWeedTuft()], rock: [0, 1, 2].map(makeRock),
  }), [])
  const items = useMemo(placeAll, [])
  return (
    <group>
      <Instanced mat={mat} geos={geos.tall} items={items.tall} />
      <Instanced mat={mat} geos={geos.bush} items={items.bush} />
      <Instanced mat={mat} geos={geos.stump} items={items.stump} />
      <Instanced mat={mat} geos={geos.log} items={items.log.map((it) => ({ ...it, sx: 1, sy: 0.12, sz: 0.12 }))} />
      {/* weeds: soft, diffuse returns — left out of Panoramic's top-down structure map (they drew every tuft as a
          bright clump); the side views and the lake still see them (LAKEBED_LAYER is in both) */}
      <Instanced mat={mat} geos={geos.weed} items={items.weed.map((it) => ({ ...it, sx: 0.8, sz: 0.8 }))} layer={LAKEBED_LAYER} />
      <Instanced mat={mat} geos={geos.rock} items={items.rock} />
    </group>
  )
}

function Wreck({ mat }) {
  const geo = useMemo(() => {
    // ~10 m wooden workboat (Jason 2026-09-24: +30 %, shaped after the PL wreck imaging):
    // hull with a raised bow, a boxy cabin with window openings, a short mast; lying tilted on the bottom
    const L = 9.8
    const shape = new THREE.Shape()
    shape.moveTo(-L / 2, 0); shape.quadraticCurveTo(-L * 0.48, 1.5, -L * 0.3, 1.55); shape.lineTo(L * 0.36, 1.35)
    shape.quadraticCurveTo(L * 0.5, 0.8, L / 2, 0); shape.quadraticCurveTo(L * 0.5, -0.8, L * 0.36, -1.35); shape.lineTo(-L * 0.3, -1.55)
    shape.quadraticCurveTo(-L * 0.48, -1.5, -L / 2, 0)
    const hull = new THREE.ExtrudeGeometry(shape, { depth: 1.7, bevelEnabled: true, bevelSize: 0.2, bevelThickness: 0.2, bevelSegments: 2 })
    hull.rotateX(-Math.PI / 2)
    const bow = new THREE.BoxGeometry(2.2, 0.5, 2.4); bow.translate(L * 0.34, 1.9, 0) // raised foredeck
    const cabin = new THREE.BoxGeometry(3.6, 1.6, 2.2); cabin.translate(-0.6, 2.5, 0)
    const roof = new THREE.BoxGeometry(4.0, 0.15, 2.5); roof.translate(-0.6, 3.35, 0)
    const parts = [hull, bow, cabin, roof]
    for (let i = 0; i < 3; i++) { // window openings read as dark gaps in the sonar picture
      const w = new THREE.BoxGeometry(0.7, 0.6, 2.3); w.translate(-1.7 + i * 1.1, 2.7, 0); parts.push(w)
    }
    const mast = new THREE.CylinderGeometry(0.06, 0.09, 4.5, 6); mast.translate(0.9, 4.5, 0)
    parts.push(mast)
    const g = mergeGeometries(parts)
    const col = new Float32Array(g.attributes.position.count * 3)
    for (let i = 0; i < col.length; i += 3) { const k = 0.9 + Math.random() * 0.2; col[i] = 0.34 * k; col[i + 1] = 0.28 * k; col[i + 2] = 0.2 * k }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [])
  const { x, z, rot } = SMALL_WRECK
  return <mesh geometry={geo} material={mat} position={[x, bedY(x, z) - 0.2, z]} rotation={rot} />
}

// dev (?fishtest): a dock piling 12 m ahead of the ?boat=16,11 apex — the app's reference frame
// (PLM Forward, piling + bait school) so structure brightness/sharpness can be compared like for like
function TestPiling({ mat }) {
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.16, 0.18, 12, 12)
    const col = new Float32Array(g.attributes.position.count * 3)
    for (let i = 0; i < col.length; i += 3) { col[i] = 0.32; col[i + 1] = 0.26; col[i + 2] = 0.18 }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [])
  const x = 31, z = 11.5
  return <mesh geometry={geo} material={mat} position={[x, bedY(x, z) + 5.5, z]} />
}

// The big wreck: a ~40 m steel cargo ship (twice the old workboat, Jason 2026-09-24), listing on the deep
// slope up-and-right, pitched to follow the bottom and settled ~1 m into the mud, with debris around it.
function BigWreck({ mat }) {
  const { geo, debris } = useMemo(() => {
    const geo = makeCargoWreck()
    const d = makeWreckDebris()
    return { geo, debris: d.items }
  }, [])
  const { x, z, yaw, list, scale: k } = BIG_WRECK
  const L = WRECK_L * k
  // follow the slope: bottom height under the bow and the stern
  const ax = Math.cos(yaw), az = -Math.sin(yaw)
  const yBow = bedY(x + ax * L * 0.45, z + az * L * 0.45), yStern = bedY(x - ax * L * 0.45, z - az * L * 0.45)
  const pitch = Math.atan2(yBow - yStern, L * 0.9)
  // dev ?wrecklift=m raises the wreck (imaging tests against the app's 10 m wreck recording)
  const y = (yBow + yStern) / 2 - 1.1 * k + (import.meta.env.DEV ? +((/wrecklift=([\d.]+)/.exec(window.location.search) || [])[1] || 0) : 0)
  return (
    <group>
      <group position={[x, y, z]} rotation-y={yaw} scale={k}>
        <group rotation-z={pitch}>
          <mesh geometry={geo} material={mat} rotation-x={list} />
        </group>
      </group>
      {debris.map((it, i) => {
        // the debris ring turns with the ship (it was laid out for BIG_WRECK.debrisYaw)
        const d = yaw - (BIG_WRECK.debrisYaw ?? yaw), c = Math.cos(d), s = Math.sin(d)
        const dx = x + (it.dx * c + it.dz * s) * k, dz = z + (-it.dx * s + it.dz * c) * k
        return <mesh key={i} geometry={it.g} material={mat} scale={k} rotation-y={d} position={[dx, bedY(dx, dz) + it.lift * k, dz]} />
      })}
    </group>
  )
}

// The Accuphy mark resting on the bottom (logo.js). Its own layer: the main view and the Panoramic top-down
// map see the mesh; the side views (Down / Forward) draw it from its exact plane instead (sonarShader.js),
// because a plate standing in the slice would otherwise only show its near edge.
function Logo({ mat, stoneMat }) {
  const geo = useMemo(makeLogoGeometry, [])
  const plinth = useMemo(makePlinthGeometry, [])
  const { B, q } = useMemo(logoFrame, [])
  return (
    <group position={B} quaternion={q}>
      <mesh geometry={geo} material={mat} onUpdate={(o) => o.layers.set(LOGO_LAYER)} />
      <mesh geometry={plinth} material={stoneMat} />
    </group>
  )
}

// ---------- fish ----------
// Realistic bodies per type — see fishGeometry.js
// Swimming (decision #86, docs/boat-fish-plan.md §3a): each fish gets aSwim = (wave phase, activity, turn bend,
// wavelength) every frame and the vertex shader bends the body (lakeMaterial.js). Body wavelength in body lengths.
const WAVELENGTH = { bass: 0.95, panfish: 0.95, perch: 0.9, walleye: 0.85, salmonid: 0.85, bait: 0.85, pike: 0.8 }
const smooth01 = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u) }
function FishGroup({ mat, body, fish }) {
  const geo = useMemo(() => {
    const g = makeFishGeometry(body)
    const pat = new Float32Array(fish.length), belly = new Float32Array(fish.length * 3), side = new Float32Array(fish.length * 3)
    const c = new THREE.Color()
    fish.forEach((f, i) => {
      const sp = SPECIES[f.species]; pat[i] = sp.pattern
      c.set(sp.belly); belly[i * 3] = c.r; belly[i * 3 + 1] = c.g; belly[i * 3 + 2] = c.b
      c.set(sp.side); side[i * 3] = c.r; side[i * 3 + 1] = c.g; side[i * 3 + 2] = c.b
    })
    g.setAttribute('aPattern', new THREE.InstancedBufferAttribute(pat, 1))
    g.setAttribute('aBelly', new THREE.InstancedBufferAttribute(belly, 3))
    g.setAttribute('aSide', new THREE.InstancedBufferAttribute(side, 3))
    const swim = new Float32Array(fish.length * 4)
    fish.forEach((f, i) => { swim[i * 4] = (i * 2.39996) % (2 * Math.PI); swim[i * 4 + 1] = 0.4; swim[i * 4 + 3] = WAVELENGTH[body] ?? 0.9 }) // tails out of step
    g.setAttribute('aSwim', new THREE.InstancedBufferAttribute(swim, 4).setUsage(THREE.DynamicDrawUsage))
    return g
  }, [body, fish])
  const ref = useRef()
  useEffect(() => {
    const c = new THREE.Color()
    fish.forEach((f, i) => { c.set(SPECIES[f.species].back); ref.current.setColorAt(i, c) })
    ref.current.instanceColor.needsUpdate = true
  }, [fish])
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), e: new THREE.Euler(), p: new THREE.Vector3(), s: new THREE.Vector3(), pose: {},
    heading: new Float32Array(fish.length), speed: new Float32Array(fish.length), accel: new Float32Array(fish.length), first: true }), [fish])
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime, d = Math.min(Math.max(dt, 1e-4), 0.1)
    const fresh = tmp.first || dt > 0.25 // first frame, or back from a pause / hidden tab: no turn rate or slowing to read
    const sw = geo.attributes.aSwim, a = sw.array
    const eK = 1 - Math.exp(-d / 0.4), eB = 1 - Math.exp(-d / 0.25), eA = 1 - Math.exp(-d / 0.3) // smoothing, frame-rate independent
    fish.forEach((f, i) => {
      const o = fishPose(f, t, tmp.pose)
      tmp.e.set(0, o.heading, o.pitch); tmp.q.setFromEuler(tmp.e) // z = pitch: nose up/down on a rise only (the old sin(6t) "wag" here rocked the nose)
      const L = drawnLen(f)
      tmp.p.set(o.x, o.y, o.z); tmp.s.set(L, L, L)
      tmp.m.compose(tmp.p, tmp.q, tmp.s)
      ref.current.setMatrixAt(i, tmp.m)
      // swimming, from the fish's own motion: speed in body lengths per second, turn rate, slowing down
      const U = o.speed, bl = U / L
      let dh = o.heading - tmp.heading[i]; dh -= Math.round(dh / (2 * Math.PI)) * 2 * Math.PI
      const turn = fresh ? 0 : dh / d, dU = fresh ? 0 : (U - tmp.speed[i]) / d
      tmp.heading[i] = o.heading; tmp.speed[i] = U
      tmp.accel[i] += (dU - tmp.accel[i]) * eA
      const coast = tmp.accel[i] < -0.2 * L ? 0.3 : 1 // slowing hard (end of a dart, a burst): the body straightens and glides
      a[i * 4 + 1] += ((0.35 + 0.65 * smooth01(0.05, 1, bl)) * coast - a[i * 4 + 1]) * eK // activity: a gentle sway when slow → full beat at 1 BL/s
      a[i * 4 + 2] += (Math.max(-0.25, Math.min(0.25, -0.3 * turn)) - a[i * 4 + 2]) * eB // the body curves into a quick turn (by turn rate, rad/s); straight when cruising
      a[i * 4] = (a[i * 4] + 2 * Math.PI * Math.min(6, Math.max(1 / Math.sqrt(L), 1.5 * bl)) * d) % (2 * Math.PI) // tail beat 1.5 × BL/s, at least a cruising beat (big fish slower: 0.7 Hz musky, 1.5 Hz smelt)
    })
    tmp.first = false
    ref.current.instanceMatrix.needsUpdate = true
    sw.needsUpdate = true
  })
  return <instancedMesh ref={ref} args={[geo, mat, fish.length]} frustumCulled={false} onUpdate={(o) => o.layers.set(FISH_LAYER)} />
}
function Fish({ mat, state }) {
  const circles = useMemo(() => toCircles(buildObstacles()), [])
  const pop = useMemo(() => makePopulation(bedY, circles), [circles]) // swim loops routed around structure
  if (import.meta.env.DEV) {
    window.__fish = pop // dev: fish population for scene lookups
    window.__chase = (species = 'laketrout') => forceRise(pop, window.__lakeClock?.elapsedTime ?? 0, state.current.apex, species, circles, bedY) // dev: make the nearest fish rise now
  }
  state.current.pop = pop
  // behaviours (fish.js): boat-triggered rises, bass strikes on bait, salmon bursts — before anything reads a pose
  useFrame(({ clock }, dt) => {
    if (import.meta.env.DEV) window.__lakeClock = clock
    stepBehaviours(pop, clock.elapsedTime, Math.min(dt, 0.1), state.current.apex, circles, bedY)
  }, -1)
  const groups = useMemo(() => {
    const by = {}
    pop.forEach((f) => { const b = SPECIES[f.species].body; (by[b] ||= []).push(f) })
    return Object.entries(by)
  }, [pop])
  return groups.map(([body, fish]) => <FishGroup key={body} mat={mat} body={body} fish={fish} />)
}

// ---------- water surface ----------
function Water({ state }) {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uSun: { value: new THREE.Vector3(0.4, 0.8, 0.3).normalize() }, uSky: { value: new THREE.Color('#9cc1cf') }, uBoat: { value: new THREE.Vector3(0, 0, 0) }, uWake: { value: 0 } },
    vertexShader: /* glsl */ `
      uniform float uTime; uniform vec3 uBoat; uniform float uWake; varying vec3 vW; varying vec3 vN;
      void main() {
        vec3 p = position;
        float w = 0.06 * sin(p.x * 0.6 + uTime * 0.9) + 0.05 * sin(p.z * 0.8 - uTime * 0.7) + 0.03 * sin((p.x + p.z) * 1.7 + uTime * 1.6);
        // wake: rings spreading from the boat while it moves (plane is rotated: local x,y ↔ world x,-z)
        float dB = length(vec2(p.x - uBoat.x, -p.y - uBoat.z));
        w += uWake * 0.22 * sin(dB * 2.0 - uTime * 5.0) * exp(-dB / 6.0);
        p.y += w;
        float dx = 0.036 * cos(p.x * 0.6 + uTime * 0.9) + 0.051 * cos((p.x + p.z) * 1.7 + uTime * 1.6);
        float dz = 0.04 * cos(p.z * 0.8 - uTime * 0.7) + 0.051 * cos((p.x + p.z) * 1.7 + uTime * 1.6);
        vN = normalize(vec3(-dx, 1.0, -dz));
        vec4 wp = modelMatrix * vec4(p, 1.0); vW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float; varying vec3 vW; varying vec3 vN; uniform vec3 uSun; uniform vec3 uSky; uniform float uTime;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
      void main() {
        // fine ripple detail on top of the big waves
        float t = uTime;
        float n1 = vnoise(vW.xz * 0.9 + vec2(t * 0.25, -t * 0.2));
        float n2 = vnoise(vW.xz * 2.7 - vec2(t * 0.4, t * 0.3));
        vec3 N = normalize(vN + vec3((n1 - 0.5) * 0.35 + (n2 - 0.5) * 0.18, 0.0, (n2 - 0.5) * 0.35 + (n1 - 0.5) * 0.18));
        vec3 v = normalize(cameraPosition - vW);
        float fres = pow(1.0 - max(dot(v, N), 0.0), 3.0);
        vec3 deep = vec3(0.14, 0.47, 0.56), sky = vec3(0.66, 0.80, 0.88);
        vec3 h = normalize(uSun + v);
        float spec = pow(max(dot(N, h), 0.0), 90.0);
        float glitter = smoothstep(0.55, 0.95, vnoise(vW.xz * 6.0 + vec2(t * 0.6, t * 0.5)));
        vec3 col = mix(deep, sky, fres * 0.8) + spec * (0.35 + 0.9 * glitter);
        // a touch of surface texture so it reads as a surface from above
        col += (n2 - 0.5) * 0.05;
        float alpha = 0.36 + 0.42 * fres;
        float dist = length(vW - cameraPosition);
        float fog = smoothstep(120.0, 420.0, dist);
        gl_FragColor = vec4(mix(col, uSky, fog), mix(alpha, 1.0, fog));
      }
    `,
  }), [])
  useFrame(({ clock }, dt) => {
    mat.uniforms.uTime.value = clock.elapsedTime
    const s = state.current
    const speed = Math.hypot(s.target.x - s.boat.x, s.target.z - s.boat.z)
    mat.uniforms.uBoat.value.set(s.boat.x, 0, s.boat.z)
    mat.uniforms.uWake.value += (Math.min(1, speed / 3) - mat.uniforms.uWake.value) * Math.min(1, dt * 3)
  })
  return (
    <mesh rotation-x={-Math.PI / 2} material={mat} onUpdate={(o) => o.layers.set(SONAR_HIDE_LAYER)}>
      <planeGeometry args={[900, 900, 90, 90]} />
    </mesh>
  )
}

// ---------- boat + device + beams ----------
function Boat({ state, beamMats }) {
  const boat = useMemo(makeBassBoat, [])
  const contact = useMemo(makeWaterContact, [])
  const group = useRef(), ride = useRef()
  useFrame(({ clock }, dt) => {
    const s = state.current
    s.boat.x += (s.target.x - s.boat.x) * Math.min(1, dt * 4)
    s.boat.z += (s.target.z - s.boat.z) * Math.min(1, dt * 4)
    group.current.position.set(s.boat.x, 0.02, s.boat.z)
    s.apex.copy(TRANSDUCER_OFFSET).add(group.current.position)
    setBeamUniforms(beamMats, s.specs, s.apex)
    // visual only (#88): a gentle bob — heave ±4 cm on the phases of the water's wave shading, roll ±0.9°, pitch ±0.6°.
    // (The water surface itself stays flat: its shader shifts vertices within the plane.) The beam apex above stays
    // where it was, so the sonar picture does not jitter; the foam stays on the water.
    const t = clock.elapsedTime, bx = s.boat.x
    ride.current.position.y = 0.026 * Math.sin(t * 0.9 + bx * 0.6) + 0.013 * Math.sin(t * 1.6 + bx * 1.7)
    ride.current.rotation.set(0.016 * Math.sin(t * 0.83 + 0.6), 0, 0.011 * Math.cos(t * 0.9 + bx * 0.6))
    const speed = Math.hypot(s.target.x - s.boat.x, s.target.z - s.boat.z) * 4 // m/s (the boat closes on the target at 4/s)
    const fm = contact.userData.foam.uniforms
    fm.uTime.value = t
    fm.uFoam.value += (Math.min(1, speed / 3) - fm.uFoam.value) * Math.min(1, dt * 3)
  })
  return (
    <group ref={group} onUpdate={(g) => g.traverse((o) => o.layers.set(SONAR_HIDE_LAYER))}>
      <group ref={ride}><primitive object={boat} /></group>
      <primitive object={contact} />
    </group>
  )
}
function Beams({ state }) {
  const group = useRef()
  const specs = state.current.specs
  const meshes = useMemo(() => specs.map((spec) => {
    const g = wedgeGeometry(spec)
    return { g, e: new THREE.EdgesGeometry(g, 25) }
  }), [specs])
  useEffect(() => () => meshes.forEach((m) => { m.g.dispose(); m.e.dispose() }), [meshes]) // AUTO depth rebuilds the PL Forward curtain
  useFrame(() => { group.current.position.copy(state.current.apex) })
  return (
    <group ref={group} onUpdate={(g) => g.traverse((o) => o.layers.set(SONAR_HIDE_LAYER))}>
      {meshes.map((m, i) => (
        <group key={i}>
          <mesh geometry={m.g}>
            <meshPhysicalMaterial color="#5fd3ff" transparent opacity={0.11} side={THREE.DoubleSide} depthWrite={false} roughness={0.3} />
          </mesh>
          <lineSegments geometry={m.e}><lineBasicMaterial color="#dff7ff" transparent opacity={0.6} /></lineSegments>
        </group>
      ))}
    </group>
  )
}

// ---------- camera + picking ----------
// Desktop view: from the south, drop-off timber on the left, rock hump on the right. On narrow (phone) screens the
// same view direction is pulled back until ~LAKE_W metres of lake fit across the screen, so the boat is small and
// the whole beam footprint shows (Jason 2026-10-03: 船应该更小一点 … zoom out); the lake is centred in the part of
// the screen above the phone frame (view offset), and fog is thinned by the same factor so the lake stays as clear.
const CAM_T = new THREE.Vector3(3, -9, 0), CAM_D = new THREE.Vector3(-17, 61, 66) // desktop target, camera − target
const LAKE_W = 50 // Jason 2026-10-03: 70 m made the boat a little too small — a middle value
const FOG = { near: 160, far: 420, cam: 400 }
// dev aid ?cam=fish:<species>[:<index>][:top|:side|:tq] — top: from above, nose up the screen (shows the body wave);
// side: broadside, level with the fish; tq: three-quarter, above and to one side, turning with the fish; none: the old fixed offset
const FISH_CAM_VIEW = import.meta.env.DEV ? (/cam=fish:\w+(?::\d+)?:(top|side|tq)/.exec(window.location.search) || [])[1] : undefined
// dev aid ?cam=boat[:side|:bow|:stern|:top|:under] — the boat from several angles (none: the old stern-quarter view)
const BOAT_CAM_VIEW = import.meta.env.DEV ? (/cam=boat:(side|bow|stern|top|under)/.exec(window.location.search) || [])[1] : undefined
const BOAT_CAMS = { // camera offset from the boat, look-at offset from the boat
  side: [[0.4, 1.7, 10.5], [0, 0.15, 0]], bow: [[8.5, 2.6, 6], [0, 0.1, 0]], stern: [[-8.5, 2.4, -5.5], [0, 0.2, 0]],
  top: [[0.01, 13.5, 0], [0, 0, 0]], under: [[5.5, -2.6, 5.5], [0, -0.2, 0]],
}
function Rig({ state, sonarRect, fogMats }) {
  const { camera, size, scene } = useThree()
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])
  const k0 = useRef(0)
  useFrame(({ clock }, dt) => {
    const s = state.current
    const aspect = size.width / size.height
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const k = Math.max(1, LAKE_W / (2 * tanV * aspect * CAM_D.length())) // 1 on desktop and landscape tablets
    // lake band = the screen above the phone frame on portrait phones (the frame and panel cover the rest)
    const fr = sonarRect?.current?.dock || sonarRect?.current?.frame
    const bandBottom = k > 1 && fr ? Math.max(size.height * 0.35, Math.min(size.height, fr.getBoundingClientRect().top)) : size.height
    const devCam = s.fishCam || s.logoCam || s.wreckCam || s.closeCam
    const offY = devCam ? 0 : Math.round(size.height / 2 - bandBottom / 2)
    if (offY > 0) { if (!camera.view?.enabled || camera.view.offsetY !== offY || camera.view.fullWidth !== size.width || camera.view.fullHeight !== size.height) camera.setViewOffset(size.width, size.height, 0, offY, size.width, size.height) }
    else if (camera.view?.enabled) camera.clearViewOffset()
    if (k !== k0.current) { // thin the fog and push the far plane with the camera distance
      k0.current = k
      for (const m of fogMats) { const u = m.userData.uniforms.uFogDensity; u.base ??= u.value; u.value = u.base / k }
      if (scene.fog) { scene.fog.near = FOG.near * k; scene.fog.far = FOG.far * k }
      camera.far = FOG.cam * k; camera.updateProjectionMatrix()
    }
    // drag hint follows the boat until the first drag, kept inside the screen
    if (s.hintEl) {
      tmp.set(s.boat.x, 0.6, s.boat.z).project(camera)
      const hw = (s.hintEl.offsetWidth || 160) / 2 + 8
      const px = Math.min(size.width - hw, Math.max(hw, ((tmp.x + 1) / 2) * size.width))
      const py = Math.max((s.hintEl.offsetHeight || 34) + 54, ((1 - tmp.y) / 2) * size.height - (k > 1 ? 22 : 46))
      s.hintEl.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) translate(-50%, -100%)`
      s.hintEl.style.opacity = s.hasDragged ? '0' : '1'
    }
    // fixed 3/4 aerial view like the PL animations; slight parallax from the pointer
    const px = s.parallax.x, py = s.parallax.y
    if (s.fishCam && s.pop) { // dev aid ?cam=fish:<species> — follow one fish, on the fishes' own clock
      const list = s.pop.filter((x) => x.species === s.fishCam)
      const f = list[Math.min(list.length - 1, s.fishCamIndex || 0)]
      if (f) {
        const o = fishPose(f, clock.elapsedTime, {})
        const L = drawnLen(f), ch = Math.cos(o.heading), sh = Math.sin(o.heading)
        if (FISH_CAM_VIEW === 'top') { camera.up.set(ch, 0, -sh); camera.position.set(o.x, o.y + L * 2.6, o.z) }
        else if (FISH_CAM_VIEW === 'side') { camera.up.set(0, 1, 0); camera.position.set(o.x + sh * L * 2.4, o.y + L * 0.25, o.z + ch * L * 2.4) }
        else if (FISH_CAM_VIEW === 'tq') { camera.up.set(0, 1, 0); camera.position.set(o.x + sh * L * 1.5 - ch * L * 0.5, o.y + L * 1.5, o.z + ch * L * 1.5 + sh * L * 0.5) }
        else { camera.up.set(0, 1, 0); camera.position.set(o.x + L * 0.3, o.y + L * 0.35, o.z + L * 2.4) }
        camera.lookAt(o.x, o.y, o.z)
        return
      }
    }
    if (s.logoCam) { // dev aid ?cam=logo — the lakebed lockup, seen from its face side
      const { B } = logoFrame()
      camera.position.set(B.x - 3, B.y + 9, B.z + 35)
      camera.lookAt(B.x, B.y + 2.2, B.z)
      return
    }
    if (s.wreckCam) { // dev aid ?cam=wreck — inspect the big wreck
      const a = performance.now() / 9000, { x: wx, z: wz } = BIG_WRECK
      camera.position.set(wx + Math.cos(a) * 30, -12, wz + Math.sin(a) * 30)
      camera.lookAt(wx, -36, wz)
      return
    }
    if (s.closeCam) { // dev aid ?cam=boat — inspect the boat / fish up close
      const v = BOAT_CAMS[BOAT_CAM_VIEW]
      if (v) {
        if (BOAT_CAM_VIEW === 'top') camera.up.set(0, 0, -1); else camera.up.set(0, 1, 0) // top: bow to the right of the screen
        camera.position.set(s.boat.x + v[0][0], v[0][1], s.boat.z + v[0][2])
        camera.lookAt(s.boat.x + v[1][0], v[1][1], s.boat.z + v[1][2])
        return
      }
      camera.position.set(s.boat.x - 6 + px, 3.5 + py * 0.5, s.boat.z + 9)
      camera.lookAt(s.boat.x + 1, -0.6, s.boat.z)
      return
    }
    // view from the south (desktop exactly as before); phones: pulled back, re-centred on a step preset's boat
    const fx = k > 1 && s.frameX != null ? s.frameX : CAM_T.x
    s.camX = s.camX == null ? fx : s.camX + (fx - s.camX) * Math.min(1, dt * 2.5)
    const pk = k > 1 ? 0 : 1 // no pointer parallax on phones (a dragging finger would shake the view)
    look.set(s.camX + px * 2 * pk, CAM_T.y, CAM_T.z)
    camera.position.set(look.x + CAM_D.x * k + px * 2 * pk, CAM_T.y + CAM_D.y * k + py * 2 * pk, CAM_T.z + CAM_D.z * k + px * 2 * pk)
    camera.lookAt(look)
  })
  return null
}
function PickPlane({ state }) {
  const onDown = (e) => { e.stopPropagation(); state.current.dragging = true; state.current.hasDragged = true; e.target.setPointerCapture?.(e.pointerId); move(e) }
  const move = (e) => {
    const s = state.current
    if (!s.dragging) return
    s.target.x = THREE.MathUtils.clamp(e.point.x, -58, 58)
    s.target.z = THREE.MathUtils.clamp(e.point.z, -58, 58)
  }
  const onUp = () => { state.current.dragging = false }
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0.02} onPointerDown={onDown} onPointerMove={move} onPointerUp={onUp} onPointerCancel={onUp}>
      <planeGeometry args={[HALF * 2, HALF * 2]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
    </mesh>
  )
}

// paused: the sign-up gate is open — stop the render loop so the lake and the sonar picture freeze
export default function LakeScene({ state, sonarRect, paused = false }) {
  const mats = useMemo(() => {
    const fish = makeLakeMaterial({ fish: true })
    fish.userData.uniforms.uHighlight.value.set('#ffe9a0') // fish light up warm, like a sonar return
    fish.userData.uniforms.uFogDensity.value = 0.006
    fish.side = THREE.DoubleSide // flat fins
    return { bed: makeLakeMaterial(), inst: makeLakeMaterial({ structure: true }), steel: makeLakeMaterial({ steel: true }), logo: makeLakeMaterial({ logo: true }), fish }
  }, [])
  const beamMats = useMemo(() => [mats.bed, mats.inst, mats.steel, mats.fish, mats.logo], [mats])
  return (
    <Canvas frameloop={paused ? 'never' : 'always'} dpr={[1, 1.5]} camera={{ fov: 38, near: 0.5, far: 400, position: [-38, 34, 54] }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <color attach="background" args={['#9cc1cf']} />
      <fog attach="fog" args={['#9cc1cf', 160, 420]} />
      <hemisphereLight args={['#dbe9f0', '#2a3a2a', 0.9]} />
      <directionalLight position={[40, 80, 30]} intensity={1.4} />
      <Lakebed mat={mats.bed} />
      <mesh rotation-x={-Math.PI / 2} position-y={-47} onUpdate={(o) => o.layers.set(SONAR_HIDE_LAYER)}><planeGeometry args={[900, 900]} /><meshBasicMaterial color="#17545f" /></mesh>
      <Structures mat={mats.inst} />
      <Wreck mat={mats.steel} />
      <BigWreck mat={mats.steel} />
      <Logo mat={mats.logo} stoneMat={mats.inst} />
      {import.meta.env.DEV && /fishtest/.test(window.location.search) && <TestPiling mat={mats.inst} />}
      <Fish mat={mats.fish} state={state} />
      <Water state={state} />
      <Boat state={state} beamMats={beamMats} />
      <Beams key={state.current.specKey} state={state} />
      <PickPlane state={state} />
      <Rig state={state} sonarRect={sonarRect} fogMats={beamMats} />
      <SonarScreen state={state} rect={sonarRect} lakeMats={beamMats} />
    </Canvas>
  )
}
