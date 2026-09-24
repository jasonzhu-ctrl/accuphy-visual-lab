import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries as _merge } from 'three/addons/utils/BufferGeometryUtils.js'
// Extrude geometries are non-indexed, primitives are indexed — normalise first.
const mergeGeometries = (parts) => _merge(parts.map((g) => (g.index ? g.toNonIndexed() : g)))
import { HALF, SEG, bedY, fbm } from './terrain'
import { SPECIES, makePopulation, fishPose, rnd, FISH_DISPLAY_SCALE } from './fish'
import { makeLakeMaterial, setBeamUniforms } from './lakeMaterial'
import { wedgeGeometry } from '../2026-09-23-beam-shapes-3d/wedge'
import { makeTallTree, makeBushTree, makeStump, makeLog, makeWeedTuft, makeRock, placeAll } from './vegetation'
import { makeRangerBoat, TRANSDUCER_OFFSET } from './boat'
import { makeFishGeometry } from './fishGeometry'
import { makeCargoWreck, makeWreckDebris, WRECK_L } from './wreck'
import SonarScreen, { SONAR_HIDE_LAYER, LAKEBED_LAYER, FISH_LAYER } from './SonarScreen'

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
    weed: [makeWeedTuft()], rock: [0, 1, 2].map(makeRock),
  }), [])
  const items = useMemo(placeAll, [])
  return (
    <group>
      <Instanced mat={mat} geos={geos.tall} items={items.tall} />
      <Instanced mat={mat} geos={geos.bush} items={items.bush} />
      <Instanced mat={mat} geos={geos.stump} items={items.stump} />
      <Instanced mat={mat} geos={geos.log} items={items.log.map((it) => ({ ...it, sx: 1, sy: 0.12, sz: 0.12 }))} />
      <Instanced mat={mat} geos={geos.weed} items={items.weed.map((it) => ({ ...it, sx: 0.8, sz: 0.8 }))} />
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
  const x = 16, z = -26
  return <mesh geometry={geo} material={mat} position={[x, bedY(x, z) - 0.2, z]} rotation={[0.42, 0.6, 0.12]} />
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
  const x = 44, z = -30, yaw = -0.9
  // follow the slope: bottom height under the bow and the stern
  const ax = Math.cos(yaw), az = -Math.sin(yaw)
  const yBow = bedY(x + ax * WRECK_L * 0.45, z + az * WRECK_L * 0.45), yStern = bedY(x - ax * WRECK_L * 0.45, z - az * WRECK_L * 0.45)
  const pitch = Math.atan2(yBow - yStern, WRECK_L * 0.9)
  const y = (yBow + yStern) / 2 - 1.1
  return (
    <group>
      <group position={[x, y, z]} rotation-y={yaw}>
        <group rotation-z={pitch}>
          <mesh geometry={geo} material={mat} rotation-x={0.3} />
        </group>
      </group>
      {debris.map((it, i) => {
        const dx = x + it.dx, dz = z + it.dz
        return <mesh key={i} geometry={it.g} material={mat} position={[dx, bedY(dx, dz) + it.lift, dz]} />
      })}
    </group>
  )
}

