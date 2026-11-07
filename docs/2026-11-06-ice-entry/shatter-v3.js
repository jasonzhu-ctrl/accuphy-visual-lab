// shatter-v3.js: the desktop ice-fishing entry, version 3 (界面设计 mock, 2026-11-06). Jason on v2: no frost. He wants the
// whole screen to crack bit by bit and then fall away, showing the ice page behind it, and it must stay light.
// - The entry is a clean slab of ice with the ice camp inside it. On hover, a few fine cracks creep out from the pointer.
// - On click: one WebGL2 canvas is created for ~2.5 s. The current screen (a snapshot) is cut into Voronoi shards. Cracks
//   creep out from the click point, the shards loosen one after another and tumble down under gravity, with a cut side,
//   a lit edge and a cold blue sheen. The ice page under them shows through. The canvas is then deleted.
// - No library, no extra download: ~9 KB of code, ~100 shards, ~1.6k triangles. One time value drives everything.
// Own code. The idea (Voronoi shards, one progress value, gravity) is borrowed from Godot "Glass broken falling V2" and
// Framer "Glass Shatter Reveal"; nothing of their code is used. Mock only: no version of the Lab uses this file.
(function () {
  'use strict'
  const VS = `#version 300 es
in vec2 aPos; in vec2 aCen; in vec4 aRnd; in vec2 aEH;   // vertex uv, shard centre uv, (delay, spin, axis, drift), (edge, hash)
uniform float t, aspect, layer, thick, g, crackR; uniform vec2 click;
out vec2 vUv; out float vEdge; out vec3 vN; out float vH; out vec2 vW;
mat3 rot(vec3 k, float a){ k = normalize(k); float c = cos(a), s = sin(a);
  mat3 K = mat3(0., k.z, -k.y, -k.z, 0., k.x, k.y, -k.x, 0.); return mat3(1.) + s * K + (1. - c) * K * K; }
void main(){
  vec2 A = vec2(aspect, 1.);
  float tt = max(0., t - aRnd.x);
  float cracked = step(length((aCen - click) * A), crackR * (0.8 + 0.4 * aEH.y));
  float ang = cracked * 0.035 * (aEH.y - 0.5) + aRnd.y * tt * (0.35 + tt);   // a cracked shard settles a hair, then tumbles
  mat3 R = rot(vec3(cos(aRnd.z), sin(aRnd.z), 0.25), ang);
  vec3 C = vec3(aCen * A, 0.);
  vec3 l = vec3((aPos - aCen) * A, -layer * thick);
  vec2 away = normalize((aCen - click) * A + 1e-4);
  vec3 T = vec3(away * 0.035 * min(tt * 5., 1.) + vec2(aRnd.w * tt, -0.5 * g * tt * tt), 0.35 * tt);
  vec3 P = C + R * l + T;
  float s = 2.2 / (2.2 - P.z);                                  // a little perspective: a shard coming forward grows
  vec2 Q = A * 0.5 + (P.xy - A * 0.5) * s;
  gl_Position = vec4(Q / A * 2. - 1., clamp(-P.z * 0.3, -1., 1.), 1.);
  vUv = aPos; vEdge = aEH.x; vH = aEH.y; vN = R * vec3(0., 0., 1.); vW = aPos * A;
}`
  const FS = `#version 300 es
precision highp float;
in vec2 vUv; in float vEdge; in vec3 vN; in float vH; in vec2 vW;
uniform sampler2D tex; uniform float crackR, layer, flash, aspect; uniform vec2 click;
out vec4 o;
void main(){
  vec3 col = texture(tex, vUv).rgb;
  vec3 N = normalize(vN); float tilt = clamp(1. - N.z, 0., 1.);
  if (layer > 0.5) { o = vec4(mix(col, vec3(0.64, 0.82, 0.94), 0.7) * (0.75 + 0.25 * N.y), 1.); return; }  // the cut side
  float d = distance(vW, click * vec2(aspect, 1.));
  float shown = step(d, crackR * (0.8 + 0.4 * vH));             // the crack front has reached this shard
  float w = fwidth(vEdge);
  float line = 1. - smoothstep(0., w * 1.3, vEdge);            // a ~1 px crack on the shard's edge
  float glow = 1. - smoothstep(0., w * 7., vEdge);
  vec3 L = normalize(vec3(-0.45, 0.55, 0.7));
  float spec = pow(max(dot(reflect(-L, N), vec3(0., 0., 1.)), 0.), 40.);
  col = mix(col, vec3(0.80, 0.91, 1.0), tilt * 0.5);           // cold blue sheen as the shard turns
  col += shown * (line * 0.8 + glow * 0.10) * vec3(0.88, 0.96, 1.0);
  col += spec * 0.8 + tilt * 0.06;
  col += flash * exp(-d * d * 90.) * vec3(0.9, 0.97, 1.);       // the hit
  o = vec4(col, 1.);
}`

  function rng (seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }

  // Voronoi shards over a W × H screen, denser near the hit: each cell is the screen rectangle clipped by the half-planes
  function shards (W, H, cx, cy, n, seed) {
    const r = rng(seed), pts = [], D = Math.hypot(W, H)
    while (pts.length < n) {
      let x, y
      if (r() < 0.72) { const d = Math.pow(r(), 1.7) * D * 0.9, a = r() * Math.PI * 2; x = cx + Math.cos(a) * d; y = cy + Math.sin(a) * d } else { x = r() * W; y = r() * H }
      if (x > 2 && y > 2 && x < W - 2 && y < H - 2) pts.push([x, y])
    }
    return pts.map((p, i) => {
      let poly = [[0, 0], [W, 0], [W, H], [0, H]]
      for (let j = 0; j < pts.length && poly.length; j++) {
        if (j === i) continue
        const q = pts[j], nx = q[0] - p[0], ny = q[1] - p[1], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2
        const side = (v) => (v[0] - mx) * nx + (v[1] - my) * ny
        const out = []
        for (let k = 0; k < poly.length; k++) {
          const a = poly[k], b = poly[(k + 1) % poly.length], sa = side(a), sb = side(b)
          if (sa <= 0) out.push(a)
          if ((sa <= 0) !== (sb <= 0)) { const u = sa / (sa - sb); out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]) }
        }
        poly = out
      }
      return poly
    }).filter((p) => p.length >= 3).map((poly) => jag(poly, W, H))
  }
  // break each straight Voronoi edge into a slightly crooked line, the same way from both shards that share it (the bend
  // comes from a hash of the edge's two end points), so no gap opens; the screen border stays straight
  function jag (poly, W, H) {
    const out = [], key = (v) => `${Math.round(v[0] * 4)},${Math.round(v[1] * 4)}`
    const onBorder = (a, b) => (Math.abs(a[0] - b[0]) < 0.5 && (a[0] < 0.5 || a[0] > W - 0.5)) || (Math.abs(a[1] - b[1]) < 0.5 && (a[1] < 0.5 || a[1] > H - 0.5))
    for (let k = 0; k < poly.length; k++) {
      const a = poly[k], b = poly[(k + 1) % poly.length]; out.push(a)
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]); if (len < 14 || onBorder(a, b)) continue
      const fw = key(a) < key(b), p = fw ? a : b, q = fw ? b : a, hr = rng([...(key(p) + key(q))].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261))
      const nx = -(q[1] - p[1]) / len, ny = (q[0] - p[0]) / len, amp = Math.min(len * 0.09, 7), n = len > 60 ? 3 : 2
      const mids = []; for (let i = 1; i <= n; i++) { const u = i / (n + 1) + (hr() - 0.5) * 0.12, o = (hr() - 0.5) * 2 * amp; mids.push([p[0] + (q[0] - p[0]) * u + nx * o, p[1] + (q[1] - p[1]) * u + ny * o]) }
      out.push(...(fw ? mids : mids.reverse()))
    }
    return out
  }

  function program (gl) {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s }
    const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS))
    ;['aPos', 'aCen', 'aRnd', 'aEH'].forEach((n, i) => gl.bindAttribLocation(p, i, n)); gl.linkProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p))
    const u = {}; for (let i = 0; i < gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i++) { const n = gl.getActiveUniform(p, i).name; u[n] = gl.getUniformLocation(p, n) }
    return { p, u }
  }

  // the full-screen shatter, in two halves so the click itself costs almost nothing:
  // Shatter(parent, cx, cy) makes the canvas, the shader and the shards around (cx, cy) (the entry calls it when the pointer
  // reaches the slab); start(snapshot, x, y) uploads the screen copy, puts the hit at (x, y) and shows the canvas
  function Shatter (parent, cx, cy, opts) {
    const o = Object.assign({ n: 100, seed: 7, dpr: Math.min(devicePixelRatio || 1, 2, 2560 / innerWidth) }, opts) // ≤ 2560 px wide: ~50 MB at most, freed after
    const W = innerWidth, H = innerHeight, A = W / H
    const cv = document.createElement('canvas'); cv.className = 'ic3-shatter'; cv.width = Math.round(W * o.dpr); cv.height = Math.round(H * o.dpr)
    cv.style.visibility = 'hidden'; parent.appendChild(cv)
    // no multisampling on a sharp (2×) screen: it would add a second full-size buffer for edges nobody can see
    const gl = cv.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: o.dpr < 1.5, preserveDrawingBuffer: !!o.preserve })
    const pr = program(gl)
    const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    const r = rng(o.seed + 1), cu = cx / W, cvv = 1 - cy / H
    const maxD = Math.max(...[[0, 0], [A, 0], [0, 1], [A, 1]].map(([x, y]) => Math.hypot(x - cu * A, y - cvv)))
    const data = []; let lastDelay = 0
    for (const poly of shards(W, H, cx, cy, o.n, o.seed)) {
      let mx = 0, my = 0; poly.forEach((v) => { mx += v[0]; my += v[1] }); mx /= poly.length; my /= poly.length
      const c = [mx / W, 1 - my / H], d = Math.hypot((c[0] - cu) * A, c[1] - cvv) / maxD
      const delay = 0.55 + 0.75 * d + 0.12 * r(); lastDelay = Math.max(lastDelay, delay)
      const rnd = [delay, (1.4 + 2.8 * r()) * (r() < 0.5 ? -1 : 1), r() * Math.PI * 2, (c[0] - cu) * 0.22 + (r() - 0.5) * 0.12], h = r()
      for (let k = 0; k < poly.length; k++) {
        const a = poly[k], b = poly[(k + 1) % poly.length]
        for (const [v, e] of [[[mx, my], 1], [a, 0], [b, 0]]) data.push(v[0] / W, 1 - v[1] / H, c[0], c[1], ...rnd, e, h)
      }
    }
    const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
    const S = 10 * 4; [[0, 2, 0], [1, 2, 2], [2, 4, 4], [3, 2, 8]].forEach(([i, n, off]) => { gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, n, gl.FLOAT, false, S, off * 4) })
    const count = data.length / 10, end = lastDelay + 1.35
    const set1 = (n, v) => pr.u[n] != null && gl.uniform1f(pr.u[n], v)
    let hu = cu, hv = cvv
    gl.useProgram(pr.p); frame(-1)                             // draw once while hidden: the GPU finishes its setup now
    function start (snapshot, x, y) {
      gl.bindTexture(gl.TEXTURE_2D, tx); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, snapshot)
      if (x != null) { hu = x / W; hv = 1 - y / H }
      cv.style.visibility = ''; frame(0)
    }
    function frame (t) {
      gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.enable(gl.DEPTH_TEST); gl.useProgram(pr.p); gl.uniform1i(pr.u.tex, 0)
      const cp = Math.min(t / 0.85, 1)
      set1('t', t); set1('aspect', A); set1('thick', 0.012); set1('g', 3.0); set1('crackR', maxD * 1.12 * (1 - Math.pow(1 - cp, 1.35)) + (t > 0 ? 0.02 : 0))
      set1('flash', t > 0 ? Math.exp(-t * 10) : 0); gl.uniform2f(pr.u.click, hu, hv)
      for (const layer of [1, 0]) { set1('layer', layer); gl.drawArrays(gl.TRIANGLES, 0, count) }
      return t < end
    }
    return { canvas: cv, start, frame, end, shards: count / 3, destroy () { gl.getExtension('WEBGL_lose_context')?.loseContext(); cv.remove() } }
  }

  // hover cracks on the slab: a few jagged branches out from where the pointer came in
  function crackPaths (x, y, w, h, seed) {
    const r = rng(seed), out = [], n = 3 + Math.floor(r() * 2)
    const walk = (x, y, a, len, depth) => {
      let d = `M${x.toFixed(1)} ${y.toFixed(1)}`, L = 0
      while (L < len) { const s = 3 + r() * 6; a += (r() - 0.5) * 0.8; x += Math.cos(a) * s; y += Math.sin(a) * s; L += s; d += ` L${x.toFixed(1)} ${y.toFixed(1)}`
        if (depth < 1 && r() < 0.12) walk(x, y, a + (r() < 0.5 ? 0.8 : -0.8), len * 0.4, depth + 1)
        if (x < -4 || y < -4 || x > w + 4 || y > h + 4) break }
      out.push({ d, len: L })
    }
    for (let i = 0; i < n; i++) walk(x, y, (i / n) * Math.PI * 2 + r() * 0.8, 22 + r() * 40, 0)
    return out
  }

  // the entry: ice slab + words. opts: { parent, left, bottom, w, h, backdrop, fullBackdrop, snapshot, manual, onEnter }
  function mount (opts) {
    const o = Object.assign({ left: 22, bottom: 58, w: 184, h: 120 }, opts)
    const css = `
.ic3{position:absolute;left:${o.left}px;bottom:${o.bottom}px;display:flex;align-items:center;gap:16px;z-index:40;cursor:pointer;text-decoration:none;color:#fff;transition:opacity .15s}
.ic3-tile{position:relative;width:${o.w}px;height:${o.h}px;border-radius:10px;overflow:hidden;flex:none;background:center/cover no-repeat;
  box-shadow:0 3px 0 rgba(170,214,238,.55),0 16px 30px rgba(2,16,24,.5),0 0 0 1px rgba(210,238,255,.4);transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s}
.ic3-tile::before{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  background:linear-gradient(160deg,rgba(225,244,255,.34),rgba(170,215,240,.05) 38%,rgba(130,195,235,.10) 70%,rgba(200,235,255,.22));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.75),inset 1px 0 0 rgba(255,255,255,.35),inset 0 -12px 20px rgba(150,205,240,.16)}
.ic3-tile::after{content:'';position:absolute;inset:-40% -60%;pointer-events:none;background:linear-gradient(105deg,transparent 42%,rgba(255,255,255,.32) 50%,transparent 58%);transform:translateX(-60%);transition:transform .9s ease}
.ic3:hover .ic3-tile{transform:translateY(-2px);box-shadow:0 3px 0 rgba(170,214,238,.7),0 20px 38px rgba(2,16,24,.55),0 0 0 1px rgba(220,244,255,.7),0 0 26px rgba(130,205,255,.28)}
.ic3:hover .ic3-tile::after{transform:translateX(60%)}
.ic3-tile svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.ic3-tile svg path{fill:none;stroke-linecap:round;stroke-linejoin:round;transition:stroke-dashoffset .55s cubic-bezier(.3,.7,.2,1),opacity .4s}
.ic3-words{display:flex;flex-direction:column;gap:5px;text-shadow:0 1px 3px rgba(0,16,24,.6)}
.ic3-t{font:800 16px/1 'Eurostile Heavy','Instrument Sans',sans-serif;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}
.ic3-t b{display:inline-block;margin-left:7px;color:#9ad8ff;transition:transform .25s}
.ic3:hover .ic3-t b{transform:translateX(4px)}
.ic3-s{font:500 12.5px/1.25 'Instrument Sans',system-ui,sans-serif;color:rgba(255,255,255,.74);white-space:nowrap}
.ic3-full{position:fixed;inset:0;z-index:80}
.ic3-dest{position:absolute;inset:0;background:center/cover no-repeat}
.ic3-shatter{position:absolute;inset:0;width:100%;height:100%}
`
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st)
    const root = document.createElement('a'); root.className = 'ic3'; root.href = '#'; root.setAttribute('aria-label', 'Try ice fishing: open the ice-fishing page')
    root.innerHTML = `<span class="ic3-tile" style="background-image:url('${o.backdrop}')"><svg viewBox="0 0 ${o.w} ${o.h}"></svg></span>
<span class="ic3-words"><span class="ic3-t">Try ice fishing<b>→</b></span><span class="ic3-s">Break through the ice.</span></span>`
    ;(o.parent || document.body).appendChild(root)
    const tile = root.querySelector('.ic3-tile'), svg = tile.querySelector('svg')
    let seed = 3
    function hover (x, y, instant) {          // x, y inside the tile, CSS px
      svg.innerHTML = ''
      for (const { d, len } of crackPaths(x, y, o.w, o.h, seed++)) {
        for (const [w, c] of [[2.2, 'rgba(190,232,255,.22)'], [0.6, 'rgba(255,255,255,.9)']]) {
          const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d)
          p.style.cssText = `stroke:${c};stroke-width:${w};stroke-dasharray:${len + 2};stroke-dashoffset:${instant ? 0 : len + 2}`; svg.appendChild(p)
          if (!instant) requestAnimationFrame(() => requestAnimationFrame(() => { p.style.strokeDashoffset = 0 }))
        }
      }
    }
    tile.addEventListener('pointerenter', (e) => { const b = tile.getBoundingClientRect(); hover(e.clientX - b.left, e.clientY - b.top) })
    tile.addEventListener('pointerleave', () => svg.querySelectorAll('path').forEach((p) => { p.style.opacity = 0 }))

    // snapshot = the screen as it is now (mock: the lake screenshot with the slab drawn in). A real build copies the 3D
    // canvas right after a render and draws the slab into it; the DOM panels fade out in the first 0.15 s.
    const shot = new Image(); shot.src = o.snapshot; const slab = new Image(); slab.src = o.backdrop
    function snapshot () {
      const c = document.createElement('canvas'), k = Math.min(devicePixelRatio || 1, 2, 2560 / innerWidth); c.width = Math.round(innerWidth * k); c.height = Math.round(innerHeight * k) // at most 2560 px wide: a sharp copy without a long first frame
      const x = c.getContext('2d'); x.scale(k, k); x.drawImage(shot, 0, 0, innerWidth, innerHeight)
      const b = tile.getBoundingClientRect(), ir = slab.width / slab.height, br = b.width / b.height
      const sw = ir > br ? slab.height * br : slab.width, sh = ir > br ? slab.height : slab.width / br
      x.save(); x.beginPath(); x.roundRect(b.left, b.top, b.width, b.height, 10); x.clip()
      x.drawImage(slab, (slab.width - sw) / 2, (slab.height - sh) / 2, sw, sh, b.left, b.top, b.width, b.height)
      const g = x.createLinearGradient(b.left, b.top, b.right, b.bottom); g.addColorStop(0, 'rgba(225,244,255,.30)'); g.addColorStop(0.4, 'rgba(170,215,240,.05)'); g.addColorStop(1, 'rgba(200,235,255,.2)')
      x.fillStyle = g; x.fillRect(b.left, b.top, b.width, b.height); x.restore()
      x.strokeStyle = 'rgba(210,238,255,.55)'; x.lineWidth = 1; x.beginPath(); x.roundRect(b.left + 0.5, b.top + 0.5, b.width - 1, b.height - 1, 10); x.stroke()
      return c
    }
    // the shatter is prepared when the pointer reaches the slab (hidden, ~30 ms of work spread before the click) and freed
    // 1.5 s after it leaves, so nothing is held while nobody is near the entry
    let full = null, prep = null, freeT = 0
    function prepare () {
      clearTimeout(freeT); if (prep) return prep
      const b = tile.getBoundingClientRect(), t0 = performance.now()
      prep = document.createElement('div'); prep.className = 'ic3-full'; prep.style.pointerEvents = 'none'
      prep.innerHTML = `<span class="ic3-dest" style="background-image:url('${o.fullBackdrop}');visibility:hidden"></span>`; document.body.appendChild(prep)
      prep.fx = Shatter(prep, b.left + b.width / 2, b.top + b.height / 2, { preserve: o.manual, n: o.n || 100 }); prep.ms = { prepare: performance.now() - t0 }
      return prep
    }
    function release () { freeT = setTimeout(() => { if (prep && !full) { prep.fx.destroy(); prep.remove(); prep = null } }, 1500) }
    root.addEventListener('pointerenter', prepare); root.addEventListener('pointerleave', release)
    function shatter (cx, cy) {
      if (full) return full
      full = prepare(); clearTimeout(freeT)
      const t0 = performance.now(); full.fx.start(snapshot(), cx, cy); full.ms.click = performance.now() - t0
      full.style.pointerEvents = ''; full.querySelector('.ic3-dest').style.visibility = ''
      root.style.opacity = 0
      return full
    }
    root.addEventListener('click', (e) => {
      e.preventDefault(); const f = shatter(e.clientX, e.clientY); if (o.manual) return
      const t0 = performance.now(); const tick = () => { if (f.fx.frame((performance.now() - t0) / 1000)) requestAnimationFrame(tick); else { f.fx.destroy(); o.onEnter && o.onEnter() } }; requestAnimationFrame(tick)
    })
    return { root, tile, hover, shatter, get full () { return full } }
  }
  window.IceShatter = { mount, Shatter }
})()
