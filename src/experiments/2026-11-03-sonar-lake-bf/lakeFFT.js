// The lake's waves as a real wind-sea spectrum (#165, Jason 2026-10-26: "动，把 ABYSSAL 的做法接进湖面，先在本地做手机
// 也能跑的轻量版"). Thousands of waves whose heights, lengths and headings follow a measured wind-sea spectrum (JONSWAP,
// shallow-water TMA, Donelan–Banner spreading), summed every frame by an inverse FFT on the GPU, so the surface never
// repeats at any scale (the hand-made wave sums of #156–#164 always showed their few shapes again).
// Adapted from ABYSSAL by Sacha (@squall01337), https://github.com/squall01337/abyssal-ocean, MIT (notice in
// assets/LICENSES.md). Kept: the spectrum, the Tessendorf h0 and its time evolution, the butterfly FFT. Cut for a flat
// lake seen from 60 m: no displacement, Jacobian, foam or probe; only the surface slope (∂h/∂x, ∂h/∂z), packed as one
// complex field per cascade, so one RGBA FFT carries two cascades.
// Three cascades (tiles of different, unrelated sizes, so their repeats never line up): A + B in one FFT, C in a second.
// Phones: 128², only cascades A + B (C is finer than a phone's pixel there), every other frame; desktop 256², all three,
// every frame. Dev aid: ?fftn=64|128|256|512.
import * as THREE from 'three'

export const FFT_L = [131.0, 23.7, 5.3] // tile size (m) per cascade
// band edges so the cascades share k-space without overlap (6 waves per tile of the next cascade)
const EDGE = [2 * Math.PI * 6 / FFT_L[1], 2 * Math.PI * 6 / FFT_L[2]]
const CUT = [[1e-4, EDGE[0]], [EDGE[0], EDGE[1]], [EDGE[1], 9999]]
// a light summer breeze over a few km of open lake
export const LAKE_SEA = { wind: 4.2, windDir: Math.atan2(-0.83, -0.55), fetch: 3000, depth: 18, spread: 0.7, short: 0.004 }

const HEAD = /* glsl */ `
precision highp float; precision highp int;
#define PI 3.141592653589793
vec2 cmul(vec2 a, vec2 b) { return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x); }
`
const VS = /* glsl */ `in vec3 position; void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`

// h0(k) and conj(h0(−k)) for two cascades at once (xy|zw of each output: A in o0, B in o1 — see h0Pass below)
const H0_FS = HEAD + /* glsl */ `
uniform float uN, uL, uWind, uFetch, uDepth, uSpread, uShort, uCutLo, uCutHi; uniform vec2 uWindDir; uniform int uSeed;
out vec4 oH0;
const float G = 9.81;
uint pcg(uint v) { uint s = v * 747796405u + 2891336453u; uint w = ((s >> ((s >> 28u) + 4u)) ^ s) * 277803737u; return (w >> 22u) ^ w; }
float rnd(uint s) { return float(pcg(s)) * (1.0 / 4294967296.0); }
vec2 gauss2(int nx, int nz) {
  uint h = pcg(uint(nx + 262144) * 1973u + uint(nz + 262144) * 9277u + uint(uSeed) * 26699u);
  float r = sqrt(-2.0 * log(max(1e-7, rnd(h)))), a = 2.0 * PI * rnd(h ^ 0x9E3779B9u);
  return r * vec2(cos(a), sin(a));
}
float disp(float k) { return sqrt(G * k * tanh(min(k * uDepth, 20.0))); }
float dispD(float k) { float a = min(k * uDepth, 20.0), th = tanh(a), ch = cosh(a); return G * (uDepth * k / (ch * ch) + th) / (2.0 * max(sqrt(G * k * th), 1e-6)); }
float jonswap(float w, float wp, float alpha) {
  float sg = w <= wp ? 0.07 : 0.09, r = exp(-(w - wp) * (w - wp) / (2.0 * sg * sg * wp * wp)), p = pow(wp / max(w, 1e-4), 4.0);
  return alpha * G * G * pow(1.0 / max(w, 1e-4), 5.0) * exp(-1.25 * p) * pow(3.3, r);
}
float tma(float w) { float wh = w * sqrt(uDepth / G); return wh <= 1.0 ? 0.5 * wh * wh : wh < 2.0 ? 1.0 - 0.5 * (2.0 - wh) * (2.0 - wh) : 1.0; }
float normFac(float s) { float s2 = s * s, s3 = s2 * s, s4 = s3 * s;
  return s < 5.0 ? -0.000564 * s4 + 0.00776 * s3 - 0.044 * s2 + 0.192 * s + 0.163 : -4.80e-8 * s4 + 1.07e-5 * s3 - 9.53e-4 * s2 + 5.90e-2 * s + 3.93e-1; }
float dirSpec(float th, float w, float wp) {
  float s = w > wp ? 9.77 * pow(w / wp, -2.5) : 6.97 * pow(w / wp, 5.0), c = cos(th);
  return mix((2.0 / PI) * c * c * step(0.0, c), normFac(s) * pow(abs(cos(0.5 * th)), 2.0 * s), uSpread);
}
void main() {
  ivec2 id = ivec2(gl_FragCoord.xy); int nx = id.x - int(uN) / 2, nz = id.y - int(uN) / 2;
  float dk = 2.0 * PI / uL; vec2 k = vec2(float(nx), float(nz)) * dk; float kl = length(k);
  vec2 a = vec2(0.0), b = vec2(0.0);
  if (kl > 1e-6 && kl >= uCutLo && kl < uCutHi) {
    float wp = 22.0 * pow(G * G / (uWind * uFetch), 1.0 / 3.0), alpha = 0.076 * pow(uWind * uWind / (uFetch * G), 0.22), w = disp(kl);
    float base = jonswap(w, wp, alpha) * tma(w) * exp(-kl * kl * uShort * uShort) * abs(dispD(kl)) / kl * dk * dk;
    float dth = atan(k.y, k.x) - atan(uWindDir.y, uWindDir.x);
    a = gauss2(nx, nz) * sqrt(0.13 * max(base * dirSpec(dth, w, wp), 0.0));
    b = gauss2(-nx, -nz) * sqrt(0.13 * max(base * dirSpec(dth + PI, w, wp), 0.0));
  }
  oH0 = vec4(a, b.x, -b.y);
}`

