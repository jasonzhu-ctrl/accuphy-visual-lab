// frost-v2.js — the desktop ice-fishing entry, version 2 (界面设计 mock, 2026-11-06). A small frosted window whose frost is a
// real crystal-growth simulation on the GPU: a phase-field model (Kobayashi 1993) with six-fold anisotropy, so hexagonal
// dendrites grow in from the cold frame. The mouse wipes a clear trail and the frost grows back into it; a click lets frost
// spread from the window over the whole screen. Own code, written from the published principle of the 21st.dev component
// "Frosted Window Background" (hoarfrost-pane, Kedhareswer Naidu, MIT); nothing of its code is copied. WebGL2, no images
// besides the backdrop photo. Mock only: no version of the Lab uses this file.
(function () {
  'use strict'
  const VS = `#version 300 es
in vec2 p; out vec2 uv; void main(){ uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`
  const HEAD = `#version 300 es
precision highp float; in vec2 uv; out vec4 o; uniform vec2 px; uniform float h;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
`
  // pass 1: the anisotropy terms from the phase gradient (eps·eps'·∂φ, eps²)
  const AUX = HEAD + `uniform sampler2D S; uniform float eps0, delta, th0;
void main(){
  float pr = texture(S, uv + vec2(px.x, 0.)).r, pl = texture(S, uv - vec2(px.x, 0.)).r;
  float pu = texture(S, uv + vec2(0., px.y)).r, pd = texture(S, uv - vec2(0., px.y)).r;
  vec2 g = vec2(pr - pl, pu - pd) / (2.0 * h);
  float th = length(g) > 1e-5 ? atan(g.y, g.x) : 0.0;
  float a0 = th0 + 2.1 * vnoise(uv * 3.0 + th0);                     // each patch of the pane has its own crystal axis
  float e = eps0 * (1.0 + delta * cos(6.0 * (th - a0)));
  float ed = -eps0 * delta * 6.0 * sin(6.0 * (th - a0));
  o = vec4(e * ed * g.y, e * ed * g.x, e * e, 0.0);
}`
  // pass 2: one time step of φ (ice) and T (temperature); the cold frame seeds, the wipe melts, the burst spreads seeds
  const STEP = HEAD + `uniform sampler2D S, A; uniform float dt, tau, alpha, gam, K, cool, t, frameW, seedP, noiseA, hazeK, band;
uniform vec4 wipe;   // xy: point (uv), z: radius (in px of the sim), w: 1 while wiping
uniform vec4 burst;  // xy: centre (uv), z: radius (in px of the sim), w: seed chance inside it
void main(){
  vec4 s = texture(S, uv); float phi = s.r, T = s.g, hz = s.b;
  vec2 dx = vec2(px.x, 0.), dy = vec2(0., px.y);
  vec4 sR = texture(S, uv + dx), sL = texture(S, uv - dx), sU = texture(S, uv + dy), sD = texture(S, uv - dy);
  vec4 aR = texture(A, uv + dx), aL = texture(A, uv - dx), aU = texture(A, uv + dy), aD = texture(A, uv - dy), a = texture(A, uv);
  vec2 g = vec2(sR.r - sL.r, sU.r - sD.r) / (2.0 * h);
  float lap = (sR.r + sL.r + sU.r + sD.r - 4.0 * phi) / (h * h);
  float div = a.z * lap + ((aR.z - aL.z) * g.x + (aU.z - aD.z) * g.y) / (2.0 * h);
  float aniso = -(aR.x - aL.x) / (2.0 * h) + (aU.y - aD.y) / (2.0 * h);
  float m = alpha / 3.14159265 * atan(gam * (1.0 - T));
  float n = (hash(uv * 911.0 + t) - 0.5) * noiseA;
  float dphi = (aniso + div + phi * (1.0 - phi) * (phi - 0.5 + m + n)) / tau;
  float lapT = (sR.g + sL.g + sU.g + sD.g - 4.0 * T) / (h * h);
  float phiN = clamp(phi + dt * dphi, 0.0, 1.0);
  float TN = T + dt * (lapT + K * dphi) - dt * cool * T;
  vec2 cell = uv / px;                                   // position in sim pixels
  vec2 fromEdge = min(cell, 1.0 / px - cell);
  float edge = min(fromEdge.x, fromEdge.y);
  if (edge < frameW && hash(floor(cell) * 0.37) > 1.0 - seedP) { phiN = 1.0; }        // the cold frame keeps seeding
  float hzN = min(1.0, hz + hazeK);                                                  // condensation slowly mists the glass
  if (wipe.w > 0.5 && length((uv - wipe.xy) / px) < wipe.z) { phiN = 0.0; TN = 0.0; hzN = 0.0; } // the wipe clears a path
  if (burst.w > 0.0) {                                       // the burst: seeds only in a thin band at the moving front, mist behind it
    float d = length((uv - burst.xy) / px);
    if (d < burst.z && d > burst.z - band && hash(floor(cell) * 1.31 + floor(t * 3.0)) > 1.0 - burst.w) phiN = 1.0;
    if (d < burst.z) hzN = min(1.0, hzN + 0.02);
  }
  o = vec4(phiN, TN, hzN, 1.0);
}`
  // draw: frost as lit, slightly bluish ice over the backdrop (premultiplied alpha)
  const DRAW = HEAD + `uniform sampler2D S; uniform float opacity;
void main(){
  vec4 s0 = texture(S, uv); float phi = s0.r, hz = s0.b;
  float pr = texture(S, uv + vec2(px.x, 0.)).r, pl = texture(S, uv - vec2(px.x, 0.)).r;
  float pu = texture(S, uv + vec2(0., px.y)).r, pd = texture(S, uv - vec2(0., px.y)).r;
  vec2 g = vec2(pr - pl, pu - pd);
  vec3 nrm = normalize(vec3(-g * 2.2, 1.0));
  float lit = clamp(dot(nrm, normalize(vec3(-0.5, 0.6, 0.65))), 0.0, 1.0);
  float rim = clamp(length(g) * 3.0, 0.0, 1.0);
  float body = smoothstep(0.1, 0.9, phi);
  float grain = vnoise(uv / px * 0.9) * 0.5 + vnoise(uv / px * 0.23) * 0.5;      // the crystal is matte, not flat
  float mist = hz * (0.10 + 0.16 * vnoise(uv / px * 0.06) + 0.06 * grain);       // mottled condensation between crystals
  float a = (body * (0.5 + 0.18 * grain) + rim * 0.34 + mist * (1.0 - body)) * opacity;
  vec3 col = mix(vec3(0.80, 0.89, 0.96), vec3(0.97, 0.99, 1.0), lit * 0.5 + rim * 0.5 + body * 0.2);
  col += pow(lit, 24.0) * rim * 0.5;
  a = clamp(a, 0.0, 0.92);
  o = vec4(col * a, a);
}`

  function program (gl, fs) {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s }
    const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p))
    const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name) }
    return { p, u }
  }

  // one simulation on one canvas. w × h sim pixels; the canvas is drawn at its CSS size (linear upscale)
  function Sim (canvas, w, h, opts) {
    const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false, preserveDrawingBuffer: !!opts.preserve })
    if (!gl || !gl.getExtension('EXT_color_buffer_float')) throw new Error('WebGL2 float targets needed')
    gl.getExtension('OES_texture_float_linear')
    canvas.width = w; canvas.height = h
    const quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    const tex = (filter) => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); return { t, f } }
    const S = [tex(gl.NEAREST), tex(gl.NEAREST)], A = tex(gl.NEAREST)
    for (const s of S) { gl.bindFramebuffer(gl.FRAMEBUFFER, s.f); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT) }
    const aux = program(gl, AUX), step = program(gl, STEP), draw = program(gl, DRAW)
    const P = Object.assign({ h: 0.03, dt: 1e-4, tau: 3e-4, eps0: 0.01, delta: 0.05, alpha: 0.9, gam: 10, K: 1.6, cool: 0.8, frameW: 2.0, seedP: 0.012, noiseA: 0.03, hazeK: 1 / 2400, band: 10 }, opts.params)
    let cur = 0, t = 0
    const state = { wipe: [0, 0, 0, 0], burst: [0, 0, 0, 0], opacity: 1 }
    const set = (pr, name, ...v) => { const l = pr.u[name]; if (l != null) gl[`uniform${v.length}f`](l, ...v) }
    function stepOnce () {
      gl.viewport(0, 0, w, h)
      gl.useProgram(aux.p); gl.bindFramebuffer(gl.FRAMEBUFFER, A.f); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, S[cur].t)
      gl.uniform1i(aux.u.S, 0); set(aux, 'px', 1 / w, 1 / h); set(aux, 'h', P.h); set(aux, 'eps0', P.eps0); set(aux, 'delta', P.delta); set(aux, 'th0', 0.3)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      gl.useProgram(step.p); gl.bindFramebuffer(gl.FRAMEBUFFER, S[1 - cur].f)
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, S[cur].t); gl.uniform1i(step.u.S, 0)
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, A.t); gl.uniform1i(step.u.A, 1)
      set(step, 'px', 1 / w, 1 / h); for (const k of ['h', 'dt', 'tau', 'alpha', 'gam', 'K', 'cool', 'frameW', 'seedP', 'noiseA', 'hazeK', 'band']) set(step, k, P[k])
      set(step, 't', t); set(step, 'wipe', ...state.wipe); set(step, 'burst', ...state.burst)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); cur = 1 - cur; t += 0.0137
    }
    function render () {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(draw.p); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, S[cur].t); gl.uniform1i(draw.u.S, 0)
      set(draw, 'px', 1 / w, 1 / h); set(draw, 'h', P.h); set(draw, 'opacity', state.opacity)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    return { gl, state, P, advance (n) { for (let i = 0; i < n; i++) stepOnce(); render() }, destroy () { gl.getExtension('WEBGL_lose_context')?.loseContext() } }
  }

  // the entry: window + words. opts: { parent, left, bottom, w, h, backdrop, fullBackdrop, onEnter, manual }
  function mount (opts) {
    const o = Object.assign({ left: 22, bottom: 58, w: 184, h: 120, steps: 24, scale: 2 }, opts)
    const css = `
.ifx{position:absolute;left:${o.left}px;bottom:${o.bottom}px;display:flex;align-items:center;gap:16px;z-index:40;cursor:pointer;text-decoration:none;color:#fff}
.ifx-win{position:relative;width:${o.w}px;height:${o.h}px;border-radius:12px;overflow:hidden;flex:none;box-shadow:0 14px 32px rgba(2,16,24,.5),0 0 0 1px rgba(220,240,255,.28),inset 0 0 0 1px rgba(255,255,255,.12);transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s}
.ifx:hover .ifx-win{transform:translateY(-2px) scale(1.02);box-shadow:0 18px 40px rgba(2,16,24,.55),0 0 0 1px rgba(200,232,255,.55),0 0 24px rgba(120,200,255,.25)}
.ifx-bg{position:absolute;inset:-6px;background:center/cover no-repeat;filter:blur(1.2px) saturate(1.1) brightness(.95)}
.ifx-win canvas{position:absolute;inset:0;width:100%;height:100%}
.ifx-sheen{position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.16),transparent 38%,transparent 70%,rgba(255,255,255,.06));pointer-events:none}
.ifx-words{display:flex;flex-direction:column;gap:5px;text-shadow:0 1px 3px rgba(0,16,24,.6)}
.ifx-t{font:800 16px/1 'Eurostile Heavy','Instrument Sans',sans-serif;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}
.ifx-t b{display:inline-block;margin-left:7px;color:#9ad8ff;transition:transform .25s}
.ifx:hover .ifx-t b{transform:translateX(4px)}
.ifx-s{font:500 12.5px/1.25 'Instrument Sans',system-ui,sans-serif;color:rgba(255,255,255,.74);white-space:nowrap}
.ifx-full{position:fixed;inset:0;z-index:80;pointer-events:none}
.ifx-full canvas{position:absolute;inset:0;width:100%;height:100%}
.ifx-full .ifx-dest{position:absolute;inset:0;background:center/cover no-repeat;opacity:0;transition:opacity .7s ease}
`
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st)
    const root = document.createElement('a'); root.className = 'ifx'; root.href = '#'; root.setAttribute('aria-label', 'Try ice fishing: open the ice-fishing page')
    root.innerHTML = `<span class="ifx-win"><span class="ifx-bg" style="background-image:url('${o.backdrop}')"></span><canvas></canvas><span class="ifx-sheen"></span></span>
<span class="ifx-words"><span class="ifx-t">Try ice fishing<b>→</b></span><span class="ifx-s">Wipe the frost. Drill through.</span></span>`
    ;(o.parent || document.body).appendChild(root)
    const win = root.querySelector('.ifx-win'), cv = win.querySelector('canvas')
    const sim = Sim(cv, Math.round(o.w * o.scale), Math.round(o.h * o.scale), { preserve: o.manual, params: o.params })
    // growth budget: the frost grows to its fern stage (~2400 steps) and then rests (no GPU work); a wipe buys ~1600 more
    // steps so the frost grows back into the trail, then it rests again
    let budget = o.manual ? 0 : 2400                       // 24 steps a frame: ~1.7 s of growth, ~1.7 ms GPU a frame on an M2 Max
    // wipe: the pointer over the window melts a ~11 px path; frost regrows from the sides
    win.addEventListener('pointermove', (e) => { const r = win.getBoundingClientRect(); sim.state.wipe = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height, 11 * o.scale, 1]; budget = Math.max(budget, 1600) })
    win.addEventListener('pointerleave', () => { sim.state.wipe[3] = 0 })
    // click: frost spreads from the window over the whole screen, then the ice page fades in under it
    let full = null
    function burst () {
      if (full) return
      const W = innerWidth, H = innerHeight, k = 1 / 4   // a coarse grid: the crystals come out big enough to fill the screen in ~1.2 s
      full = document.createElement('div'); full.className = 'ifx-full'
      full.innerHTML = `<span class="ifx-dest" style="background-image:url('${o.fullBackdrop || o.backdrop}')"></span><canvas></canvas>`; document.body.appendChild(full)
      const r = win.getBoundingClientRect(), fsim = Sim(full.querySelector('canvas'), Math.round(W * k), Math.round(H * k), { preserve: o.manual, params: { frameW: 0, seedP: 0, hazeK: 0, band: 8, delta: 0.1, noiseA: 0.06 } })
      const c = [(r.left + r.width / 2) / W, 1 - (r.top + r.height / 2) / H]
      full.sim = fsim; full.t0 = 0; full.c = c; full.R = Math.hypot(W, H) * k
      return full
    }
    function burstAdvance (frames) {
      if (!full) return
      for (let i = 0; i < frames; i++) {
        full.t0++
        const prog = Math.min(1, full.t0 / 70)                      // ~1.2 s at 60 fps: the seeding front crosses the screen
        full.sim.state.burst = [full.c[0], full.c[1], full.R * (0.08 + prog), 0.001]
        full.sim.advance(32)
        if (full.t0 === 78) full.querySelector('.ifx-dest').style.opacity = 1   // the ice page fades in under the frost
        if (full.t0 > 82) full.sim.state.opacity = Math.max(0, 1 - (full.t0 - 82) / 30) // then the frost thaws away
      }
    }
    root.addEventListener('click', (e) => { e.preventDefault(); burst(); o.onEnter && o.onEnter() })
    let raf = 0
    const loop = () => { raf = requestAnimationFrame(loop); if (budget > 0) { const n = Math.min(o.steps, budget); sim.advance(n); budget -= n } if (full) burstAdvance(1) }
    if (!o.manual) loop()
    return { root, sim, burst, burstAdvance, get full () { return full }, get budget () { return budget }, stop () { cancelAnimationFrame(raf) }, warm (n) { sim.advance(n) } }
  }
  window.IceFrost = { mount, Sim }
})()
