import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { labEvent } from './embed'
import { mergeGeometries as _merge } from 'three/addons/utils/BufferGeometryUtils.js'
// Extrude geometries are non-indexed, primitives are indexed — normalise first.
const mergeGeometries = (parts) => _merge(parts.map((g) => (g.index ? g.toNonIndexed() : g)))
import { HALF, SEG, bedY, fbm, depthAt, ROCK_HUMPS } from './terrain'
import { SPECIES, makePopulation, fishPose, stepBehaviours, forceRise, forceJig, winterCamp, rnd, drawnLen } from './fish'
import { makeLakeMaterial, setBeamUniforms } from './lakeMaterial'
import { wedgeGeometry } from '../2026-09-23-beam-shapes-3d/wedge'
import { makeTallTree, makeBushTree, makeStump, makeLog, makeWeedTuft, placeAll } from './vegetation'
import { makeRockGeometry, ROCK_KINDS } from './rocks'
import { makeBassBoat, makeWaterContact, TRANSDUCER_OFFSET } from './boat'
import { makeFishGeometry } from './fishGeometry'
import { makeCargoWreck, makeWreckDebris, makeWorkboat, WRECK_L, BIG_WRECK, SMALL_WRECK } from './wreck'
import { makeLogoGeometry, makePlinthGeometry, logoFrame } from './logo'
import { buildObstacles, toCircles } from './obstacles'
import SonarScreen, { SONAR_HIDE_LAYER, LAKEBED_LAYER, FISH_LAYER, LOGO_LAYER } from './SonarScreen'
// the ice scene (Jason 2026-10-16): the same lake frozen over — iceScene.js has the story and the presets
import { IceSky, IceSheet, IceCamp, IceWalls, Snowfall, IcePick, LightShaft, MarineSnow, SectionFaces } from './IceCamp'
import { makeIceMaterial } from './iceSheet'
import { bakeTerrain } from './sonarMarks'
import { iceParams, ICE_CAM_T, ICE_CAM_D, ICE_LAKE_W, ICE_FOG, UNDER_CAM, SECTION_CAM, SECTION_CAM_PHONE, ICE_T, dir } from './iceScene'

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
    // rocks (rocks.js, #131): the six kinds; small ones at 320 triangles, the few big ones (s ≥ 1.2) at 1280
    weed: [makeWeedTuft()], rock: ROCK_KINDS.flatMap((k) => [makeRockGeometry(k, 0, 2), makeRockGeometry(k, 2, 2)]), rockBig: ROCK_KINDS.map((k) => makeRockGeometry(k, 1, 3)),
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
      <Instanced mat={mat} geos={geos.rock} items={items.rock.filter((it) => it.s < 1.2)} />
      <Instanced mat={mat} geos={geos.rockBig} items={items.rock.filter((it) => it.s >= 1.2)} />
    </group>
  )
}

