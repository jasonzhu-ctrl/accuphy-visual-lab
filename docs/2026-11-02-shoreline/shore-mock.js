// One shoreline for the summer lake and the ice page, as real 3D models in the page's own scene (界面设计 mock only, so the
// look is proved with the page's lights and fog). Jason 11-02: same lake, winter adds snow; new models must look premium.
(() => {
  const T = window.__THREE, scene = window.__scene, ICE = !!window.__sonarState?.ice, DUSK = /time=dusk/.test(location.search)
  const TAU = Math.PI * 2
  const R = (t) => 59.5 + 1.4 * Math.sin(3 * t + 0.7) + 0.7 * Math.sin(7 * t + 2.1) // the shore: 57.4–61.6 m from the centre
  window.__shoreR = R
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s) }
  const noise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v }
  const fbm = (x, y) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 5; i++) { s += a * noise(x * f, y * f); f *= 2.03; a *= 0.5 } return s }
  let seed = 9173; const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  const lerp = (a, b, k) => a + (b - a) * k, sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
  const C = (r, g, b) => new T.Color(r / 255, g / 255, b / 255).convertSRGBToLinear?.() ?? new T.Color(r / 255, g / 255, b / 255)
  const col = (c) => { const o = C(...c); return [o.r, o.g, o.b] }
  const mixc = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]

  // the ground across the shore: d = metres from the waterline (negative = under water / under the ice)
  const height = (d, t) => {
    const n = fbm(t * 40, d * 0.12)
    if (d < 0) return Math.max(-3.6, -0.12 + d * 0.3 - 0.15 * n * sm(-2, -10, d)) // the bottom rising to the shore, into the lakebed
    const beach = d * 0.16                         // a gentle beach
    const bank = sm(2.2, 6.5, d) * (1.25 + 0.45 * fbm(t * 23, 3.1)) // the bank
    const land = sm(6, 60, d) * 1.6 + (fbm(t * 9, d * 0.05) - 0.5) * 0.9 * sm(8, 30, d)
    return Math.min(beach, 0.36) + bank + land + (ICE ? 0.22 * sm(0.3, 2.5, d) : 0) // winter: the snow's thickness
  }
  const PROF = [-12, -9.5, -7.5, -5.5, -4, -2.8, -1.8, -1.1, -0.6, -0.25, 0, 0.25, 0.55, 0.9, 1.35, 1.9, 2.5, 3.2, 4, 5, 6.3, 8, 10.5, 14, 19, 26, 36, 50, 70, 100, 140, 190]
  const summer = { bed: col([40, 52, 48]), sandWet: col([104, 94, 76]), sand: col([178, 164, 132]), sandDeep: col([128, 122, 100]), grass: col([86, 110, 64]), grass2: col([104, 122, 72]), floor: col([58, 70, 48]) }
  const winter = { snow: col([236, 241, 247]), snowShade: col([200, 212, 230]), iceEdge: col([176, 198, 216]), bottom: col([60, 84, 92]), bed: col([30, 44, 50]), floor: col([214, 224, 236]) }
  function groundColor (d, t) {
    const n = fbm(t * 60, d * 0.4), m = fbm(t * 13 + 5, d * 0.08)
    if (ICE) {
      if (d < 0) return mixc(mixc(winter.bed, winter.bottom, sm(-12, -4, d)), winter.iceEdge, sm(-4, 0, d) * 0.5)
      if (d < 0.6) return mixc(winter.iceEdge, winter.snow, sm(0, 0.6, d))
      return mixc(winter.snow, winter.snowShade, 0.25 + 0.5 * m * sm(6, 20, d) + 0.25 * n * 0.5)
    }
    if (d < 0) return mixc(mixc(summer.bed, summer.sandDeep, sm(-12, -3, d)), summer.sand, sm(-3, 0, d) * 0.6)
    if (d < 0.9) return mixc(summer.sandWet, summer.sand, sm(0.3, 0.9, d) * 0.6 + n * 0.15)
    if (d < 2.4) return mixc(summer.sand, summer.grass, sm(1.8, 2.4, d) * (0.4 + n * 0.6))
    const g = mixc(summer.grass, summer.grass2, m)
    return mixc(g, summer.floor, sm(8, 18, d) * (0.5 + 0.5 * n))
  }
  function strip (prof, N, yOff = 0, colorFn = groundColor) {
    const M = prof.length, pos = new Float32Array((N + 1) * M * 3), colr = new Float32Array((N + 1) * M * 3), idx = []
    for (let i = 0; i <= N; i++) {
      const t = i / N * TAU, r = R(t)
      for (let j = 0; j < M; j++) {
        const d = prof[j] + (fbm(t * 30, j) - 0.5) * 0.35 * (j > 0 && j < M - 1 ? 1 : 0), rr = r + d, k = (i * M + j) * 3
        pos[k] = rr * Math.cos(t); pos[k + 1] = height(d, t) + yOff; pos[k + 2] = rr * Math.sin(t)
        const c = colorFn(d, t); colr[k] = c[0]; colr[k + 1] = c[1]; colr[k + 2] = c[2]
      }
    }
    for (let i = 0; i < N; i++) for (let j = 0; j < M - 1; j++) { const a = i * M + j, b = (i + 1) * M + j; idx.push(a, b, a + 1, b, b + 1, a + 1) }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('color', new T.BufferAttribute(colr, 3)); g.setIndex(idx); g.computeVertexNormals(); return g
  }

  // a conifer: six irregular tiers (no two alike), drooping edges, darker inside, lighter tips; winter: snow on the tops
  function conifer (s) {
    seed = s; const parts = [], h = 1, tiers = 7
    const trunk = new T.CylinderGeometry(0.012, 0.022, 0.35, 8, 1, true); trunk.translate(0, 0.175, 0); trunk.computeVertexNormals(); parts.push([trunk, 'trunk'])
    for (let k = 0; k < tiers; k++) {
      const y0 = 0.1 + k * 0.118, hh = 0.2 + (1 - k / tiers) * 0.06, rad = (0.2 - k * 0.024) * (0.9 + rnd() * 0.22)
      const cone = new T.ConeGeometry(rad, hh, 20, 4, true); cone.translate(0, y0 + hh / 2, 0)
      const p = cone.attributes.position
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), rr = Math.hypot(x, z); if (rr < 1e-4) continue
        const j = 0.78 + 0.42 * noise(a * 2.2 + k * 7.3, y * 9 + s), droop = (rr / rad) ** 2 * 0.045
        p.setXYZ(i, Math.cos(a) * rr * j, y - droop, Math.sin(a) * rr * j) }
      cone.computeVertexNormals(); parts.push([cone, 'needle'])
    }
    const pos = [], colr = [], nrms = []
    const bark = col([66, 54, 46]), inner = col(ICE ? [30, 48, 44] : [26, 46, 34]), tip = col(ICE ? [62, 86, 72] : [58, 88, 58]), snow = col([236, 242, 248])
    for (const [g0, kind] of parts) {
      const g = g0.toNonIndexed(); const p = g.attributes.position, nrm = g.attributes.normal
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i); pos.push(x, y, z); nrms.push(nrm.getX(i), nrm.getY(i) * 0.6 + 0.4, nrm.getZ(i))
        let c = bark
        if (kind === 'needle') { const rr = Math.hypot(x, z); c = mixc(inner, tip, Math.min(1, rr * 5.5) * (0.6 + 0.4 * noise(x * 40, z * 40 + y * 30)))
          if (ICE && nrm.getY(i) > 0.02) c = mixc(c, snow, Math.min(1, (nrm.getY(i) - 0.02) * 2.2) * (0.6 + 0.4 * noise(x * 30 + 3, z * 30))) }
        colr.push(...c)
      }
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new T.Float32BufferAttribute(colr, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(nrms, 3)); g.normalizeNormals(); return g
  }
  function rockGeo (s) {
    const g = new T.IcosahedronGeometry(1, 2), p = g.attributes.position
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 0.72 + 0.5 * fbm(x * 1.6 + s, y * 1.6 + z * 1.3); p.setXYZ(i, x * k, Math.max(-0.3, y) * k * 0.62, z * k) }
    g.computeVertexNormals(); const n = g.attributes.normal, c = []
    const wet = col([70, 72, 72]), dry = col([118, 116, 110]), snow = col([234, 240, 246])
    for (let i = 0; i < p.count; i++) { let cc = mixc(wet, dry, Math.max(0, Math.min(1, p.getY(i) * 1.6 + 0.3)) * (ICE ? 0.6 : 1)); if (ICE && n.getY(i) > 0.35) cc = mixc(cc, snow, Math.min(1, (n.getY(i) - 0.35) * 2.2)); c.push(...cc) }
    g.setAttribute('color', new T.Float32BufferAttribute(c, 3)); return g
  }

  window.__shore3dClear = () => { const o = scene.getObjectByName('mockShore'); if (o) { scene.remove(o); o.traverse((m) => { m.geometry?.dispose(); m.material?.dispose?.() }) } }
  window.__shore3d = () => {
    window.__shore3dClear()
    const grp = new T.Group(); grp.name = 'mockShore'
    const ground = new T.Mesh(strip(PROF, 900), new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.94, metalness: 0 })); grp.add(ground)
    if (!ICE) { // the wet edge: a thin glossy band at the waterline that catches the sky
      const wet = new T.Mesh(strip([-0.35, -0.1, 0.2, 0.55, 0.85], 900, 0.006, () => col([92, 84, 70])), new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.18, metalness: 0, transparent: true, opacity: 0.55, depthWrite: false })); grp.add(wet)
    } else { // the iced-over shore: a slightly raised, cracked rim of shore ice
      const rim = new T.Mesh(strip([-1.2, -0.6, 0, 0.5], 900, 0.03, (d, t) => mixc(col([196, 214, 230]), col([226, 236, 246]), fbm(t * 80, d))), new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.32, metalness: 0 })); grp.add(rim)
    }
    // trees: three variants, instanced; set back 8–45 m from the water, in loose groups with clearings; 5–10 m tall
    const tmat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0 })
    const variants = [conifer(11), conifer(23), conifer(37)].map((g) => new T.InstancedMesh(g, tmat, 420))
    const counts = [0, 0, 0], m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), v = new T.Vector3(), sc = new T.Vector3()
    seed = 5531
    for (let i = 0; i < 2600; i++) {
      const t = rnd() * TAU, grpN = fbm(t * 14, 1.7); if (grpN < 0.42 && rnd() < 0.8) continue
      const d = 7 + Math.pow(rnd(), 0.75) * 40, r = R(t) + d, near = sm(7, 22, d), hgt = lerp(2.2 + rnd() * 3, 5 + rnd() * 8, near) * (0.75 + 0.5 * grpN), k = Math.floor(rnd() * 3)
      if (fbm(t * 5 + 2, d * 0.04) < 0.38) continue // clearings
      if (counts[k] >= 420) continue
      v.set(r * Math.cos(t), height(d, t) - 0.05, r * Math.sin(t)); e.set((rnd() - 0.5) * 0.06, rnd() * TAU, (rnd() - 0.5) * 0.06); q.setFromEuler(e); { const wv = 0.7 + rnd() * 0.6; sc.set(hgt * wv, hgt, hgt * wv * (0.9 + rnd() * 0.2)) }
      m4.compose(v, q, sc); variants[k].setMatrixAt(counts[k]++, m4)
    }
    variants.forEach((im, k) => { im.count = counts[k]; im.instanceMatrix.needsUpdate = true; grp.add(im) })
    // rocks at the waterline, half in the water (winter: under the snow, a few showing)
    const rocks = new T.InstancedMesh(rockGeo(3), new T.MeshStandardMaterial({ vertexColors: true, roughness: ICE ? 0.8 : 0.5, metalness: 0 }), 700); let rc = 0
    for (let i = 0; i < 2400 && rc < 700; i++) {
      const t = rnd() * TAU; if (fbm(t * 26, 9.1) < 0.5) continue
      const d = -1.4 + rnd() * 3.6, r = R(t) + d, s = 0.18 + Math.pow(rnd(), 2) * 0.9
      v.set(r * Math.cos(t), height(d, t) - s * 0.25, r * Math.sin(t)); e.set(rnd() * 0.4, rnd() * TAU, rnd() * 0.4); q.setFromEuler(e); sc.set(s * (0.8 + rnd() * 0.6), s, s * (0.8 + rnd() * 0.6))
      m4.compose(v, q, sc); rocks.setMatrixAt(rc++, m4)
    }
    rocks.count = rc; rocks.instanceMatrix.needsUpdate = true; grp.add(rocks)
    scene.add(grp)
    return { trees: counts, rocks: rc }
  }
  // the tap past the shore (UI, not scene): aim ring stops 1.5 m inside; ghost ring where the finger was; one quiet line
  window.__shoreCue = (bx, bz, tx, tz, text, ring = true) => {
    const cam = window.__cam; cam.updateMatrixWorld(); const V = cam.position.constructor
    let c = document.getElementById('cue-cv'); if (!c) { c = document.createElement('canvas'); c.id = 'cue-cv'; c.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9'; document.body.appendChild(c) }
    const dpr = devicePixelRatio || 1; c.width = innerWidth * dpr; c.height = innerHeight * dpr; const g = c.getContext('2d', { willReadFrequently: true }); g.setTransform(dpr, 0, 0, dpr, 0, 0)
    const P = (x, y, z) => { const v = new V(x, y, z).project(cam); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight] }
    let k = 0; const dx = tx - bx, dz = tz - bz
    for (let s = 0; s <= 1; s += 0.002) { const x = bx + dx * s, z = bz + dz * s; if (Math.hypot(x, z) > R(Math.atan2(z, x)) - 1.5) break; k = s }
    const cx = bx + dx * k, cz = bz + dz * k
    const circ = (x, z, r, cl, lw, dash) => { g.save(); g.strokeStyle = cl; g.lineWidth = lw; g.setLineDash(dash || []); g.beginPath(); for (let i = 0; i <= 64; i++) { const a = i / 64 * TAU, p = P(x + r * Math.cos(a), 0.03, z + r * Math.sin(a)); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]) } g.stroke(); g.restore() }
    if (ring) { circ(tx, tz, 1.1, 'rgba(255,255,255,0.36)', 1.5, [5, 5]); circ(cx, cz, 1.25, 'rgba(2,140,223,0.5)', 7); circ(cx, cz, 1.25, '#fff', 2)
      const a = P(tx, 0.03, tz), b = P(cx, 0.03, cz); g.save(); g.strokeStyle = 'rgba(255,255,255,0.42)'; g.lineWidth = 1.5; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.restore() }
    const p = P(cx, 0.03, cz), pill = document.createElement('div'); pill.className = 'edge-pill'; pill.textContent = text
    pill.style.cssText = `position:fixed;left:${p[0]}px;top:${p[1] - 26}px;transform:translate(-50%,-100%);z-index:65;pointer-events:none;padding:6px 12px;border-radius:999px;background:rgba(14,28,36,0.86);border:1px solid rgba(255,255,255,0.16);box-shadow:0 8px 20px rgba(2,20,30,0.35);color:#fff;font:600 12.5px/1.2 'Instrument Sans',system-ui,sans-serif;letter-spacing:0.01em;white-space:nowrap`
    document.body.appendChild(pill); return { clamp: [+cx.toFixed(2), +cz.toFixed(2)] }
  }
  window.__cueClear = () => { document.getElementById('cue-cv')?.remove(); document.querySelectorAll('.edge-pill').forEach((e) => e.remove()) }
  // a close-up from a camera of our own (desktop, near the edge): one frame, returned as a PNG data URL
  window.__closeup = (pos, look, fov = 40) => {
    const gl = window.__gl, cam = new T.PerspectiveCamera(fov, innerWidth / innerHeight, 0.1, 1600); cam.position.set(...pos); cam.lookAt(...look); cam.updateMatrixWorld()
    gl.setRenderTarget(null); gl.render(scene, cam); return gl.domElement.toDataURL('image/png')
  }
})()
