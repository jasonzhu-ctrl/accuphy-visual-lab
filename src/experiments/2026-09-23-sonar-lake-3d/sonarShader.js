// Phase 4 — the app-style sonar screen, computed from what the beam actually
// hits in the 3D scene. For each beam a "sonar camera" sits at the transducer,
// looks along the fan centre, covers beamDeg horizontally × thickDeg vertically
// and renders a DEPTH strip. The screen shader then asks, for every screen
// pixel (angle a, range r): how many thickness-rows hit at about range r?
// That sum is the echo strength → the app's tone curve → the app's colour LUT.
//
// Look rules measured on the real app (docs/sonar-style.md §6, 2026-09-24):
//  - the picture fills the screen; each axis is scaled on its own (screen box
//    in metres comes from SonarScreen.jsx, per view)
//  - inside the fan there is always a dark-red noise floor, drawn as radial
//    streaks from the apex (PLM Down: mottled speckle); black only outside
//  - the bottom is a thick band: hard white-yellow leading edge, long tail
//  - a fish is a HORIZONTAL DASH, 3–5× wider than tall, bright core, soft edge
export const MAX_FANS = 2

export const sonarVertex = /* glsl */ `
  attribute float aW; // per-vertex clip w: corners are given as (x*w, y*w) for the phone's perspective
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, aW); }
`

