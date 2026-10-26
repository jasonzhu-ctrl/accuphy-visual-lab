// The frozen lake, as one React Three Fiber component: drop <IceEnvironment /> into any <Canvas>.
//   sky dome · the ice sheet with snow drifts · falling snow · the shelter, sled and lamp · the lakebed with timber,
//   weeds and rocks · a wooden workboat and a steel cargo wreck · swimming fish · marine snow in the water ·
//   the cutaway (the lake cut open in front of the camp, like a diorama)
// Props:
//   time     'dusk' | 'day' | 'night'          (presets.js TIMES)
//   look     'glass' | 'mixed' | 'snow'        (presets.js LOOKS: how much snow lies on the ice)
//   cutaway  true: cut the lake open along the wall CUT_Z in front of CENTER; false: the whole sheet, seen from above
//   focus    a THREE.Vector3 the near ice and the snowfall follow (pass your camera target); defaults to CENTER
//   lift     overall underwater brightness (1 = as designed)
//   background  false if your app sets its own scene background and fog
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { HALF, SEG, bedY, fbm, depthAt } from './terrain'
import { SPECIES, makePopulation, fishPose, winterCamp, drawnLen } from './fish'
import { makeLakeMaterial } from './lakeMaterial'
import { makeIceMaterial } from './iceMaterial'
import { makeTallTree, makeBushTree, makeStump, makeLog, makeWeedTuft, placeAll } from './vegetation'
import { makeRockGeometry, ROCK_KINDS } from './rocks'
import { makeFishGeometry } from './fishGeometry'
import { makeCargoWreck, makeWreckDebris, makeWorkboat, WRECK_L, BIG_WRECK, SMALL_WRECK } from './wreck'
import { buildObstacles, toCircles } from './obstacles'
import { makeShelter, makeSled } from './iceProps'
import { makeSnowfall } from './snow'
import { makeSkyDome } from './iceSky'
import { WIND, CENTER, TIMES, LOOKS, CUT_Z, SLAB, CAMP, dir } from './presets'

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
  return <mesh geometry={geo} material={mat} />
}

// ---------- structure: timber, weeds, rocks ----------
// One InstancedMesh per geometry variant; items are dealt round-robin across variants.
function Instanced({ mat, geos, items }) {
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
  return geos.map((g, k) => <instancedMesh key={k} ref={(el) => { refs.current[k] = el }} args={[g, mat, Math.max(1, buckets[k].length)]} frustumCulled={false} />)
}
function Structures({ mat }) {
  const geos = useMemo(() => ({
    tall: [0, 1, 2, 3].map(makeTallTree), bush: [0, 1, 2, 3, 4].map(makeBushTree), stump: [makeStump()], log: [makeLog()],
    // rocks: the six kinds; small ones at 320 triangles, the few big ones (s ≥ 1.2) at 1280
    weed: [makeWeedTuft()], rock: ROCK_KINDS.flatMap((k) => [makeRockGeometry(k, 0, 2), makeRockGeometry(k, 2, 2)]), rockBig: ROCK_KINDS.map((k) => makeRockGeometry(k, 1, 3)),
  }), [])
  const items = useMemo(placeAll, [])
  return (
    <group>
      <Instanced mat={mat} geos={geos.tall} items={items.tall} />
      <Instanced mat={mat} geos={geos.bush} items={items.bush} />
      <Instanced mat={mat} geos={geos.stump} items={items.stump} />
      <Instanced mat={mat} geos={geos.log} items={items.log.map((it) => ({ ...it, sx: 1, sy: 0.12, sz: 0.12 }))} />
      <Instanced mat={mat} geos={geos.weed} items={items.weed.map((it) => ({ ...it, sx: 0.8, sz: 0.8 }))} />
      <Instanced mat={mat} geos={geos.rock} items={items.rock.filter((it) => it.s < 1.2)} />
      <Instanced mat={mat} geos={geos.rockBig} items={items.rock.filter((it) => it.s >= 1.2)} />
    </group>
  )
}