// ---------- fish ----------
// Realistic bodies per type — see fishGeometry.js
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
    return g
  }, [body, fish])
  const ref = useRef()
  useEffect(() => {
    const c = new THREE.Color()
    fish.forEach((f, i) => { c.set(SPECIES[f.species].back); ref.current.setColorAt(i, c) })
    ref.current.instanceColor.needsUpdate = true
  }, [fish])
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), e: new THREE.Euler(), p: new THREE.Vector3(), s: new THREE.Vector3(), pose: {} }), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    fish.forEach((f, i) => {
      const o = fishPose(f, t, tmp.pose)
      tmp.e.set(0, o.heading, Math.sin(t * 6 + f.phase) * 0.08); tmp.q.setFromEuler(tmp.e)
      tmp.p.set(o.x, o.y, o.z); const L = f.len * FISH_DISPLAY_SCALE; tmp.s.set(L, L, L)
      tmp.m.compose(tmp.p, tmp.q, tmp.s)
      ref.current.setMatrixAt(i, tmp.m)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return <instancedMesh ref={ref} args={[geo, mat, fish.length]} frustumCulled={false} onUpdate={(o) => o.layers.set(FISH_LAYER)} />
}
function Fish({ mat, state }) {
  const pop = useMemo(() => makePopulation(bedY), [])
  if (import.meta.env.DEV) window.__fish = pop // dev: fish population for scene lookups
  state.current.pop = pop
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
  const boat = useMemo(makeRangerBoat, [])
  const group = useRef()
  useFrame((_, dt) => {
    const s = state.current
    s.boat.x += (s.target.x - s.boat.x) * Math.min(1, dt * 4)
    s.boat.z += (s.target.z - s.boat.z) * Math.min(1, dt * 4)
    group.current.position.set(s.boat.x, 0.02, s.boat.z)
    s.apex.copy(TRANSDUCER_OFFSET).add(group.current.position)
    setBeamUniforms(beamMats, s.specs, s.apex)
  })
  return <group ref={group} onUpdate={(g) => g.traverse((o) => o.layers.set(SONAR_HIDE_LAYER))}><primitive object={boat} /></group>
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
function Rig({ state }) {
  const { camera, size } = useThree()
  const tmp = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const s = state.current
    // drag hint follows the boat until the first drag
    if (s.hintEl) {
      tmp.set(s.boat.x, 0.6, s.boat.z).project(camera)
      const px = ((tmp.x + 1) / 2) * size.width, py = ((1 - tmp.y) / 2) * size.height
      s.hintEl.style.transform = `translate(${px.toFixed(1)}px, ${(py - 46).toFixed(1)}px) translate(-50%, -100%)`
      s.hintEl.style.opacity = s.hasDragged ? '0' : '1'
    }
    // fixed 3/4 aerial view like the PL animations; slight parallax from the pointer
    const px = s.parallax.x, py = s.parallax.y
    if (s.fishCam && s.pop) { // dev aid ?cam=fish:<species> — follow the first fish of that species
      const list = s.pop.filter((x) => x.species === s.fishCam)
      const f = list[Math.min(list.length - 1, s.fishCamIndex || 0)]
      if (f) {
        const o = fishPose(f, performance.now() / 1000, {})
        const L = f.len * FISH_DISPLAY_SCALE
        camera.position.set(o.x + L * 0.3, o.y + L * 0.35, o.z + L * 2.4)
        camera.lookAt(o.x, o.y, o.z)
        return
      }
    }
    if (s.wreckCam) { // dev aid ?cam=wreck — inspect the big wreck
      const a = performance.now() / 9000
      camera.position.set(44 + Math.cos(a) * 42, -4, -30 + Math.sin(a) * 42)
      camera.lookAt(44, -30, -30)
      return
    }
    if (s.closeCam) { // dev aid ?cam=boat — inspect the boat / fish up close
      camera.position.set(s.boat.x - 6 + px, 3.5 + py * 0.5, s.boat.z + 9)
      camera.lookAt(s.boat.x + 1, -0.6, s.boat.z)
      return
    }
    // view from the south: drop-off timber on the left, rock hump on the right
    camera.position.set(-14 + px * 4, 52 + py * 2, 66 + px * 2)
    camera.lookAt(3 + px * 2, -9, 0)
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
    return { bed: makeLakeMaterial(), inst: makeLakeMaterial({ structure: true }), fish }
  }, [])
  const beamMats = useMemo(() => [mats.bed, mats.inst, mats.fish], [mats])
  return (
    <Canvas frameloop={paused ? 'never' : 'always'} dpr={[1, 1.5]} camera={{ fov: 38, near: 0.5, far: 400, position: [-38, 34, 54] }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <color attach="background" args={['#9cc1cf']} />
      <fog attach="fog" args={['#9cc1cf', 160, 420]} />
      <hemisphereLight args={['#dbe9f0', '#2a3a2a', 0.9]} />
      <directionalLight position={[40, 80, 30]} intensity={1.4} />
      <Lakebed mat={mats.bed} />
      <mesh rotation-x={-Math.PI / 2} position-y={-47} onUpdate={(o) => o.layers.set(SONAR_HIDE_LAYER)}><planeGeometry args={[900, 900]} /><meshBasicMaterial color="#17545f" /></mesh>
      <Structures mat={mats.inst} />
      <Wreck mat={mats.inst} />
      <BigWreck mat={mats.inst} />
      {import.meta.env.DEV && /fishtest/.test(window.location.search) && <TestPiling mat={mats.inst} />}
      <Fish mat={mats.fish} state={state} />
      <Water state={state} />
      <Boat state={state} beamMats={beamMats} />
      <Beams key={state.current.specKey} state={state} />
      <PickPlane state={state} />
      <Rig state={state} />
      <SonarScreen state={state} rect={sonarRect} lakeMats={beamMats} />
    </Canvas>
  )
}
