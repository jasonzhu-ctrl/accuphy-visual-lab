import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries as _merge } from 'three/addons/utils/BufferGeometryUtils.js'
// Extrude geometries are non-indexed, primitives are indexed — normalise first.
const mergeGeometries = (parts) => _merge(parts.map((g) => (g.index ? g.toNonIndexed() : g)))
import { HALF, SEG, bedY, fbm } from './terrain'
import { SPECIES, makePopulation, fishPose, rnd } from './fish'
import { makeLakeMaterial, setBeamUniforms } from './lakeMaterial'
import { wedgeGeometry } from '../2026-09-23-beam-shapes-3d/wedge'
import { makeTallTree, makeBushTree, makeStump, makeLog, makeWeedTuft, makeRock, placeAll } from './vegetation'
import { makeRangerBoat, TRANSDUCER_OFFSET } from './boat'

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
  return geos.map((g, k) => <instancedMesh key={k} ref={(el) => (refs.current[k] = el)} args={[g, mat, Math.max(1, buckets[k].length)]} frustumCulled={false} />)
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
    // 7.5 m wooden boat hull on its side in the basin
    const shape = new THREE.Shape()
    shape.moveTo(-3.75, 0); shape.quadraticCurveTo(-3.6, 1.1, -2.2, 1.15); shape.lineTo(3.0, 1.0)
    shape.quadraticCurveTo(3.7, 0.6, 3.75, 0); shape.quadraticCurveTo(3.7, -0.6, 3.0, -1.0); shape.lineTo(-2.2, -1.15)
    shape.quadraticCurveTo(-3.6, -1.1, -3.75, 0)
    const hull = new THREE.ExtrudeGeometry(shape, { depth: 1.3, bevelEnabled: true, bevelSize: 0.15, bevelThickness: 0.15, bevelSegments: 2 })
    hull.rotateX(-Math.PI / 2)
    const cabin = new THREE.BoxGeometry(2.2, 1.1, 1.6); cabin.translate(-0.5, 1.6, 0)
    const g = mergeGeometries([hull, cabin])
    const col = new Float32Array(g.attributes.position.count * 3)
    for (let i = 0; i < col.length; i += 3) { col[i] = 0.36; col[i + 1] = 0.3; col[i + 2] = 0.22 }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [])
  const x = 16, z = -26
  return <mesh geometry={geo} material={mat} position={[x, bedY(x, z) - 0.3, z]} rotation={[0.35, 0.6, 0.1]} />
}