// ---------- the wrecks ----------
// the ~10 m wooden workboat, following the slope (its up axis turned to the bed's normal, averaged over the hull's length)
function Wreck({ mat }) {
  const geo = useMemo(() => makeWorkboat(), [])
  const { x, z, rot } = SMALL_WRECK
  const tilt = useMemo(() => {
    const e = 3, n = new THREE.Vector3(bedY(x - e, z) - bedY(x + e, z), 2 * e, bedY(x, z - e) - bedY(x, z + e)).normalize()
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n)
  }, [x, z])
  return (
    <group position={[x, bedY(x, z) - 0.2, z]} quaternion={tilt}>
      <mesh geometry={geo} material={mat} rotation={rot} />
    </group>
  )
}
// the steel cargo ship (~28 m as drawn), listing on the deep slope, pitched to follow the bottom and settled ~1 m into
// the mud, with debris around it
function BigWreck({ mat }) {
  const { geo, debris } = useMemo(() => ({ geo: makeCargoWreck(), debris: makeWreckDebris().items }), [])
  const { x, z, yaw, list, scale: k } = BIG_WRECK
  const L = WRECK_L * k
  const ax = Math.cos(yaw), az = -Math.sin(yaw)
  const yBow = bedY(x + ax * L * 0.45, z + az * L * 0.45), yStern = bedY(x - ax * L * 0.45, z - az * L * 0.45)
  const pitch = Math.atan2(yBow - yStern, L * 0.9)
  const y = (yBow + yStern) / 2 - 1.1 * k
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

// ---------- fish ----------
// Realistic bodies per type (fishGeometry.js), drawn ×2.6 their true length so they read from the camera. Each fish
// swims its own loop (fish.js fishPose), routed round the timber and the wrecks; every frame it gets
// aSwim = (wave phase, activity, turn bend, wavelength) and the vertex shader bends the body (lakeMaterial.js).
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
      tmp.e.set(0, o.heading, o.pitch); tmp.q.setFromEuler(tmp.e)
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
      const coast = tmp.accel[i] < -0.2 * L ? 0.3 : 1 // slowing hard: the body straightens and glides
      a[i * 4 + 1] += ((0.35 + 0.65 * smooth01(0.05, 1, bl)) * coast - a[i * 4 + 1]) * eK // activity: a gentle sway when slow → full beat at 1 BL/s
      a[i * 4 + 2] += (Math.max(-0.25, Math.min(0.25, -0.3 * turn)) - a[i * 4 + 2]) * eB // the body curves into a quick turn
      a[i * 4] = (a[i * 4] + 2 * Math.PI * Math.min(6, Math.max(1 / Math.sqrt(L), 1.5 * bl)) * d) % (2 * Math.PI) // tail beat 1.5 × BL/s
    })
    tmp.first = false
    ref.current.instanceMatrix.needsUpdate = true
    sw.needsUpdate = true
  })
  return <instancedMesh ref={ref} args={[geo, mat, fish.length]} frustumCulled={false} />
}
function Fish({ mat, gather }) {
  const pop = useMemo(() => {
    const circles = toCircles(buildObstacles())
    const p = makePopulation(bedY, circles) // swim loops routed around structure
    // a winter population near the camp: perch, walleye, crappie and a lake trout brought to 5–13 m from it
    winterCamp(p, { x: gather.x, z: gather.z }, circles, bedY)
    return p
  }, [gather])
  const groups = useMemo(() => {
    const by = {}
    pop.forEach((f) => { const b = SPECIES[f.species].body; (by[b] ||= []).push(f) })
    return Object.entries(by)
  }, [pop])
  return groups.map(([body, fish]) => <FishGroup key={body} mat={mat} body={body} fish={fish} />)
}