// h(k, t), turned into its slope field packed as one complex number (∂h/∂x + i·∂h/∂z); two cascades side by side
const SPEC_FS = HEAD + /* glsl */ `
uniform sampler2D uH0a, uH0b; uniform float uN, uLa, uLb, uTime, uDepth, uTwo;
out vec4 o;
vec2 slope(sampler2D h0t, float L) {
  ivec2 id = ivec2(gl_FragCoord.xy); vec2 k = (vec2(id) - uN * 0.5) * (2.0 * PI / L); float kl = length(k);
  if (kl < 1e-6) return vec2(0.0);
  vec4 h0 = texelFetch(h0t, id, 0); float w = sqrt(9.81 * kl * tanh(min(kl * uDepth, 20.0))), c = cos(w * uTime), s = sin(w * uTime);
  vec2 h = cmul(h0.xy, vec2(c, s)) + cmul(h0.zw, vec2(c, -s));
  return cmul(h, vec2(-k.y, k.x));                                   // i·kx·h + i·(i·kz·h)
}
void main() { o = vec4(slope(uH0a, uLa), uTwo > 0.5 ? slope(uH0b, uLb) : vec2(0.0)); }`

// one Cooley–Tukey stage, along x (uDir 0) or z (1), on both complex pairs of the texel
const BF_FS = HEAD + /* glsl */ `
uniform sampler2D uSrc, uBf; uniform int uStage, uDir;
out vec4 o;
void main() {
  ivec2 id = ivec2(gl_FragCoord.xy); int ix = uDir == 0 ? id.x : id.y;
  vec4 bf = texelFetch(uBf, ivec2(uStage, ix), 0);
  ivec2 pa = uDir == 0 ? ivec2(int(bf.z), id.y) : ivec2(id.x, int(bf.z)), pb = uDir == 0 ? ivec2(int(bf.w), id.y) : ivec2(id.x, int(bf.w));
  vec4 a = texelFetch(uSrc, pa, 0), b = texelFetch(uSrc, pb, 0);
  o = vec4(a.rg + cmul(bf.xy, b.rg), a.ba + cmul(bf.xy, b.ba));
}`

// the transform's checkerboard sign (it is a centred IDFT), and a gain; the real parts are the slopes
const OUT_FS = HEAD + /* glsl */ `
uniform sampler2D uSrc; uniform float uGain;
out vec4 o;
void main() { ivec2 id = ivec2(gl_FragCoord.xy); float s = (id.x + id.y) % 2 == 0 ? uGain : -uGain; o = texelFetch(uSrc, id, 0) * s; }`

function butterflyTexture(n) {
  const stages = Math.round(Math.log2(n)), rev = new Int32Array(n)
  for (let i = 0; i < n; i++) { let x = i, r = 0; for (let b = 0; b < stages; b++) { r = (r << 1) | (x & 1); x >>= 1 } rev[i] = r }
  const data = new Float32Array(stages * n * 4)
  for (let s = 0; s < stages; s++) for (let y = 0; y < n; y++) {
    const k = (y * (n >> (s + 1))) % n, ang = 2 * Math.PI * k / n, span = 1 << s, top = (y % (1 << (s + 1))) < span
    const [z, w] = s === 0 ? (top ? [rev[y], rev[y + 1]] : [rev[y - 1], rev[y]]) : (top ? [y, y + span] : [y - span, y])
    data.set([Math.cos(ang), Math.sin(ang), z, w], (y * stages + s) * 4)
  }
  const t = new THREE.DataTexture(data, stages, n, THREE.RGBAFormat, THREE.FloatType)
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true
  return t
}