// ---------- fish ----------
function makeFishGeometry() {
  const body = new THREE.SphereGeometry(0.5, 10, 8); body.scale(1, 0.32, 0.16)
  const tail = new THREE.ConeGeometry(0.16, 0.3, 4); tail.rotateZ(Math.PI / 2); tail.scale(1, 1, 0.25); tail.translate(-0.55, 0, 0)
  const fin = new THREE.ConeGeometry(0.1, 0.22, 3); fin.scale(1, 1, 0.2); fin.translate(0.05, 0.22, 0)
  return mergeGeometries([body, tail, fin])
}
function Fish({ mat, revealRef }) {
  const geo = useMemo(makeFishGeometry, [])
  const pop = useMemo(() => makePopulation(bedY), [])
  const ref = useRef()
  useEffect(() => {
    const c = new THREE.Color()
    pop.forEach((f, i) => { c.set(SPECIES[f.species].color); ref.current.setColorAt(i, c) })
    ref.current.instanceColor.needsUpdate = true
  }, [pop])
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), e: new THREE.Euler(), p: new THREE.Vector3(), s: new THREE.Vector3(), pose: {} }), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    pop.forEach((f, i) => {
      const o = fishPose(f, t, tmp.pose)
      tmp.e.set(0, o.heading, Math.sin(t * 6 + f.phase) * 0.08); tmp.q.setFromEuler(tmp.e)
      tmp.p.set(o.x, o.y, o.z); tmp.s.set(f.len, f.len, f.len)
      tmp.m.compose(tmp.p, tmp.q, tmp.s)
      ref.current.setMatrixAt(i, tmp.m)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return <instancedMesh ref={ref} args={[geo, mat, pop.length]} frustumCulled={false} />
}

// ---------- water surface ----------
function Water() {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uSun: { value: new THREE.Vector3(0.4, 0.8, 0.3).normalize() }, uSky: { value: new THREE.Color('#9cc1cf') } },
    vertexShader: /* glsl */ `
      uniform float uTime; varying vec3 vW; varying vec3 vN;
      void main() {
        vec3 p = position;
        float w = 0.06 * sin(p.x * 0.6 + uTime * 0.9) + 0.05 * sin(p.z * 0.8 - uTime * 0.7) + 0.03 * sin((p.x + p.z) * 1.7 + uTime * 1.6);
        p.y += w;
        float dx = 0.036 * cos(p.x * 0.6 + uTime * 0.9) + 0.051 * cos((p.x + p.z) * 1.7 + uTime * 1.6);
        float dz = 0.04 * cos(p.z * 0.8 - uTime * 0.7) + 0.051 * cos((p.x + p.z) * 1.7 + uTime * 1.6);
        vN = normalize(vec3(-dx, 1.0, -dz));
        vec4 wp = modelMatrix * vec4(p, 1.0); vW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float; varying vec3 vW; varying vec3 vN; uniform vec3 uSun; uniform vec3 uSky;
      void main() {
        vec3 v = normalize(cameraPosition - vW);
        float fres = pow(1.0 - max(dot(v, vN), 0.0), 3.0);
        vec3 deep = vec3(0.14, 0.47, 0.56), sky = vec3(0.66, 0.80, 0.88);
        vec3 h = normalize(uSun + v);
        float spec = pow(max(dot(vN, h), 0.0), 180.0);
        vec3 col = mix(deep, sky, fres * 0.8) + spec * 0.6;
        float alpha = 0.46 + 0.4 * fres;
        // blend into the sky toward the horizon so the far edge never shows
        float dist = length(vW - cameraPosition);
        float fog = smoothstep(120.0, 420.0, dist);
        gl_FragColor = vec4(mix(col, uSky, fog), mix(alpha, 1.0, fog));
      }
    `,
  }), [])
  useFrame(({ clock }) => { mat.uniforms.uTime.value = clock.elapsedTime })
  return (
    <mesh rotation-x={-Math.PI / 2} material={mat}>
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
  return <group ref={group}><primitive object={boat} /></group>
}
function Beams({ state }) {
  const group = useRef()
  const specs = state.current.specs
  const meshes = useMemo(() => specs.map((spec) => {
    const g = wedgeGeometry(spec)
    return { g, e: new THREE.EdgesGeometry(g, 25) }
  }), [specs])
  useFrame(() => { group.current.position.copy(state.current.apex) })
  return (
    <group ref={group}>
      {meshes.map((m, i) => (
        <group key={i}>
          <mesh geometry={m.g}>
            <meshPhysicalMaterial color="#5fd3ff" transparent opacity={0.16} side={THREE.DoubleSide} depthWrite={false} roughness={0.3} />
          </mesh>
          <lineSegments geometry={m.e}><lineBasicMaterial color="#dff7ff" transparent opacity={0.6} /></lineSegments>
        </group>
      ))}
    </group>
  )
}

// ---------- camera + picking ----------
function Rig({ state }) {
  const { camera } = useThree()
  useFrame(() => {
    const s = state.current
    // fixed 3/4 aerial view like the PL animations; slight parallax from the pointer
    const px = s.parallax.x, py = s.parallax.y
    // view from the south: drop-off timber on the left, rock hump on the right
    camera.position.set(-14 + px * 4, 52 + py * 2, 66 + px * 2)
    camera.lookAt(3 + px * 2, -9, 0)
  })
  return null
}
function PickPlane({ state }) {
  const onDown = (e) => { e.stopPropagation(); state.current.dragging = true; e.target.setPointerCapture?.(e.pointerId); move(e) }
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

export default function LakeScene({ state }) {
  const mats = useMemo(() => ({ bed: makeLakeMaterial(), inst: makeLakeMaterial() }), [])
  const beamMats = useMemo(() => [mats.bed, mats.inst], [mats])
  return (
    <Canvas dpr={[1, 1.75]} camera={{ fov: 38, near: 0.5, far: 400, position: [-38, 34, 54] }} gl={{ antialias: true }}>
      <color attach="background" args={['#9cc1cf']} />
      <fog attach="fog" args={['#9cc1cf', 160, 420]} />
      <hemisphereLight args={['#dbe9f0', '#2a3a2a', 0.9]} />
      <directionalLight position={[40, 80, 30]} intensity={1.4} />
      <Lakebed mat={mats.bed} />
      <mesh rotation-x={-Math.PI / 2} position-y={-26}><planeGeometry args={[900, 900]} /><meshBasicMaterial color="#17545f" /></mesh>
      <Structures mat={mats.inst} />
      <Wreck mat={mats.inst} />
      <Fish mat={mats.inst} />
      <Water />
      <Boat state={state} beamMats={beamMats} />
      <Beams key={state.current.specKey} state={state} />
      <PickPlane state={state} />
      <Rig state={state} />
    </Canvas>
  )
}