// ---------- the sky, the ice, the snow ----------
function IceSky({ T }) {
  const dome = useMemo(() => makeSkyDome(1000), [])
  const { camera } = useThree()
  useEffect(() => {
    const u = dome.userData.uniforms
    u.uZenith.value.set(T.zenith); u.uHorizon.value.set(T.horizon); u.uBelow.value.set(T.bg); u.uGlow.value.set(T.glow)
    u.uGlowDir.value.copy(dir(T.glowDir)); u.uStars.value = T.stars; u.uAurora.value = T.aurora
  }, [dome, T])
  useFrame(({ clock }) => { dome.position.copy(camera.position); dome.userData.uniforms.uTime.value = clock.elapsedTime })
  return <primitive object={dome} />
}

// The sheet is two meshes: a near square, 240 m at 0.5 m, whose vertices rise by the snow's depth (real drifts, with
// silhouettes and shading at a low camera), following the focus in 2 m steps; and a far flat plane with a square hole
// for it. The shader's noise lives in world space, so the near mesh can move without the snow moving.
const NEAR = 240
function IceSheet({ mat, focus }) {
  const near = useMemo(() => {
    const g = new THREE.PlaneGeometry(NEAR, NEAR, 480, 480); g.rotateX(-Math.PI / 2)
    g.setAttribute('aDisp', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(1), 1))
    return g
  }, [])
  const far = useMemo(() => {
    const sh = new THREE.Shape(); sh.moveTo(-450, -450); sh.lineTo(450, -450); sh.lineTo(450, 450); sh.lineTo(-450, 450); sh.closePath()
    const hole = new THREE.Path(); const h = NEAR / 2 - 0.05; hole.moveTo(-h, -h); hole.lineTo(-h, h); hole.lineTo(h, h); hole.lineTo(h, -h); hole.closePath()
    sh.holes.push(hole)
    const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2)
    g.setAttribute('aDisp', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count), 1))
    return g
  }, [])
  const nearRef = useRef(), farRef = useRef()
  useFrame(({ clock }) => {
    const u = mat.userData.uniforms
    u.uTime.value = clock.elapsedTime
    const cx = Math.round(focus.x / 2) * 2, cz = Math.round(focus.z / 2) * 2
    u.uCenter.value.set(cx, cz)
    if (nearRef.current) nearRef.current.position.set(cx, 0, cz)
    if (farRef.current) farRef.current.position.set(cx, -0.002, cz)
  })
  return (
    <group>
      <mesh ref={nearRef} geometry={near} material={mat} renderOrder={1} frustumCulled={false} />
      <mesh ref={farRef} geometry={far} material={mat} renderOrder={1} frustumCulled={false} />
    </group>
  )
}

function Snowfall({ T, focus, clipZ }) {
  const snow = useMemo(() => makeSnowfall(), [])
  const { gl } = useThree()
  useFrame(({ clock }) => {
    const u = snow.userData.uniforms
    u.uTime.value = clock.elapsedTime
    u.uAmount.value = T.snowfall
    u.uPixelRatio.value = gl.getPixelRatio()
    u.uCenter.value.set(focus.x, 0, focus.z)
    u.uClipZ.value = clipZ
  })
  return <primitive object={snow} />
}

// marine snow: slow specks in the water give the column its volume
function MarineSnow({ focus, clipZ }) {
  const pts = useMemo(() => makeSnowfall(1400, new THREE.Vector3(70, 11, 70), { speed: 0.12, size: 0.6, alpha: 0.6, color: '#9fc7d8' }), [])
  const { gl } = useThree()
  useFrame(({ clock }) => {
    const u = pts.userData.uniforms
    u.uTime.value = clock.elapsedTime; u.uAmount.value = clipZ < 1e4 ? 0.7 : 0.9; u.uPixelRatio.value = gl.getPixelRatio()
    u.uCenter.value.set(focus.x, -11.4, focus.z)
    u.uClipZ.value = clipZ < 1e4 ? clipZ - 0.2 : 1e5
  })
  return <primitive object={pts} />
}