export function fftSize() {
  const q = import.meta.env.DEV && +((/fftn=(\d+)/.exec(window.location.search) || [])[1] || 0)
  if ([64, 128, 256, 512].includes(q)) return q
  const phone = window.matchMedia?.('(pointer: coarse)').matches || Math.min(window.innerWidth, window.innerHeight) <= 820
  return phone ? 128 : 256
}

// The simulation: call step(gl, t) once a frame; read slopes from .tex[0] (cascades A in rg, B in ba) and .tex[1] (C in rg)
export function makeLakeFFT(gl, n = fftSize()) {
  const stages = Math.round(Math.log2(n)), phone = n <= 128
  const full = gl.extensions.has('EXT_color_buffer_float') ? THREE.FloatType : THREE.HalfFloatType
  const raw = () => new THREE.WebGLRenderTarget(n, n, { type: full, depthBuffer: false, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, generateMipmaps: false })
  const out = () => new THREE.WebGLRenderTarget(n, n, { type: THREE.HalfFloatType, depthBuffer: false, wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping,
    minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: true, anisotropy: 4 })
  const h0 = [raw(), raw(), raw()], ping = raw(), pong = raw(), res = [out(), out()]
  const scene = new THREE.Scene(), cam = new THREE.Camera(), quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); quad.frustumCulled = false; scene.add(quad)
  const pass = (fs, uniforms) => new THREE.RawShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: VS, fragmentShader: fs, uniforms, depthTest: false, depthWrite: false })
  const h0Mat = pass(H0_FS, { uN: { value: n }, uL: { value: 1 }, uWind: { value: 1 }, uFetch: { value: 1 }, uDepth: { value: 1 }, uSpread: { value: 0 }, uShort: { value: 0 }, uCutLo: { value: 0 }, uCutHi: { value: 0 }, uWindDir: { value: new THREE.Vector2() }, uSeed: { value: 1337 } })
  const specMat = pass(SPEC_FS, { uH0a: { value: null }, uH0b: { value: null }, uN: { value: n }, uLa: { value: 1 }, uLb: { value: 1 }, uTime: { value: 0 }, uDepth: { value: 1 }, uTwo: { value: 1 } })
  const bfMat = pass(BF_FS, { uSrc: { value: null }, uBf: { value: butterflyTexture(n) }, uStage: { value: 0 }, uDir: { value: 0 } })
  const outMat = pass(OUT_FS, { uSrc: { value: null }, uGain: { value: 1 } })
  const draw = (mat, target) => { quad.material = mat; gl.setRenderTarget(target); gl.render(scene, cam) }
  let built = false, frame = 0
  function build() {
    const S = LAKE_SEA, u = h0Mat.uniforms
    for (let c = 0; c < 3; c++) {
      u.uL.value = FFT_L[c]; u.uWind.value = S.wind; u.uFetch.value = S.fetch; u.uDepth.value = S.depth; u.uSpread.value = S.spread
      u.uShort.value = S.short; u.uCutLo.value = CUT[c][0]; u.uCutHi.value = CUT[c][1]; u.uWindDir.value.set(Math.cos(S.windDir), Math.sin(S.windDir))
      draw(h0Mat, h0[c])
    }
    built = true
  }
  function fft(a, b, two, target) {
    const s = specMat.uniforms
    s.uH0a.value = h0[a].texture; s.uH0b.value = h0[b].texture; s.uLa.value = FFT_L[a]; s.uLb.value = FFT_L[b]; s.uTwo.value = two; s.uDepth.value = LAKE_SEA.depth
    draw(specMat, ping)
    let src = ping, dst = pong
    for (let d = 0; d < 2; d++) for (let st = 0; st < stages; st++) {
      bfMat.uniforms.uSrc.value = src.texture; bfMat.uniforms.uStage.value = st; bfMat.uniforms.uDir.value = d
      draw(bfMat, dst); [src, dst] = [dst, src]
    }
    outMat.uniforms.uSrc.value = src.texture; draw(outMat, target)
  }
  return {
    n, fine: phone ? 0 : 1, tex: res.map((r) => r.texture),
    step(t) {
      if (phone && frame++ % 2 && built) return // phones: every other frame is plenty for waves this slow
      const prev = gl.getRenderTarget()
      if (!built) build()
      specMat.uniforms.uTime.value = t
      fft(0, 1, 1, res[0]); if (!phone) fft(2, 2, 0, res[1]) // phones: the finest cascade is below a pixel anyway
      gl.setRenderTarget(prev)
    },
    dispose() { [...h0, ping, pong, ...res].forEach((r) => r.dispose()); [h0Mat, specMat, bfMat, outMat].forEach((m) => m.dispose()); bfMat.uniforms.uBf.value.dispose(); quad.geometry.dispose() },
  }
}
