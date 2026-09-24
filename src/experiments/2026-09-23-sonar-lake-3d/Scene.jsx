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
function makeTreeGeometry() {
  const parts = []
  const trunk = new THREE.CylinderGeometry(0.12, 0.28, 1, 7)
  trunk.translate(0, 0.5, 0)
  parts.push(trunk)
  for (let i = 0; i < 3; i++) {
    const b = new THREE.CylinderGeometry(0.03, 0.07, 0.45, 5)
    b.translate(0, 0.225, 0)
    b.rotateZ(0.9 + rnd() * 0.5)
    b.rotateY(i * 2.1 + rnd())
    b.translate(0, 0.45 + i * 0.18, 0)
    parts.push(b)
  }
  const g = mergeGeometries(parts)
  const col = new Float32Array(g.attributes.position.count * 3).fill(0)
  for (let i = 0; i < col.length; i += 3) { col[i] = 0.26; col[i + 1] = 0.2; col[i + 2] = 0.14 }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  return g
}
function Timber({ mat }) {
  const geo = useMemo(makeTreeGeometry, [])
  const ref = useRef()
  const items = useMemo(() => {
    const out = []
    for (let i = 0; i < 34; i++) {
      // standing dead timber on the shelf edge and one cluster in the deep
      const cluster = i < 24 ? [-18, 6] : [12, -14]
      const x = cluster[0] + (rnd() - 0.5) * 22, z = cluster[1] + (rnd() - 0.5) * 22
      const h = 3 + rnd() * 6 // 3–9 m tall drowned trees
      out.push({ x, z, y: bedY(x, z) - 0.2, h, rot: rnd() * 6.28, tilt: (rnd() - 0.5) * 0.15 })
    }
    for (let i = 0; i < 20; i++) { // stumps
      const x = -20 + (rnd() - 0.5) * 30, z = (rnd() - 0.5) * 40
      out.push({ x, z, y: bedY(x, z) - 0.1, h: 0.5 + rnd() * 0.8, rot: rnd() * 6.28, tilt: 0 })
    }
    return out
  }, [])
  useEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler()
    items.forEach((it, i) => {
      e.set(it.tilt, it.rot, 0); q.setFromEuler(e)
      m.compose(new THREE.Vector3(it.x, it.y, it.z), q, new THREE.Vector3(1 + it.h * 0.08, it.h, 1 + it.h * 0.08))
      ref.current.setMatrixAt(i, m)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [items])
  return <instancedMesh ref={ref} args={[geo, mat, items.length]} />
}

function Rocks({ mat }) {
  const geo = useMemo(() => {
    const g = new THREE.DodecahedronGeometry(0.6, 0)
    const col = new Float32Array(g.attributes.position.count * 3)
    for (let i = 0; i < col.length; i += 3) { col[i] = 0.45; col[i + 1] = 0.44; col[i + 2] = 0.4 }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [])
  const ref = useRef()
  const items = useMemo(() => {
    const out = []
    for (let i = 0; i < 60; i++) { // rock pile on the hump at (30,12)
      const a = rnd() * 6.28, r = rnd() * 9
      const x = 30 + Math.cos(a) * r, z = 12 + Math.sin(a) * r * 0.7
      const s = 0.5 + rnd() * 1.6 // 0.3–1.3 m boulders
      out.push({ x, z, y: bedY(x, z) + s * 0.25, s, rot: rnd() * 6.28 })
    }
    return out
  }, [])
  useEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion()
    items.forEach((it, i) => {
      q.setFromEuler(new THREE.Euler(it.rot, it.rot * 1.7, 0))
      m.compose(new THREE.Vector3(it.x, it.y, it.z), q, new THREE.Vector3(it.s, it.s * 0.7, it.s))
      ref.current.setMatrixAt(i, m)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [items])
  return <instancedMesh ref={ref} args={[geo, mat, items.length]} />
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
function makeBoatGeometry() {
  // 5.6 m bass boat: hull outline extruded, plus deck/console
  const s = new THREE.Shape()
  s.moveTo(2.8, 0); s.quadraticCurveTo(2.5, 0.9, 1.2, 1.05); s.lineTo(-2.5, 1.05); s.quadraticCurveTo(-2.8, 1.0, -2.8, 0.7)
  s.lineTo(-2.8, -0.7); s.quadraticCurveTo(-2.8, -1.0, -2.5, -1.05); s.lineTo(1.2, -1.05); s.quadraticCurveTo(2.5, -0.9, 2.8, 0)
  const hull = new THREE.ExtrudeGeometry(s, { depth: 0.75, bevelEnabled: false }); hull.rotateX(-Math.PI / 2); hull.translate(0, -0.45, 0)
  const console_ = new THREE.BoxGeometry(0.8, 0.6, 0.9); console_.translate(-0.2, 0.55, 0)
  const motor = new THREE.BoxGeometry(0.5, 0.7, 0.4); motor.translate(-2.9, 0.15, 0)
  return mergeGeometries([hull, console_, motor])
}
function Boat({ state, beamMats }) {
  const geo = useMemo(makeBoatGeometry, [])
  const group = useRef()
  useFrame((_, dt) => {
    const s = state.current
    // ease toward the target, keep inside the lake
    s.boat.x += (s.target.x - s.boat.x) * Math.min(1, dt * 4)
    s.boat.z += (s.target.z - s.boat.z) * Math.min(1, dt * 4)
    group.current.position.set(s.boat.x, 0.05, s.boat.z)
    // device under the bow
    s.apex.set(s.boat.x + 2.3, -0.35, s.boat.z)
    setBeamUniforms(beamMats, s.specs, s.apex)
  })
  return (
    <group ref={group}>
      <mesh geometry={geo}><meshStandardMaterial color="#d9dde2" roughness={0.6} /></mesh>
      <mesh position={[2.3, -0.35, 0]}><boxGeometry args={[0.35, 0.25, 0.22]} /><meshStandardMaterial color="#111" /></mesh>
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
    camera.position.set(-26 + px * 4, 54 + py * 2, 46 + px * 2)
    camera.lookAt(10 + px * 2, -8, -2)
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
      <Timber mat={mats.inst} />
      <Rocks mat={mats.inst} />
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