function Wreck({ mat, at }) {
  const geo = useMemo(() => makeWorkboat(), []) // the ~10 m wooden workboat (wreck.js, #155): hull, decks, wheelhouse with windows
  const { x, z, rot, scale = 1 } = at || SMALL_WRECK
  // it lay on the flat basin floor; on the #92 slope it follows the bottom (its up axis turned to the bed's normal,
  // averaged over the hull's length), so neither end floats or digs in
  const tilt = useMemo(() => {
    const e = 3, n = new THREE.Vector3(bedY(x - e, z) - bedY(x + e, z), 2 * e, bedY(x, z - e) - bedY(x, z + e)).normalize()
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n)
  }, [x, z])
  return (
    <group position={[x, bedY(x, z) - 0.2, z]} quaternion={tilt} scale={scale}>
      <mesh geometry={geo} material={mat} rotation={rot} />
    </group>
  )
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
    window.__jig = () => state.current.jig ? forceJig(pop, window.__lakeClock?.elapsedTime ?? 0, state.current.jig, circles, bedY) : 'no jig' // dev: the nearest fish comes to the jig now
    window.__chase = (species = 'laketrout') => forceRise(pop, window.__lakeClock?.elapsedTime ?? 0, state.current.apex, species, circles, bedY) // dev: make the nearest fish rise now
  }
  state.current.pop = pop
  // behaviours (fish.js): boat-triggered rises, bass strikes on bait, salmon bursts — before anything reads a pose
  const campKey = useRef('')
  useFrame(({ clock }, dt) => {
    if (import.meta.env.DEV) window.__lakeClock = clock
    const s = state.current
    if (s.jig !== undefined && s.holes && s.holes.length) { // the ice page: a winter population round each new hole (fish.js winterCamp)
      const live = s.holes[s.holes.length - 1], key = `${live.x.toFixed(1)},${live.z.toFixed(1)}`
      if (key !== campKey.current) { campKey.current = key; winterCamp(pop, live, circles, bedY) }
    }
    stepBehaviours(pop, clock.elapsedTime, Math.min(dt, 0.1), state.current.apex, circles, bedY, state.current.jig || null) // ice page: s.jig (IceCamp) draws fish to the lure
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
// a flat ribbon along an arc of the ellipse (a, b), width w, lying in the x–z plane
function ellipseArc(a, b, w, t0, len, segs) {
  const pos = [], idx = []
  for (let i = 0; i <= segs; i++) {
    const t = t0 + (len * i) / segs, c = Math.cos(t), s = Math.sin(t)
    const nx = b * c, nz = a * s, nl = Math.hypot(nx, nz)
    pos.push(a * c - (w / 2) * nx / nl, 0, b * s - (w / 2) * nz / nl, a * c + (w / 2) * nx / nl, 0, b * s + (w / 2) * nz / nl)
    if (i < segs) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx)
  return g
}
function Boat({ state, beamMats }) {
  const boat = useMemo(makeBassBoat, [])
  const contact = useMemo(makeWaterContact, [])
  // the drag cue (#132; the glass pill with its arrow read as generic UI — the ice page's #123 reticle is the language):
  // a thin white reticle lying on the water round the hull — four arcs of an ellipse with gaps fore, aft and abeam, a
  // chevron off the bow and the stern, and a ripple that spreads out of it every 2.6 s. Shown until the first drag.
  const reticle = useMemo(() => {
    const g = new THREE.Group()
    const mat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide })
    const a = 4.6, b = 2.3, w = 0.11
    for (let i = 0; i < 4; i++) g.add(new THREE.Mesh(ellipseArc(a, b, w, (i * Math.PI) / 2 + 0.26, Math.PI / 2 - 0.52, 24), mat))
    for (const sgn of [1, -1]) for (const dz of [1, -1]) { // the chevrons: > off the bow, < off the stern
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.01, w), mat)
      m.position.set(sgn * (a + 0.55) - sgn * 0.148, 0, dz * 0.148); m.rotation.y = (sgn * dz * Math.PI) / 4
      g.add(m)
    }
    const rip = new THREE.Mesh(ellipseArc(a, b, 0.06, 0, Math.PI * 2, 64), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }))
    g.add(rip)
    g.userData = { rip, mat, fade: 1 }
    g.position.y = 0.03; g.renderOrder = 3
    return g
  }, [])
  const group = useRef(), ride = useRef()
  useFrame(({ clock }, dt) => {
    const s = state.current
    s.boat.x += (s.target.x - s.boat.x) * Math.min(1, dt * 4)
    s.boat.z += (s.target.z - s.boat.z) * Math.min(1, dt * 4)
    group.current.position.set(s.boat.x, 0.02, s.boat.z)
    s.apex.copy(TRANSDUCER_OFFSET).add(group.current.position)
    setBeamUniforms(beamMats, s.specs, s.apex)
    { // the drag cue: breathes a little, ripples every 2.6 s, fades out after the first drag
      const r = reticle.userData, tt = clock.elapsedTime
      r.fade += ((s.hasDragged ? 0 : 1) - r.fade) * Math.min(1, dt * 5)
      reticle.visible = r.fade > 0.02
      if (reticle.visible) {
        const u = Math.min(1, (tt % 2.6) / 1.6), grow = 1 + 0.45 * (1 - (1 - u) * (1 - u))
        r.mat.opacity = (0.72 + 0.16 * Math.sin(tt * 2.2)) * r.fade
        r.rip.scale.set(grow, 1, grow)
        r.rip.material.opacity = 0.5 * (1 - u) * r.fade
      }
    }
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
      <primitive object={reticle} />
    </group>
  )
}
function Beams({ state, ice = false }) {
  const group = useRef()
  const specs = state.current.specs
  const meshes = useMemo(() => specs.map((spec) => {
    const g = wedgeGeometry(spec)
    return { g, e: new THREE.EdgesGeometry(g, 25) }
  }), [specs])
  useEffect(() => () => meshes.forEach((m) => { m.g.dispose(); m.e.dispose() }), [meshes]) // AUTO depth rebuilds the PL Forward curtain
  const clip = useMemo(() => [new THREE.Plane(new THREE.Vector3(0, 0, -1), 1e5)], []) // the ice section view cuts the curtain at the wall
  const sig0 = state.current.signal ?? 1 // a remount mid-hop (AUTO range → specKey) starts at the current gate, not at full opacity
  useFrame(() => {
    const s = state.current
    group.current.position.copy(s.apex)
    clip[0].constant = ice && s.view === 'section' ? s.boat.z + SECTION_CAM.cutZ : 1e5
    // the ice signal gate (IceCamp.jsx s.signal; undefined on the summer lake → 1): the wedge goes out with the Mini.
    // The materials are found by walking the group every frame, so a keyed remount (specKey) can never leave stale refs
    const sig = s.signal ?? 1
    group.current.visible = sig > 0.004
    group.current.traverse((o) => {
      if (!o.material) return
      o.material.opacity = (o.isLineSegments ? (ice ? 0.75 : 0.6) : (ice ? 0.2 : 0.11)) * sig
    })
  })
  return (
    <group ref={group} visible={sig0 > 0.004} onUpdate={(g) => g.traverse((o) => o.layers.set(SONAR_HIDE_LAYER))}>
      {meshes.map((m, i) => (
        <group key={i}>
          <mesh geometry={m.g}>
            <meshPhysicalMaterial color="#5fd3ff" transparent opacity={(ice ? 0.2 : 0.11) * sig0} side={THREE.DoubleSide} depthWrite={false} roughness={0.3} clippingPlanes={ice ? clip : undefined} />
          </mesh>
          <lineSegments geometry={m.e}><lineBasicMaterial color="#dff7ff" transparent opacity={(ice ? 0.75 : 0.6) * sig0} clippingPlanes={ice ? clip : undefined} /></lineSegments>
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
const LAKE_CAM = { T: CAM_T, D: CAM_D, W: LAKE_W, FOG }
const ICE_CAM = { T: ICE_CAM_T, D: ICE_CAM_D, W: ICE_LAKE_W, FOG: ICE_FOG, hintBelow: true }
// dev aid ?cam=fish:<species>[:<index>][:top|:side|:tq] — top: from above, nose up the screen (shows the body wave);
// side: broadside, level with the fish; tq: three-quarter, above and to one side, turning with the fish; none: the old fixed offset
const FISH_CAM_VIEW = import.meta.env.DEV ? (/cam=fish:\w+(?::\d+)?:(top|side|tq)/.exec(window.location.search) || [])[1] : undefined
// dev aid ?cam=boat[:side|:bow|:stern|:top|:under] — the boat from several angles (none: the old stern-quarter view)
const BOAT_CAM_VIEW = import.meta.env.DEV ? (/cam=boat:(side|bow|stern|top|under)/.exec(window.location.search) || [])[1] : undefined
const BOAT_CAMS = { // camera offset from the boat, look-at offset from the boat
  side: [[0.4, 1.7, 10.5], [0, 0.15, 0]], bow: [[8.5, 2.6, 6], [0, 0.1, 0]], stern: [[-8.5, 2.4, -5.5], [0, 0.2, 0]],
  top: [[0.01, 13.5, 0], [0, 0, 0]], under: [[5.5, -2.6, 5.5], [0, -0.2, 0]],
}
function Rig({ state, sonarRect, fogMats, cam = LAKE_CAM }) {
  const { camera, size, scene } = useThree()
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])
  const k0 = useRef(0)
  useFrame(({ clock }, dt) => {
    const s = state.current
    const aspect = size.width / size.height
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const k = Math.max(1, cam.W / (2 * tanV * aspect * cam.D.length())) // 1 on desktop and landscape tablets
    // lake band = the screen above the phone frame on portrait phones (the frame and panel cover the rest)
    const fr = sonarRect?.current?.dock || sonarRect?.current?.frame
    const bandBottom = k > 1 && fr ? Math.max(size.height * 0.35, Math.min(size.height, fr.getBoundingClientRect().top)) : size.height
    const devCam = s.fishCam || s.logoCam || s.wreckCam || s.closeCam || s.workboatCam != null
    const offY = devCam ? 0 : Math.round(size.height / 2 - bandBottom / 2)
    // mid-size screens (an unfolded fold at 711×584, a small tablet): the glass panel top-left covered the boat (on the ice
    // page the kit at the hole) (2026-10-24). Shift the view right just enough that it stands clear of the panel, measured
    // from where it projects without the shift; wide screens, where it is already clear, keep their framing exactly
    const pr = s.panelEl?.getBoundingClientRect()
    let offX = 0
    if (!devCam && pr && pr.width && s.boat) {
      const cur = camera.view?.enabled ? -camera.view.offsetX : 0
      tmp.set(s.boat.x, 0.5, s.boat.z).project(camera)
      const bx = ((tmp.x + 1) / 2) * size.width - cur, by = ((1 - tmp.y) / 2) * size.height
      if (by < pr.bottom + 60) offX = Math.round(Math.min(0.6 * pr.right, Math.max(0, pr.right + 110 - bx)))
      offX = Math.round(0.85 * (s.offX ?? offX) + 0.15 * offX); if (Math.abs(offX - (s.offX ?? 0)) < 1) offX = s.offX ?? offX; s.offX = offX // settle smoothly, no jitter
    }
    if (offY > 0 || offX > 0) { if (!camera.view?.enabled || camera.view.offsetY !== offY || camera.view.offsetX !== -offX || camera.view.fullWidth !== size.width || camera.view.fullHeight !== size.height) camera.setViewOffset(size.width, size.height, -offX, offY, size.width, size.height) }
    else if (camera.view?.enabled) camera.clearViewOffset()
    if (k !== k0.current) { // thin the fog and push the far plane with the camera distance
      k0.current = k
      for (const m of fogMats) { const u = m.userData.uniforms.uFogDensity; u.base ??= u.value; u.value = u.base / k }
      if (scene.fog) { scene.fog.near = cam.FOG.near * k; scene.fog.far = cam.FOG.far * k }
      camera.far = cam.FOG.cam * k; camera.updateProjectionMatrix()
    }
    // drag hint follows the boat until the first drag, kept inside the screen
    if (s.hintEl) {
      // ice section: the hint sits ON open ice behind the cut wall, left of the kit (where a tap drills), not on the rig
      const iceSec = s.view === 'section' && s.holes !== undefined
      // (2026-10-23) the cue is a reticle lying on the ice (IceCamp.jsx, s.hintAnchor), like the ground reticle of AR
      // placement, with a plain caption under it — no glass pill, no glowing dot (Jason: 看着太 AI 了)
      if (iceSec) {
        s.hintAnchor = s.hintAnchor || { x: 0, z: 0 }
        s.hintAnchor.x = s.boat.x - (k > 1 ? 1.5 : 2.6); s.hintAnchor.z = s.boat.z + (k > 1 ? 3.8 : 2.2)
        tmp.set(s.hintAnchor.x, 0, s.hintAnchor.z).project(camera)
      } else { s.hintAnchor = null; tmp.set(s.boat.x, 0.05, s.boat.z - 5.3).project(camera) } // the lake: just above the far edge of the water reticle (#132)
      const hw = (s.hintEl.offsetWidth || 160) / 2 + 8
      const minX = iceSec && size.width >= 1024 ? 440 + hw : hw // desktop: clear of the glass panel and the step cards
      const px = Math.min(size.width - hw, Math.max(minX, ((tmp.x + 1) / 2) * size.width))
      const below = cam.hintBelow && s.view !== 'section'
      const py = below ? ((1 - tmp.y) / 2) * size.height + (s.view === 'under' ? 150 : k > 1 ? 30 : 44) : Math.max((s.hintEl.offsetHeight || 34) + 54, ((1 - tmp.y) / 2) * size.height - (k > 1 ? 6 : 8))
      const qy = iceSec ? ((1 - tmp.y) / 2) * size.height + (k > 1 ? 16 : 18) : py // ice: the caption just under the reticle
      let qx = iceSec ? Math.min(size.width - hw, Math.max(hw, ((tmp.x + 1) / 2) * size.width)) : px // ice: centred on the reticle, kept on screen
      // never under the glass panel, the step cards or the phone (2026-10-24, the vivo fold at 711×584: the caption sat on
      // the panel's Range value): slide it just right of the box it hits, or below it when there is no room on the right
      const anchorTop = iceSec || below, w = s.hintEl.offsetWidth || 160, h = s.hintEl.offsetHeight || 20
      let top = anchorTop ? qy : qy - h
      const base = s.hintEl.offsetParent?.getBoundingClientRect()
      if (base) {
        if (!s.hintAvoid || ++s.hintAvoidN > 60) { s.hintAvoid = [...document.querySelectorAll('[data-hint-avoid]')]; s.hintAvoidN = 0 }
        for (const el of s.hintAvoid) {
          const r = el.getBoundingClientRect()
          if (!r.width || r.width * r.height > 0.6 * size.width * size.height) continue // hidden, or full-screen (a sideways phone: the caption is off there anyway)
          const L = r.left - base.left - 8, R = r.right - base.left + 8, T = r.top - base.top - 8, B = r.bottom - base.top + 8
          if (qx + w / 2 <= L || qx - w / 2 >= R || top + h <= T || top >= B) continue
          if (R + w / 2 <= size.width - 8) qx = R + w / 2
          else top = Math.min(B, size.height - h - 8)
        }
      }
      const qy2 = anchorTop ? top : top + h
      s.hintEl.style.transform = `translate(${qx.toFixed(1)}px, ${qy2.toFixed(1)}px) translate(-50%, ${anchorTop ? '0' : '-100%'})`
      s.hintEl.style.opacity = s.hasDragged || s.hintOff ? '0' : '1' // hintOff: a sideways phone with the sonar full-screen (#140)
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
    if (s.rocksCam) { // dev aid ?cam=rocks[:hump] — the island rock pile (or the first rock hump) from under water, slowly circling
      const [cx, cz] = s.rocksCam === 'hump' ? [ROCK_HUMPS[0][0], ROCK_HUMPS[0][1]] : [30, 12]
      const a = performance.now() / 12000, by = bedY(cx, cz)
      camera.up.set(0, 1, 0)
      camera.position.set(cx + Math.cos(a) * 9, by + 3.2, cz + Math.sin(a) * 9)
      camera.lookAt(cx, by + 0.4, cz)
      return
    }
    if (s.workboatCam != null) { // dev aid ?cam=workboat[:deg] — the small wreck up close from that bearing, under water
      const a = (s.workboatCam * Math.PI) / 180, { x: wx, z: wz } = SMALL_WRECK, by = bedY(wx, wz)
      camera.up.set(0, 1, 0)
      camera.position.set(wx + Math.cos(a) * 13, by + 5, wz + Math.sin(a) * 13)
      camera.lookAt(wx, by + 1.2, wz)
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
    if (import.meta.env.DEV && s.rigCam) { // dev aid ?rigcam — the hole kit up close (the pole rig, the auger, the bucket)
      camera.up.set(0, 1, 0); camera.position.set(s.boat.x - 2.6, 2.0, s.boat.z + 4.2); camera.lookAt(s.boat.x + 0.2, 0.1, s.boat.z)
      if (camera.fov !== 38) { camera.fov = 38; camera.updateProjectionMatrix() }
      return
    }
    // the ice page's other two cameras (docs/ice-relationship-study.md A and B): offsets from the live hole, smooth follow
    if (s.view === 'under' || s.view === 'section') {
      const C = s.view === 'under' ? UNDER_CAM : (k > 1 ? SECTION_CAM_PHONE : SECTION_CAM) // k > 1: the portrait-phone layout
      const e = Math.min(1, dt * 2.5)
      const fov = C.fov ?? 38
      if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix() }
      // the section fits what matters into the band above the app frame (phones) or the window (desktop): the ice line at
      // the hole and the lake bottom under it. The camera backs off along its line of sight until the bottom fits, and
      // comes back in when it can (Jason 2026-10-16: 手机版水下的画面会挡住 是不是应该拉远一点).
      // On phones the band is centred in the camera (view offset), like the top view does for the lake.
      let zoom = 1
      if (s.view === 'section') {
        const fr = sonarRect?.current?.dock || sonarRect?.current?.frame
        const bandBottom = k > 1 && fr ? Math.max(size.height * 0.35, Math.min(size.height, fr.getBoundingClientRect().top)) : size.height
        const offY = k > 1 ? Math.round(size.height / 2 - bandBottom / 2) : 0, offXs = s.offX || 0 // offXs: clear of the glass panel (above)
        if (offY > 0 || offXs > 0) { if (!camera.view?.enabled || camera.view.offsetY !== offY || camera.view.offsetX !== -offXs || camera.view.fullWidth !== size.width || camera.view.fullHeight !== size.height) camera.setViewOffset(size.width, size.height, -offXs, offY, size.width, size.height) }
        else if (camera.view?.enabled) camera.clearViewOffset()
        // Solve the framing outright (decision #113): dy so the ice line at the hole sits at iceWant, then the smallest
        // zoom ≥ 1 that keeps the bottom under the hole inside bottomMax. Bisection on a probe camera that carries the
        // real projection (fov + view offset); cached while nothing that matters moved. The old nudge-per-frame
        // controller converged slowly, jumped on the first (long) frames and settled at different zooms per browser.
        const D = depthAt(s.boat.x, s.boat.z)
        const iceWant = k > 1 ? 0.26 : 0.45, bottomMax = k > 1 ? 0.8 : 0.9 // phones: the band is short, keep room under the lit bottom
        const key = [s.boat.x.toFixed(2), s.boat.z.toFixed(2), D.toFixed(2), size.width, size.height, Math.round(bandBottom), camera.fov, k > 1].join('|')
        if (s.secKey !== key) {
          s.secKey = key
          const probe = camera.clone() // same fov and view offset as the live camera
          const lookT = new THREE.Vector3(), posT = new THREE.Vector3(), pt = new THREE.Vector3()
          const place = (dy, zoom) => {
            lookT.set(s.boat.x + C.look[0], C.look[1] + dy, s.boat.z + C.look[2])
            posT.set(s.boat.x + C.pos[0], C.pos[1], s.boat.z + C.pos[2]).sub(lookT).multiplyScalar(zoom).add(lookT)
            probe.position.copy(posT); probe.up.set(0, 1, 0); probe.lookAt(lookT); probe.updateMatrixWorld(true)
          }
          const frac = (y) => ((1 - pt.set(s.boat.x, y, s.boat.z).project(probe).y) / 2) * size.height / bandBottom // 0 = band top, 1 = band bottom
          const solveDy = (zoom) => { // frac(0) grows with dy (look higher → the scene slides down)
            let lo = -14, hi = 16
            for (let i = 0; i < 16; i++) { const mid = (lo + hi) / 2; place(mid, zoom); if (frac(0) < iceWant) lo = mid; else hi = mid }
            return (lo + hi) / 2
          }
          let zoom = 1, dy = solveDy(1)
          place(dy, 1)
          if (frac(-D) > bottomMax) { // too deep for the band: back off along the line of sight until the bottom fits
            let lo = 1, hi = 3.2
            for (let i = 0; i < 14; i++) { const mid = (lo + hi) / 2; place(solveDy(mid), mid); if (frac(-D) > bottomMax) lo = mid; else hi = mid }
            zoom = hi; dy = solveDy(zoom)
          }
          s.secZoom = zoom; s.secDy = dy
        }
        zoom = s.secZoom
      } else if (s.offX > 0) { if (!camera.view?.enabled || camera.view.offsetX !== -s.offX || camera.view.offsetY !== 0) camera.setViewOffset(size.width, size.height, -s.offX, 0, size.width, size.height) }
      else if (camera.view?.enabled) camera.clearViewOffset()
      const lk = new THREE.Vector3(s.boat.x + C.look[0], C.look[1] + (s.view === 'section' ? s.secDy : 0), s.boat.z + C.look[2])
      tmp.set(s.boat.x + C.pos[0], C.pos[1], s.boat.z + C.pos[2]).sub(lk).multiplyScalar(zoom).add(lk)
      tmp.x += px * 1.2; tmp.y += py * 0.6
      if (!s.camP) { s.camP = tmp.clone(); s.camL = lk.clone() }
      s.camP.lerp(tmp, e)
      s.camL.lerp(lk, e)
      camera.up.set(0, 1, 0); camera.position.copy(s.camP); camera.lookAt(s.camL)
      return
    }
    s.camP = null
    if (camera.fov !== 38) { camera.fov = 38; camera.updateProjectionMatrix() }
    // view from the south (desktop exactly as before); phones: pulled back, re-centred on a step preset's boat
    const fx = k > 1 && s.frameX != null ? s.frameX : cam.T.x
    s.camX = s.camX == null ? fx : s.camX + (fx - s.camX) * Math.min(1, dt * 2.5)
    const pk = k > 1 || s.land ? 0 : 1 // no pointer parallax on phones (a dragging finger would shake the view), sideways ones too
    look.set(s.camX + px * 2 * pk, cam.T.y, cam.T.z)
    camera.position.set(look.x + cam.D.x * k + px * 2 * pk, cam.T.y + cam.D.y * k + py * 2 * pk, cam.T.z + cam.D.z * k + px * 2 * pk)
    camera.lookAt(look)
  })
  return null
}
function PickPlane({ state }) {
  const onDown = (e) => { e.stopPropagation(); state.current.dragging = true; state.current.hasDragged = true; labEvent('first_drag', {}, { once: true }); e.target.setPointerCapture?.(e.pointerId); move(e) }
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

// the ice section view (B): every lake material and the ice discard what lies beyond the wall in front of the hole
function SectionCut({ state, mats }) {
  useFrame(() => {
    const s = state.current
    const on = s.view === 'section' ? 1 : 0, z = s.boat.z + SECTION_CAM.cutZ
    for (const m of mats) m.userData.uniforms.uClip.value.set(on, z)
  })
  return null
}

// paused: the sign-up gate is open — stop the render loop so the lake and the sonar picture freeze
// scene: 'lake' (the boat, default) or 'ice' (the frozen lake: IceCamp.jsx replaces the water, the boat and the pick plane;
// the lakebed, structure, fish, beams and the sonar engine are the same)
export default function LakeScene({ state, sonarRect, paused = false, scene = 'lake' }) {
  const ice = scene === 'ice'
  const P = useMemo(() => (ice ? iceParams() : null), [ice])
  const mats = useMemo(() => {
    const fish = makeLakeMaterial({ fish: true })
    fish.userData.uniforms.uHighlight.value.set('#ffe9a0') // fish light up warm, like a sonar return
    fish.userData.uniforms.uFogDensity.value = 0.006
    fish.side = THREE.DoubleSide // flat fins
    const m = { bed: makeLakeMaterial(), inst: makeLakeMaterial({ structure: true }), steel: makeLakeMaterial({ steel: true }), wood: makeLakeMaterial({ wood: true }), logo: makeLakeMaterial({ logo: true }), fish }
    if (ice) for (const k in m) { const u = m[k].userData.uniforms; u.uFogColor.value.set(P.T.water); u.uSun.value.copy(dir(P.T.sun.dir)); u.uRevealGain.value = 2.4; u.uOutGamma.value = 0.8; u.uFogDensity.value *= 2.4 } // dark winter water: the bottom fades to black, the beam cuts through (#99)
    return m
  }, [ice, P])
  const lakeMats = useMemo(() => [mats.bed, mats.inst, mats.steel, mats.wood, mats.fish, mats.logo], [mats]) // wood added 2026-10-23: without it the workboat rendered into the sonar passes untagged (alpha 1 = fish/steel)
  const iceMat = useMemo(() => {
    if (!ice) return null
    const m = makeIceMaterial(bakeTerrain())
    const u = m.userData.uniforms, T = P.T, L = P.L
    u.uSun.value.copy(dir(T.sun.dir)); u.uSunColor.value.set(T.sun.color); u.uSunI.value = T.sun.i
    u.uSkyZenith.value.set(T.zenith); u.uSkyHorizon.value.set(T.horizon); u.uAmbient.value = T.hemi[2]
    u.uFogColor.value.set(T.bg); u.uFogDensity.value = T.fogDensity; u.uWater.value.set(T.water)
    u.uGlow.value.set(T.glow); u.uGlowDir.value.copy(dir(T.glowDir))
    u.uCover.value = L.cover; u.uClear.value = L.clear; u.uWindow.value = L.window; u.uCutOn.value = L.cut
    return m
  }, [ice, P])
  const beamMats = useMemo(() => (iceMat ? [...lakeMats, iceMat] : lakeMats), [lakeMats, iceMat]) // the ice shows the beam's reach too
  const bg = ice ? P.T.bg : '#9cc1cf'
  return (
    <Canvas frameloop={paused ? 'never' : 'always'} dpr={[1, 1.5]} camera={{ fov: 38, near: 0.5, far: 400, position: [-38, 34, 54] }} gl={{ antialias: true, powerPreference: 'high-performance' }} onCreated={({ gl }) => { gl.localClippingEnabled = true; labEvent('ready', {}, { once: true }) }}>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={ice ? [bg, ICE_FOG.near, ICE_FOG.far] : [bg, 160, 420]} />
      {ice ? (<>
        <hemisphereLight args={P.T.hemi} />
        <directionalLight position={dir(P.T.sun.dir).multiplyScalar(120).toArray()} color={P.T.sun.color} intensity={P.T.sun.i * 1.8} />
        <IceSky T={P.T} />
      </>) : (<>
        <hemisphereLight args={['#dbe9f0', '#2a3a2a', 0.9]} />
        <directionalLight position={[40, 80, 30]} intensity={1.4} />
      </>)}
      <Lakebed mat={mats.bed} />
      <mesh rotation-x={-Math.PI / 2} position-y={-47} onUpdate={(o) => o.layers.set(SONAR_HIDE_LAYER)}><planeGeometry args={[900, 900]} /><meshBasicMaterial color={ice ? P.T.water : '#17545f'} /></mesh>
      <Structures mat={mats.inst} />
      <Wreck mat={mats.wood} /> {/* the ~10 m workboat is wooden (Jason 2026-10-23: 沉船是木质的) — sonar tag 0.6 */}
      <BigWreck mat={mats.steel} />
      <Logo mat={mats.logo} stoneMat={mats.inst} />
      {import.meta.env.DEV && /fishtest/.test(window.location.search) && <TestPiling mat={mats.inst} />}
      {/* dev ?study=wreck&boat=x,z: a wooden copy of the workboat (×1.25 ≈ 12 m, like the app's PL Down wreck recording of
          2026-10-23) lying along the Down plane 2–40 ft to the boat's +x side on the bottom, structure (not steel) tag */}
      {import.meta.env.DEV && /study=wreck/.test(window.location.search) && (() => { const m = /boat=(-?[\d.]+),(-?[\d.]+)/.exec(window.location.search); const bx = m ? +m[1] : 0, bz = m ? +m[2] : 0; return <Wreck mat={mats.wood} at={{ x: bx + 6.4, z: bz, rot: [0, 0, 0], scale: 1.25 }} /> })()}
      <Fish mat={mats.fish} state={state} />
      {ice ? (<>
        <IceSheet mat={iceMat} state={state} />
        <IceCamp state={state} beamMats={beamMats} iceMat={iceMat} T={P.T} />
        {P.L.cut > 0 && <IceWalls state={state} iceMat={iceMat} />}
        <LightShaft state={state} />
        <MarineSnow state={state} />
        <SectionFaces state={state} />
        <SectionCut state={state} mats={[...lakeMats, iceMat]} />
        <Snowfall state={state} T={P.T} />
        <IcePick state={state} />
      </>) : (<>
        <Water state={state} />
        <Boat state={state} beamMats={beamMats} />
        <PickPlane state={state} />
      </>)}
      <Beams key={state.current.specKey} state={state} ice={ice} />
      <Rig state={state} sonarRect={sonarRect} fogMats={beamMats} cam={ice ? ICE_CAM : LAKE_CAM} />
      <SonarScreen state={state} rect={sonarRect} lakeMats={lakeMats} />
    </Canvas>
  )
}