// ---------- the camp: the shelter with its lit door toward CENTER, the sled beside it, the lamp ----------
function Camp({ iceMat, T }) {
  const shelter = useMemo(makeShelter, [])
  const sled = useMemo(makeSled, [])
  const c = useMemo(() => {
    const cx = CENTER.x + CAMP[0], cz = CENTER.z + CAMP[1]
    const ux = CENTER.x - cx, uz = CENTER.z - cz, L = Math.hypot(ux, uz)
    const yaw = Math.atan2(uz / L, -ux / L)
    const lamp = shelter.userData.lampLocal.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).add(new THREE.Vector3(cx, 0, cz))
    return { x: cx, z: cz, yaw, lamp }
  }, [shelter])
  useEffect(() => {
    const u = iceMat.userData.uniforms
    u.uLamp.value.set(c.lamp.x, c.lamp.y, c.lamp.z, T.lamp)
    u.uLampColor.value.set('#ffb060')
  }, [iceMat, c, T])
  return (
    <group>
      <primitive object={shelter} position={[c.x, 0, c.z]} rotation-y={c.yaw} />
      <primitive object={sled} position={[c.x + 1.6, 0, c.z - 2.2]} rotation-y={c.yaw + 0.5} />
      <pointLight position={[c.lamp.x, c.lamp.y + 0.2, c.lamp.z]} color="#ffb060" intensity={T.lamp * 7} distance={10} decay={2} />
    </group>
  )
}