export const sonarFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uDepth0; uniform sampler2D uDepth1;
  uniform sampler2D uColor0; uniform sampler2D uColor1; // .a = fish mask
  uniform int uFanCount;
  // per fan: x = centre angle from straight-down in the SCREEN plane (rad, +right),
  //          y = half wide angle (rad), z = tanH = tan(half wide), w = tanV = tan(half thick)
  uniform vec4 uFan[${MAX_FANS}];
  uniform vec2 uNearFar;      // sonar camera near/far
  uniform float uRange;       // display range (metres)
  uniform vec4 uBox0;         // panel 0 screen box in metres: x0, y0, w, h (apex at 0,0; y grows with depth)
  uniform vec4 uBox1;         // panel 1 box (Combo's Down panel)
  uniform float uSplit;       // 1 = Combo two-panel layout: fan 1 (forward) in panel 0, fan 0 (down) in panel 1
  uniform float uApexU;       // uv.x of the shared apex (diagonal start for Combo)
  uniform float uTime;
  uniform float uFlat;        // 1 = panoramic (top-down), 0 = side view
  uniform float uStreak;      // 1 = radial streak texture, 0 = mottled speckle (PLM Down)
  uniform float uDebug;       // 1 = show the raw depth strip (dev)
  uniform sampler2D uLUT;     // 256-entry colour map of the real app (colormaps.js)
  uniform float uGain;        // 0..1 like the app's gain %, default 0.57
  uniform float uDynRange;    // 0..1 window width (app: fDynaRange / fMaxDynaRangeDB)
  uniform float uContrast;    // 0..1 like the app's Contrast: raises the window's low end (cuts the floor), steepens it
  uniform float uNoise;       // 0..1 like the app's Noise Reject: thins the floor speckle, never the targets

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 q) { vec2 i = floor(q), f = fract(q); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
  float linearize(float d) { // three.js perspective depth → view-space distance along -z
    float n = uNearFar.x, f = uNearFar.y;
    float z = d * 2.0 - 1.0;
    return (2.0 * n * f) / (f + n - z * (f - n));
  }
  float sampleDist(int k, vec2 uv, float rayLen) {
    float d = (k == 0) ? texture2D(uDepth0, uv).r : texture2D(uDepth1, uv).r;
    if (d >= 0.9999) return 1e9; // nothing hit
    return linearize(d) * rayLen;
  }
  float sampleFish(int k, vec2 uv) { return (k == 0) ? texture2D(uColor0, uv).a : texture2D(uColor1, uv).a; }

  // fish mask hit near screen point p for fan k: a few thickness rows, tight radial window
  float fishAt(int k, vec2 p, float jit) {
    float r = length(p);
    float a = atan(p.x, p.y) - uFan[k].x;
    if (abs(a) > uFan[k].y || r > uRange) return 0.0;
    float u = 0.5 + 0.5 * tan(a) / uFan[k].z;
    float best = 0.0;
    for (int j = 0; j < 6; j++) {
      float v = (float(j) + jit) / 6.0;
      float ty = (v * 2.0 - 1.0) * uFan[k].w;
      float m = sampleFish(k, vec2(u, v));
      if (m < 0.3) continue;
      float hit = sampleDist(k, vec2(u, v), length(vec3(tan(a), ty, 1.0)));
      float dr = r - hit;
      float sr = 0.22 + 0.006 * r;              // thin across the beam direction
      best = max(best, exp(-dr * dr / (sr * sr)));
    }
    return best;
  }

  void main() {
    // which panel / which fan does this pixel belong to?
    float vyDown = 1.0 - vUv.y;                 // 0 at the top of the screen
    int panel = 0;
    float line = 0.0;
    if (uSplit > 0.5) {
      // the diagonal runs from the apex to x ≈ 0.8 at the bottom edge (app Combo screenshot)
      float dx = vUv.x - (uApexU + (0.8 - uApexU) * vyDown); // signed distance to the diagonal (uv units)
      float gap = 0.012;
      if (dx < -gap) panel = 1; else if (dx > gap) panel = 0; else { // the grey double line with a black gap
        float e = abs(dx) / gap;                 // 0 at the centre … 1 at the edges
        line = (e > 0.55 && e < 0.85) ? 1.0 : 0.0;
        gl_FragColor = vec4(vec3(0.62) * line, 1.0); return;
      }
    }
    vec4 box = panel == 0 ? uBox0 : uBox1;
    float vy = uFlat > 0.5 ? vUv.y : vyDown;
    vec2 p = box.xy + vec2(vUv.x, vy) * box.zw; // metres; apex (0,0), y down
    float r = length(p);
    float aWorld = atan(p.x, p.y);
    float echo = 0.0, inAny = 0.0;
    // polar texture: fine across the angle, long along the range → radial streaks;
    // PLM Down uses a coarse mottled speckle instead (measured on the app)
    float t = floor(uTime * 8.0);
    float streak = vnoise(vec2(aWorld * 140.0, r * 0.9 + t * 0.37));
    float mottle = vnoise(p * 9.0 + t * 0.5) * 0.7 + vnoise(p * 23.0 - t * 0.3) * 0.5;
    float rays = vnoise(vec2(aWorld * 22.0 + 3.1, 0.5));          // beam-to-beam gain variation
    float grain = hash(floor(vec2(aWorld * 600.0, r * 6.0)) + t);
    float tex = uStreak > 0.5 ? 0.45 + 0.75 * streak + 0.25 * grain : 0.35 + 0.9 * mottle + 0.2 * grain;
    // noise floor as a weak raw echo, so gain / contrast act on it exactly like on targets;
    // Noise Reject thins it out (isolated speckle goes first)
    float floorTex = uStreak > 0.5 ? 0.10 + 0.08 * rays + 0.05 * streak : 0.06 + 0.16 * mottle;
    floorTex = max(0.0, floorTex - 0.22 * uNoise) * (1.0 - 0.35 * r / uRange);
    int kFrom = 0, kTo = uFanCount;
    if (uSplit > 0.5) { kFrom = panel == 0 ? 1 : 0; kTo = kFrom + 1; }
    for (int k = 0; k < ${MAX_FANS}; k++) {
      if (k < kFrom || k >= kTo) continue;
      float a = aWorld - uFan[k].x;
      if (abs(a) > uFan[k].y || r > uRange) continue;
      inAny = 1.0;
      float u = 0.5 + 0.5 * tan(a) / uFan[k].z;
      float acc = 0.0;
      float jit = hash(floor(p * 13.0) + 0.37);
      float sigma = 0.45 + 0.018 * r;           // bottom pulse widens with range
      float tailLen = 2.5 + 0.06 * r;           // long orange tail under the bottom
      for (int j = 0; j < 16; j++) {
        float v = (float(j) + jit) / 16.0;
        float ty = (v * 2.0 - 1.0) * uFan[k].w;
        float rayLen = length(vec3(tan(a), ty, 1.0));
        float hit = sampleDist(k, vec2(u, v), rayLen);
        float dr = r - hit;
        float fish = sampleFish(k, vec2(u, v));
        float pulse = exp(-dr * dr / (sigma * sigma));
        float tail = dr > 0.0 ? 0.55 * exp(-dr / tailLen) : 0.0;
        float second = 0.10 * exp(-(r - 2.0 * hit) * (r - 2.0 * hit) / (4.0 * sigma * sigma)); // faint second echo
        float wgt = 0.55 + 0.9 * (1.0 - abs(v * 2.0 - 1.0));
        acc += (pulse + tail + second) * wgt * (1.0 - fish);
      }
      acc /= 9.0;
      // fish: a horizontal dash — sample the mask at a few horizontal offsets in
      // SCREEN metres, brightest in the middle, soft ends (sonar-style.md §6.3)
      float dashHalf = 0.16 + 0.012 * r;        // ≈ 0.4–0.6 m wide at 8–18 m
      float fishHit = 0.0;
      for (int i = -2; i <= 2; i++) {
        float f = float(i) / 2.0;
        float w = 1.0 - 0.55 * f * f;           // 1, 0.86, 0.45 → bright core, feathered ends
        fishHit = max(fishHit, w * fishAt(k, p - vec2(f * dashHalf, 0.0), jit));
      }
      float atten = 1.0 - 0.4 * clamp(r / uRange, 0.0, 1.0);
      float gain = uFlat > 0.5 ? 3.0 : 1.0;
      float fishEcho = fishHit * (1.05 + 0.35 * streak);
      echo = max(echo, max(acc * atten * tex * gain, fishEcho));
    }
    // clutter near the transducer: bright rays fanning out from the apex
    float near = 1.0 - smoothstep(0.0, 0.18 * uRange, r);
    echo = max(echo, inAny * near * near * (0.25 + 0.6 * rays) * tex * 0.5);
    echo = max(echo, inAny * floorTex * 0.7); // ≈ LUT index 0.15–0.25 at gain 57 %, contrast 0 (the app's factory look)

    if (uDebug > 0.5) { float d = texture2D(uDepth0, vUv).r; gl_FragColor = vec4(vec3(d >= 0.9999 ? 0.0 : 1.0 - linearize(d) / 60.0), 1.0); return; }
    // the app's tone curve (assets/aio_shader.glsl): log compression → gain/dynamic-range window → LUT
    float raw = echo * 65535.0;
    float bs = 4000.0;
    float lv = log(1.0 + raw / bs) / log(1.0 + 65535.0 / bs);
    float width = clamp(uDynRange, 0.05, 1.0);
    // Contrast: raise the low end (floor disappears first) and narrow the window (steeper ramp);
    // pushed far it over-exposes like too much gain — Jason's tuning note, sonar-style.md §6.5
    float lo = (1.0 - width) * 0.5 + width * (uGain - 0.5) + 0.5 * width * uContrast; // 40 % ≈ the app at Contrast 40 (floor ~gone)
    float hi = lo + width * (1.0 - 0.45 * uContrast);
    float idx = echo > 0.0005 ? clamp((lv - lo) / (hi - lo), 0.0, 1.0) : 0.0;
    idx *= inAny;
    vec3 col = texture2D(uLUT, vec2(idx * (255.0 / 256.0) + 0.5 / 256.0, 0.5)).rgb;
    col *= inAny; // black outside the fan
    gl_FragColor = vec4(col, 1.0);
  }
`