// ---------- the cutaway's faces: the ice slab, the water column, the soil under the lakebed ----------
function SectionFaces({ cutZ }) {
  const parts = useMemo(() => {
    // the slab's cut face: lake ice in section — a thin white snow-ice crust on top, then clear black ice that reads dark
    // blue-grey and glassy, grown in vertical columns ("candles") with strings of tiny bubbles; the cut edge catches the
    // sky; a rough, darker underside. No horizontal stripes — lake ice grows down, so its texture is vertical.
    const slabMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: { uT: { value: SLAB }, uWind: { value: WIND.clone() }, uCover: { value: 0.27 }, uHole: { value: new THREE.Vector2(CENTER.x, CENTER.z) } },
      vertexShader: /* glsl */ `varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `precision highp float; varying vec3 vW; uniform float uT; uniform vec2 uWind; uniform float uCover; uniform vec2 uHole;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
        float fbm3(vec2 p) { return 0.5 * vnoise(p) + 0.25 * vnoise(p * 2.1 + 1.3) + 0.125 * vnoise(p * 4.3 + 2.7); }
        float fbm4(vec2 p) { return fbm3(p) + 0.0625 * vnoise(p * 8.9 + 5.1); }
        // the sheet's snow mask (iceMaterial.js), evaluated at the wall, so the cap on the slab matches the snow behind it
        float snowAt(vec2 P) {
          vec2 Pw = vec2(dot(P, uWind), dot(P, vec2(-uWind.y, uWind.x)));
          float big = fbm4(P * 0.035 + 3.0), sast = fbm3(vec2(Pw.x * 0.07, Pw.y * 0.6) + 7.0);
          float h0 = 0.55 * big + 0.45 * sast;
          float h = 0.82 * h0 + 0.18 * fbm3(P * 0.8 + 1.7);
          float thr = mix(0.62, 0.30, uCover);
          float streakN = fbm3(vec2(Pw.x * 0.05, Pw.y * 0.7) + 2.0);
          float streaks = smoothstep(0.645, 0.665, streakN + 0.03 * (vnoise(P * 3.0) - 0.5));
          float hh = h + 0.02 * (vnoise(P * 2.3 + 9.0) - 0.5);
          float core = smoothstep(thr - 0.012, thr + 0.012, hh), skirt = smoothstep(thr - 0.09, thr - 0.005, hh);
          float open = 1.0 - smoothstep(9.0, 16.0, distance(P, uHole) + 3.0 * (fbm3(P * 0.11 + 5.0) - 0.5));
          return max(max(core, 0.4 * skirt), streaks) * (1.0 - 0.9 * open);
        }
        void main() {
          float d = clamp(-vW.y / uT, 0.0, 1.0);
          float snow = snowAt(vW.xz);
          float crust = 1.0 - smoothstep(0.08, 0.16, d + 0.04 * (vnoise(vec2(vW.x * 3.0, 1.0)) - 0.5));
          vec3 clear = mix(vec3(0.24, 0.38, 0.48), vec3(0.11, 0.21, 0.30), smoothstep(0.1, 1.0, d));
          float candle = vnoise(vec2(vW.x * 7.0, vW.y * 0.9)) * 0.6 + vnoise(vec2(vW.x * 19.0, vW.y * 2.0)) * 0.4;
          clear *= 0.86 + 0.28 * candle;
          float str = smoothstep(0.9, 0.97, vnoise(vec2(vW.x * 26.0, 3.0)));
          float bub = str * smoothstep(0.55, 0.8, vnoise(vec2(vW.x * 26.0, vW.y * 30.0)));
          clear = mix(clear, vec3(0.78, 0.88, 0.95), bub * 0.55);
          vec3 white = vec3(0.86, 0.9, 0.94) * (0.94 + 0.08 * vnoise(vW.xy * vec2(40.0, 60.0)));
          vec3 c = mix(clear, white, crust);
          c += vec3(0.16, 0.18, 0.2) * (1.0 - smoothstep(0.0, 0.035, d)); // the cut edge catching the sky
          c *= 1.0 - 0.35 * smoothstep(0.82, 1.0, d + 0.06 * (vnoise(vec2(vW.x * 2.5, 7.0)) - 0.5)); // the rough underside
          float cap = snow * (1.0 - smoothstep(0.02, 0.16, d)); // the snow lying on the slab, seen on its cut edge
          c = mix(c, vec3(0.97, 0.98, 1.0), cap * 0.95);
          gl_FragColor = vec4(c, mix(0.96, 0.84, smoothstep(0.1, 0.25, d)));
        }`,
    })
    const slab = new THREE.Mesh(new THREE.BoxGeometry(240, SLAB, 0.04), slabMat)
    const line = new THREE.Mesh(new THREE.BoxGeometry(240, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: '#a9d8ec', transparent: true, opacity: 0.55 })) // the waterline under the slab
    // the water column's face: a thin, deepening blue veil you look through into the lake
    const waterMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { uTop: { value: -SLAB } },
      vertexShader: /* glsl */ `varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `precision highp float; varying vec3 vW; uniform float uTop;
        void main() { float d = clamp((uTop - vW.y) / 24.0, 0.0, 1.0);
          vec3 c = mix(vec3(0.05, 0.24, 0.32), vec3(0.008, 0.04, 0.07), pow(d, 0.7));
          gl_FragColor = vec4(pow(c, vec3(1.0 / 2.2)), mix(0.3, 0.55, d)); }`,
    })
    const water = new THREE.Mesh(new THREE.PlaneGeometry(240, 60).translate(0, -30, 0), waterMat)
    water.renderOrder = 2
    // the soil's top edge follows the lakebed along the cut: sediment, brown, dark
    const N = 241, pos = new Float32Array(N * 9), colr = new Float32Array(N * 9), idx = []
    const sed = new THREE.Color('#262216'), mid = new THREE.Color('#4a3b26'), bot = new THREE.Color('#16110a')
    for (let i = 0; i < N; i++) {
      const x = CENTER.x - 120 + i, y = -depthAt(x, cutZ) - 0.05
      pos.set([x, y, cutZ, x, y - 0.45, cutZ, x, -48, cutZ], i * 9); colr.set([sed.r, sed.g, sed.b, mid.r, mid.g, mid.b, bot.r, bot.g, bot.b], i * 9)
      if (i < N - 1) { const a = i * 3, b = a + 3; idx.push(a, a + 1, b, b, a + 1, b + 1, a + 1, a + 2, b + 1, b + 1, a + 2, b + 2) }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(colr, 3)); g.setIndex(idx)
    const soil = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }))
    soil.frustumCulled = false
    slab.position.set(CENTER.x, -SLAB / 2, cutZ + 0.02)
    line.position.set(CENTER.x, -SLAB - 0.02, cutZ + 0.04)
    water.position.set(CENTER.x, -SLAB, cutZ + 0.01)
    return { slab, water, soil, line }
  }, [cutZ])
  return (
    <group>
      <primitive object={parts.slab} />
      <primitive object={parts.line} />
      <primitive object={parts.water} />
      <primitive object={parts.soil} />
    </group>
  )
}

export default function IceEnvironment({ time = 'dusk', look = 'glass', cutaway = true, focus = CENTER, lift = 1, background = true }) {
  const T = TIMES[time] || TIMES.dusk, L = LOOKS[look] || LOOKS.glass
  const cutZ = CENTER.z + CUT_Z, clipZ = cutaway ? cutZ : 1e5
  const mats = useMemo(() => {
    const fish = makeLakeMaterial({ fish: true })
    fish.userData.uniforms.uFogDensity.value = 0.0144
    fish.side = THREE.DoubleSide // flat fins
    return { bed: makeLakeMaterial(), inst: makeLakeMaterial({ structure: true }), steel: makeLakeMaterial({ steel: true }), wood: makeLakeMaterial({ wood: true }), fish }
  }, [])
  const iceMat = useMemo(() => makeIceMaterial(), [])
  useEffect(() => { // dark winter water: the bottom fades into the water's colour
    for (const k in mats) {
      const u = mats[k].userData.uniforms
      u.uFogColor.value.set(T.water); u.uSun.value.copy(dir(T.sun.dir)); u.uLift.value = lift
      u.uClip.value.set(cutaway ? 1 : 0, cutZ)
    }
    const u = iceMat.userData.uniforms
    u.uSun.value.copy(dir(T.sun.dir)); u.uSunColor.value.set(T.sun.color); u.uSunI.value = T.sun.i
    u.uSkyZenith.value.set(T.zenith); u.uSkyHorizon.value.set(T.horizon); u.uAmbient.value = T.hemi[2]
    u.uFogColor.value.set(T.bg); u.uFogDensity.value = T.fogDensity; u.uWater.value.set(T.water)
    u.uGlow.value.set(T.glow); u.uGlowDir.value.copy(dir(T.glowDir))
    u.uCover.value = L.cover; u.uClear.value = L.clear
    u.uOpenC.value.set(CENTER.x, CENTER.z)
    u.uClip.value.set(cutaway ? 1 : 0, cutZ)
  }, [mats, iceMat, T, L, lift, cutaway, cutZ])
  return (
    <>
      {background && <color attach="background" args={[T.bg]} />}
      {background && <fog attach="fog" args={[T.bg, 110, 300]} />}
      <hemisphereLight args={T.hemi} />
      <directionalLight position={dir(T.sun.dir).multiplyScalar(120).toArray()} color={T.sun.color} intensity={T.sun.i * 1.8} />
      <IceSky T={T} />
      <Lakebed mat={mats.bed} />
      <mesh rotation-x={-Math.PI / 2} position-y={-47}><planeGeometry args={[900, 900]} /><meshBasicMaterial color={T.water} /></mesh>
      <Structures mat={mats.inst} />
      <Wreck mat={mats.wood} />
      <BigWreck mat={mats.steel} />
      <Fish mat={mats.fish} gather={CENTER} />
      <IceSheet mat={iceMat} focus={focus} />
      <Camp iceMat={iceMat} T={T} />
      <MarineSnow focus={focus} clipZ={clipZ} />
      {cutaway && <SectionFaces cutZ={cutZ} />}
      <Snowfall T={T} focus={focus} clipZ={clipZ} />
    </>
  )
}
