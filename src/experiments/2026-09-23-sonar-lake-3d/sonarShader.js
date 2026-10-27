// The app-style sonar screen, computed from the 3D lake. Two imaging models (docs/sonar-style.md §7):
//
//  Down / Forward / Combo — a vertical slab (18–20° thick). For each fan a "sonar camera" at the
//  transducer renders a DEPTH strip; for every screen pixel (angle, range) the shader asks which
//  thickness rows hit something at that range → bottom band and structure faces.
//
//  Panoramic — a plan view (the fan lies almost flat and grazes the bottom): the picture is a
//  photograph from above. Bottom depth comes from a baked terrain texture, structure from a top-down
//  depth map rendered each frame; every point is lit only if nothing between it and the transducer
//  sticks up into the ray → acoustic shadows behind structure, humps and fish (§7.13).
//
//  Fish in every view are MARKS drawn analytically from their real position and heading
//  (sonarMarks.js): the body projected into the view, blurred by the pulse (along the ray) and the
//  beam footprint (across it), brightest along the axis (§7.9).
export const MAX_FANS = 2

export const sonarVertex = /* glsl */ `
  attribute float aW; // per-vertex clip w: corners are given as (x*w, y*w) for the phone's perspective
  varying vec2 vUv0;
  void main() { vUv0 = uv; gl_Position = vec4(position.xy, 0.0, aW); }
`

export const sonarFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv0;
  uniform sampler2D uDepth0; uniform sampler2D uDepth1;
  uniform sampler2D uColor0; uniform sampler2D uColor1; // .a = tag: 0.75 steel (wrecks), 0.5 other structure, 0 bottom
  uniform int uFanCount;
  // per fan: x = centre angle from straight-down in the SCREEN plane (rad, +right),
  //          y = half wide angle (rad), z = tanH = tan(half wide), w = tanV = tan(half thick)
  uniform vec4 uFan[${MAX_FANS}];
  uniform vec2 uNearFar;
  uniform float uRange;       // display range (metres)
  uniform float uReach;       // how far the sound reaches in the side views: the range, or (PL Forward) the far corner of the range × depth-range box
  uniform vec4 uBox0;         // panel 0 screen box in metres: x0, y0, w, h (apex at 0,0)
  uniform vec4 uBox1;         // panel 1 box (Combo's Down panel)
  uniform float uSplit;       // 1 = Combo two-panel layout: fan 1 (forward) in panel 0, fan 0 (down) in panel 1
  uniform float uApexU;
  uniform float uTime;
  uniform float uFlat;        // 1 = Panoramic (plan view)
  uniform float uBedGain;     // extra near-range gain for the bottom + structure echo (PLM 0.62, PL 1)
  uniform vec3 uCapDepth;     // the bottom's soft cap by depth below the transducer: from x to y metres, up to strength z
  uniform float uStreak;      // 1 = radial streak texture, 0 = mottled speckle (PLM Down)
  uniform float uDebug;
  uniform sampler2D uLUT;
  uniform float uGain; uniform float uDynRange; uniform float uContrast; uniform float uNoise; uniform float uGamma;
  // fish marks (sonarMarks.js): 64 × 4 float texture
  uniform sampler2D uMarks; uniform int uMarkCount; uniform float uPulse; uniform float uBeamHalf;
  // Panoramic plan view
  uniform sampler2D uTerrain; uniform float uTerrainHalf;
  uniform sampler2D uTop; uniform float uTopR; uniform float uTopCamY; uniform vec2 uTopNearFar;
  uniform vec2 uApexXZ; uniform float uApexDepth;
  // the lakebed logo (logo.js): plane origin B (bottom of the outer arc), width axis U, face-up axis V, size R
  uniform vec3 uLogoB; uniform vec3 uLogoU; uniform vec3 uLogoV;
  uniform sampler2D uLogoSdf;  // signed distance to the lockup outline (8-bit, ±uLogoMap.w metres)
  uniform vec4 uLogoMap;       // x = SVG units per metre, y = SVG x of the word's centre, z = SVG y of the fan's bottom, w = distance range (m)
  uniform vec2 uLogoSvg;       // SVG width, height covered by the texture
  uniform vec2 uLogoExt;       // half-width, height of the lockup in metres (quick reject)
  // the Mini's ice views (2026-10-16): 1 = Live Ice (flasher + Live Down), 2 = Ice Fishing (flasher + 2D history)
  uniform float uIce; uniform float uIceSplit; uniform float uAspect; uniform float uTicks;
  uniform sampler2D uHist; uniform sampler2D uHistPrev; uniform float uHistPass;
  uniform float uHistFill;      // 1 = write the whole 2D history at once (a plausible last 48 s), once per mount / context restore
  uniform float uHistPrevRange; // the range the old record was drawn at: the copy rescales it when AUTO steps the range
  uniform float uHistBot;       // the bottom's depth below the transducer (m), for the pre-roll's few faint marks
  // one colour map for the whole picture (uLUT; the app has one Color Map setting). The ice page only (0 elsewhere):
  uniform float uIdxFloor;      // jet's empty-water field: LUT index floor in the fan and the history (the app's bright blue)
  uniform float uDialMin;       // the dial's band colour never below this index (dark-based maps would smudge the white ring)
  uniform float uIceCeiling;    // 1 = near-field clutter from the ice underside along a horizontal upper fan edge (Forward)
  const float CEIL_W = 0.12;    // its wedge below the edge (rad, ~6 deg: the app's near-apex rays, plm-forward-fish-a.jpg)
  const float CEIL_PEAK = 0.60; // its echo at the apex: yellow-orange there, dark flecks by ~3 m, never above the bottom band
  uniform float uSignal; // the ice page's signal gate (IceCamp.jsx s.signal): 0 while the Mini is out of the water; always 1 on the summer lake

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  // sine-free hash (Hoskins): no diagonal streaks on integer lattices like (ping, row) — the ice page's new terms use it
  float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float vnoise(vec2 q) { vec2 i = floor(q), f = fract(q); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
  float linearize(float d) {
    float n = uNearFar.x, f = uNearFar.y;
    float z = d * 2.0 - 1.0;
    return (2.0 * n * f) / (f + n - z * (f - n));
  }
  float sampleDist(int k, vec2 uv, float rayLen) {
    float d = (k == 0) ? texture2D(uDepth0, uv).r : texture2D(uDepth1, uv).r;
    if (d >= 0.9999) return 1e9;
    return linearize(d) * rayLen;
  }
  float sampleTag(int k, vec2 uv) { return (k == 0) ? texture2D(uColor0, uv).a : texture2D(uColor1, uv).a; }
  vec4 markRow(int i, float row) { return texture2D(uMarks, vec2((float(i) + 0.5) / 64.0, (row + 0.5) / 4.0)); }

  // ---- fish: analytic marks ----
  float fishEcho(vec2 p, int k) {
    float e = 0.0;
    float rr = max(length(p), 0.05);
    vec2 rh = p / rr;
    for (int i = 0; i < 64; i++) {
      if (i >= uMarkCount) break;
      vec4 B = markRow(i, 1.0);
      if (abs(B.z - float(k)) > 0.5) continue;
      vec4 A = markRow(i, 0.0);
      vec2 pa = p - A.xy, ba = A.zw - A.xy;
      float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
      vec2 q = pa - ba * h;
      float qr = dot(q, rh), qt = q.x * rh.y - q.y * rh.x;
      float sr = 0.6 * B.x + 0.8 * uPulse, st = B.x + rr * uBeamHalf;   // pulse along the ray (thin), beam footprint across it
      float d2 = qr * qr / (sr * sr) + qt * qt / (st * st);
      if (d2 > 14.0) continue;
      // a slightly ragged rim, never holes in the core (Jason: 中间空了)
      d2 += (vnoise(p * 9.0 + B.w * 37.0) - 0.5) * 0.9 * smoothstep(0.6, 3.0, d2);
      float along = 0.35 + 0.65 * sin(3.14159 * h);       // comet/rice grain: brightest mid-way, tapering ends
      e = max(e, B.y * exp(-1.5 * d2) * along);
    }
    return e;
  }
  // ---- the lakebed lockup (logo.js): drawn from its exact plane, like the fish ----
  // A plate standing in the slice would only show its near edge in the depth strips (the rays across the
  // 20° thickness hit it too sparsely), so the side views take the part of the plate inside this fan's slab
  // and paint its outline from a signed-distance texture: ONE fetch per pixel, brightest at the edges.
  float logoEcho(vec2 p, int k) {
    vec2 w = vec2(uApexXZ.x + p.x, -uApexDepth - p.y);          // the pixel's point in the fan plane (world x, y)
    vec2 d = w - uLogoB.xy;
    float det = uLogoU.x * uLogoV.y - uLogoU.y * uLogoV.x;
    float a = (d.x * uLogoV.y - d.y * uLogoV.x) / det;          // along the word from its centre (m)
    float b = (uLogoU.x * d.y - uLogoU.y * d.x) / det;          // up the face from the fan's bottom (m)
    if (abs(a) > uLogoExt.x || b < -0.3 || b > uLogoExt.y) return 0.0;
    float zp = uLogoB.z + a * uLogoU.z + b * uLogoV.z;           // where that point of the plate is across the slab
    float uc = p.x * sin(uFan[k].x) + p.y * cos(uFan[k].x);      // distance along the fan centre
    float q = (zp - uApexXZ.y) / max(0.08, uc * uFan[k].w);
    float wz = exp(-0.8 * q * q * q * q);                        // same flat-topped beam pattern as the fish marks
    if (wz < 0.01) return 0.0;
    vec2 svg = vec2(a * uLogoMap.x + uLogoMap.y, uLogoMap.z - b * uLogoMap.x);
    float sd = (texture2D(uLogoSdf, vec2(svg.x / uLogoSvg.x, 1.0 - svg.y / uLogoSvg.y)).r - 0.5) * 2.0 * uLogoMap.w; // metres, < 0 inside
    float inside = 1.0 - smoothstep(-0.04, 0.04, sd);
    float rim = 1.0 - smoothstep(0.0, 0.25, -sd);                // edges and corners return strongest; flat faces less
    return wz * inside * (0.48 + 0.72 * rim);
  }
  float capsuleDist(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0); return length(pa - ba * h); }
  // fish shadows on the bottom (Panoramic): a rounded blotch where the body's image lands, longer along the ray
  float fishShadow(vec2 p) {
    float s = 0.0;
    for (int i = 0; i < 64; i++) {
      if (i >= uMarkCount) break;
      if (markRow(i, 3.0).z < 0.5) continue;
      vec4 C = markRow(i, 2.0);
      vec2 q = p - C.xy;
      vec2 rh = normalize(C.xy);
      float qr = dot(q, rh), qt = q.x * rh.y - q.y * rh.x;
      float d = length(vec2(qr / C.z, qt / C.w));
      d += (vnoise(p * 2.5 + float(i) * 3.1) - 0.5) * 0.8;    // irregular edge, like the app's blotches
      s = max(s, 0.7 * (1.0 - smoothstep(0.35, 1.5, d))); // soft-edged, like the app's darker blotches (not dark holes)
    }
    return s;
  }

  // ---- Panoramic helpers ----
  float terrainDepth(vec2 wxz) { return texture2D(uTerrain, (wxz + uTerrainHalf) / (2.0 * uTerrainHalf)).r; }
  // top-down depth map (structures only): p in plan metres around the apex (x = starboard, y = forward)
  float topDepth(vec2 p) {
    vec2 uv = p / (2.0 * uTopR) + 0.5;
    if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return 1e3;
    float d = texture2D(uTop, uv).r;
    if (d >= 0.9999) return 1e3;
    return -(uTopCamY - (uTopNearFar.x + d * (uTopNearFar.y - uTopNearFar.x)));
  }
  // the flat fan's coverage vs depression angle: 5°–25° with soft edges (sonarMarks.js panoLobe, same numbers)
  // + a sidelobe from 25° down (≈ 0.8, gone by 60°), same numbers as sonarMarks.js
  float panoLobe(float g) { return smoothstep(0.035, 0.105, g) * (1.0 - smoothstep(0.4, 0.49, g)) + 0.8 * smoothstep(0.4, 0.49, g) * (1.0 - smoothstep(0.62, 1.05, g)); }

  // ---- one fan's vertical-slab echo at p (metres: x along the screen, y down; r, aWorld its polar form), with the
  //      pixel's texture terms. inFan = 1 when p lies inside the fan. Used by the picture and by the flasher.
  float fanEcho(int k, vec2 p, float r, float aWorld, float tex, float filament, out float inFan) {
    inFan = 0.0;
    float a = aWorld - uFan[k].x;
    if (abs(a) > uFan[k].y || r > uReach) return 0.0;
    inFan = 1.0;
    float u = 0.5 + 0.5 * tan(a) / uFan[k].z;
    float acc = 0.0, peak = 0.0, spk = 0.0, edge = 0.0;
    // which thickness rows a pixel samples: the same set for a short run along the ray (0.08° × 0.67 m cells), not
    // a fresh random set per pixel. Per-pixel sets turned big steel faces into salt-and-pepper dust (the wreck at
    // 40 m, Jason 2026-09-25: 这个船的画面和 [app 的] 相差好远 结构和感觉完全不对); coherent sets draw them as the
    // app does — solid masses with streaks along the beams (reference/app-study/pl-forward-wreck-*.jpg)
    float jit = hash(vec2(floor(aWorld * 700.0), floor(r * 1.5)) + 0.11);
    float sigma = 0.22 + 0.010 * r;
    float tailLen = 0.35 + 0.015 * r;
    for (int j = 0; j < 24; j++) {
      float v = (float(j) + jit) / 24.0;
      float ty = (v * 2.0 - 1.0) * uFan[k].w;
      float hit = sampleDist(k, vec2(u, v), length(vec3(tan(a), ty, 1.0)));
      float dr = r - hit;
      float tag = sampleTag(k, vec2(u, v));
      float structure = step(0.25, tag), steel = step(0.62, tag);
      // timber and rock faces are sharp (real pulse ≈ 0.1 m) and solid; the bottom band is wider with a tail.
      // Steel (wrecks) is by far the strongest reflector: after the log compression its pulse skirts and the
      // ringing inside the hull stay bright, so the app draws a wreck as thick glowing bands with long tails,
      // not a line drawing (Jason 2026-09-25: 结构物的成像不对劲; PL Forward wreck recording, same depth and scale:
      // reference/engine-compare/wreck-compare-*.png)
      float sg = mix(sigma, mix((0.08 + 0.004 * r) * (1.0 + 1.5 * smoothstep(6.0, 30.0, r)), sigma, steel), structure);
      float pulse = exp(-dr * dr / (sg * sg)) * (1.0 - 0.22 * structure) * mix(1.0, 0.85 + 0.25 * filament, structure);
      float tail = dr > 0.0 ? (0.6 + 0.6 * steel) * exp(-dr / (tailLen * (1.0 + 0.5 * steel))) : 0.0;
      float second = 0.10 * exp(-(r - 2.0 * hit) * (r - 2.0 * hit) / (4.0 * sigma * sigma));
      float wgt = 0.55 + 0.9 * (1.0 - abs(v * 2.0 - 1.0));
      acc += (1.2 * pulse + tail + second) * wgt;
      peak = max(peak, pulse * (1.0 - structure));
      edge = max(edge, exp(-dr * dr / (0.16 * sg * sg)) * (1.0 - structure)); // the first return: a thin hot line
      spk = max(spk, pulse * structure * (1.0 + 0.3 * steel));
    }
    // Bottom brightness (Jason 2026-09-25: 画面特别是底部貌似还是太亮 深水也是 … 高亮的部分和桔红色的关系): over a flat
    // bottom every row across the slab lands at one range and the integrated echo added up to a solid white band
    // (38–44 % of the lit pixels white in PL scenes; the app's bottom scenes 6–7 %). Past the near range (where TVG
    // already tames it) the integrated part saturates softly (K 0.4), so the body stays orange, and a thin
    // first-return line brings back the app's hot leading edge.
    // The cap also follows the depth below the transducer (#91, #92). The middle of the lake became shallower
    // (Jason 2026-10-04: 最深的地方做30ft深, then 相对缓慢得向深水过度: a slope from ~30 to 80 ft), and those bottoms sit
    // inside the 6–14 m range ramp while AUTO depth zooms them in: the default view went to 19–22 % white (PL) and
    // 18–26 % (Mini, Down/Combo). PingLive caps from 5.5 m to 7.5 m below the transducer (~21–28 ft of water), full
    // strength; the Mini from 7.5 m to 9.5 m (~28–34 ft) at 80 %, because its own near gain (uBedGain) already holds
    // its 28–30 ft bottoms at 5–8 % and a full cap took its 36 ft bottom to 0 %. The shelf, the island and the deep
    // floor keep their look.
    float capR = smoothstep(6.0, 14.0, r), capD = uCapDepth.z * smoothstep(uCapDepth.x, uCapDepth.y, p.y);
    float accI = acc / 16.0, K = mix(3.0, 0.4, max(capR, capD)); // (4–10 m on range tried: the Mini's calibrated shelf lost its hot edge, 6 → 0.3 % white)
    accI = K * (1.0 - exp(-accI / K));
    acc = accI + 0.7 * peak + 0.3 * edge * (0.55 + 0.6 * filament) + 0.9 * spk;
    // Bottoms past the cap depth are toned no nearer than 80 % of the range window (#92). With the middle sloping
    // from 30 to 80 ft, Forward (the visitor's fixed range) drew its nearer bottom at 11–22 % white against the old
    // plateau's 8 %; now 7–12 %. Down's AUTO range already puts the bottom at ~80 %, so Down barely changes
    // (0.9 started to dim the deep floor in Down, 8 → 5 %).
    float rT = mix(r, max(r, 0.8 * uRange), capD);
    float atten = 1.0 - 0.4 * clamp(rT / uRange, 0.0, 1.0);
    // near-range gain (TVG): close returns get less gain, like a real sonar's time-varying gain. In shallow
    // water every ray across the slab hits the bottom at the same range, the band saturates to a solid white
    // slab and AUTO depth then zooms it (Jason 2026-09-24: 浅水的时候 … 过爆感太强了 可以折中一点). Full gain
    // again from ~11 m (≈ 0.9 at 9 m), so the calibrated deeper pictures barely change; fish marks keep their
    // approved look. 5 m ≈ 0.43: the core just reaches white and keeps its streaks instead of a solid slab.
    float tvg = mix(0.32, 1.0, smoothstep(3.0, 11.0, r));
    // PingLive Mini: its narrow 39° fan meets a shallow bottom at one range across the whole fan, and AUTO depth
    // zooms that band in, so it still burnt to a yellow-white slab (Jason 2026-09-25: PingLive mini是不是在浅水太亮了
    // 和之前pl一样的问题). Extra near gain for PLM only, back to full by 18 m: deep pictures keep their calibration.
    tvg *= mix(uBedGain, 1.0, smoothstep(5.0, 18.0, r));
    // near-field fish 40 % brighter, fading back to normal by 16 m (Jason 2026-09-27: 近场的鱼要亮40%)
    float e = max(acc * atten * tex * tvg, fishEcho(p, k) * mix(1.4, 1.0, smoothstep(8.0, 16.0, r)));
    e = max(e, logoEcho(p, k) * atten * (0.7 + 0.55 * (filament - 0.8)) * (0.72 + 0.28 * tex));
    return e;
  }
  // the flasher: the echo at one depth straight under the transducer — the Down fan's middle beams (±7°), fish included
  float flasherEcho(float depth) {
    if (uFanCount < 1 || depth > uReach) return 0.0;
    float e = 0.0;
    for (int i = -2; i <= 2; i++) {
      float a = float(i) * 0.06;
      vec2 p = vec2(depth * sin(a), depth * cos(a));
      float inF; e = max(e, fanEcho(0, p, depth, a, 1.0, 1.0, inF));
    }
    return e * uSignal; // no signal: the ring stays lit, no returns on it
  }
  // the app's tone curve (assets/aio_shader.glsl): log compression → gain / dynamic-range window → LUT index
  float toneIdx(float echo) {
    float raw = echo * 65535.0;
    float bs = 4000.0;
    float lv = log(1.0 + raw / bs) / log(1.0 + 65535.0 / bs);
    float width = clamp(uDynRange, 0.05, 1.0);
    float lo = (1.0 - width) * 0.5 + width * (uGain - 0.5) + 0.5 * width * uContrast;
    float hi = lo + width * (1.0 - 0.45 * uContrast) * (uFlat > 0.5 ? 1.0 : 1.15);
    float idx = echo > 0.0005 ? clamp((lv - lo) / (hi - lo), 0.0, 1.0) : 0.0;
    return pow(idx, uGamma);
  }
  vec3 pal(float idx) { return texture2D(uLUT, vec2(idx * (255.0 / 256.0) + 0.5 / 256.0, 0.5)).rgb; }
  // jet's empty-water field (ice page): a floor with a little speckle and a few cyan specks (h, h2: hashes 0..1)
  float idxFloor(float h, float h2) {
    if (uIdxFloor <= 0.0) return 0.0;
    return h2 > 0.985 ? 0.35 + 0.15 * fract(h2 * 67.0) : uIdxFloor + 0.05 * h;
  }
  // the flasher dial (the Mini's Ice Fishing views): depth runs clockwise from the top round a white ring; the
  // returns paint the ring in the page's colour map; the pale centre disc carries the DOM depth readout
  vec3 flasherPixel(vec2 uv) {
    vec2 q = vec2(uv.x * uAspect, uv.y);
    vec2 c = vec2(uIceSplit * uAspect * 0.5, 0.53); // a little above centre: the app's bottom bar runs under the dial
    float R1 = 0.36, R0 = 0.235;
    vec2 d = q - c; float r = length(d);
    vec3 panel = vec3(0.045, 0.05, 0.065);
    if (r > R1 + 0.01) return panel;
    if (r < R0 - 0.004) return vec3(0.74, 0.76, 0.86);
    float th = atan(d.x, d.y); if (th < 0.0) th += 6.2831853;
    float depth = th / 6.2831853 * uRange;
    float idx = toneIdx(flasherEcho(depth));
    vec3 ring = vec3(0.9, 0.91, 0.94);
    float on = smoothstep(0.05, 0.16, idx);
    // the band fades at the ring's edges, like a lamp seen through a slot
    float across = smoothstep(R0, R0 + 0.025, r) * (1.0 - smoothstep(R1 - 0.025, R1, r));
    vec3 col = mix(ring, pal(max(idx, uDialMin)), on * (0.75 + 0.25 * across));
    // tick marks on the inner edge, one per major division
    float seg = th * uTicks / 6.2831853;
    float tf = abs(fract(seg + 0.5) - 0.5) * 6.2831853 / uTicks * r;
    float tick = (1.0 - smoothstep(0.0025, 0.005, tf)) * (1.0 - smoothstep(R0 + 0.03, R0 + 0.045, r));
    col = mix(col, vec3(0.25, 0.27, 0.34), tick * (1.0 - 0.7 * on));
    float rim = max(1.0 - smoothstep(0.0, 0.005, abs(r - R1)), 1.0 - smoothstep(0.0, 0.005, abs(r - R0)));
    col = mix(col, vec3(0.62, 0.64, 0.7), rim * 0.7);
    float aa = (1.0 - smoothstep(R1, R1 + 0.006, r)) * smoothstep(R0 - 0.004, R0 + 0.002, r);
    return mix(r < R0 ? vec3(0.74, 0.76, 0.86) : panel, col, aa);
  }

  void main() {
    vec2 vUv = vUv0;
    // ---- the 2D history pass (Ice Fishing View): shift the record one column left, draw the newest ping at the right edge
    if (uHistPass > 0.5) {
      float W = 384.0;
      float col = floor(vUv.x * W), row = floor(vUv.y * 256.0);
      bool fill = uHistFill > 0.5;
      if (!fill && col < W - 1.0) {
        // shift left one ping; when AUTO stepped the range, the old columns move onto the new depth axis (below the old
        // range nothing was recorded: the empty field, so jet's blue floor on the ice page)
        float y0 = 1.0 - (1.0 - vUv.y) * uRange / uHistPrevRange;
        float e0 = idxFloor(hash12(vec2(col, row) + 0.37), 0.0);
        gl_FragColor = y0 < 0.0 ? vec4(e0, 0.0, 0.0, 1.0) : texture2D(uHistPrev, vec2(vUv.x + 1.0 / W, y0)); return;
      }
      // the pre-roll: every column is its own ping of the last 48 s (its own speckle), the bottom band breathing a
      // little in position (slow, +-1.5 rows, straight again by the live edge) and strength; no fish but a few faint marks
      float back = fill ? W - 1.0 - col : 0.0;
      float ping = floor(uTime * 8.0) - back;
      float depth = (1.0 - vUv.y) * uRange, g = 1.0, mk = 0.0;
      if (fill) {
        float h1 = hash(vec2(col, 7.13)), h2 = hash(vec2(col, 3.71));
        float wob = ((vnoise(vec2(col / 37.0, 1.3)) - 0.5) * 2.0 + (h1 - 0.5)) * smoothstep(0.0, 40.0, back);
        depth -= wob * uRange / 256.0;
        g = 0.85 + 0.15 * (0.5 * h2 + 0.5 * vnoise(vec2(col / 23.0, 5.1)));
        for (int m = 0; m < 2; m++) {
          float fm = float(m);
          float c0 = W * (0.12 + 0.3 * fm + 0.25 * hash(vec2(fm, 1.7))), len = 12.0 + 18.0 * hash(vec2(fm, 2.9));
          float x = (col - c0) / len;
          if (x < 0.0 || x > 1.0) continue;
          float dm = uHistBot * (0.4 + 0.35 * hash(vec2(fm, 4.3))) + 0.25 * sin(x * 3.14159 + fm);
          float dz = (depth - dm) / 0.1;
          mk = max(mk, 0.2 * sin(x * 3.14159) * exp(-dz * dz));
        }
      }
      float n = hash(vec2(ping, row));
      float gate = (uFanCount > 0 ? 1.0 : 0.0) * uSignal; // no signal: the record scrolls a dark gap
      float floorN = max(0.0, 0.06 + 0.16 * n - 0.22 * uNoise) * 0.7 * gate;
      float idx = toneIdx(max(max(flasherEcho(depth) * g, mk * gate), floorN));
      idx = max(idx, idxFloor(hash12(vec2(ping, row) + 0.37), hash12(vec2(row, ping) * 1.37 + 5.1)) * gate);
      gl_FragColor = vec4(idx, 0.0, 0.0, 1.0); return;
    }
    // ---- the ice views: the flasher on the left, the Live Down fan or the 2D history on the right
    if (uIce > 0.5) {
      if (vUv.x < uIceSplit) { gl_FragColor = vec4(flasherPixel(vUv), 1.0); return; }
      if (vUv.x < uIceSplit + 0.006) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
      vUv.x = (vUv.x - uIceSplit - 0.006) / (1.0 - uIceSplit - 0.006);
      if (uIce > 1.5) {
        if (vUv.x > 0.965) { gl_FragColor = vec4(pal(vUv.y), 1.0); return; } // the colour bar at the edge
        gl_FragColor = vec4(pal(texture2D(uHist, vec2(vUv.x / 0.965, vUv.y)).r), 1.0); return;
      }
    }
    float vyDown = 1.0 - vUv.y;
    int panel = 0;
    if (uSplit > 0.5) {
      float dx = vUv.x - (uApexU + (0.8 - uApexU) * vyDown);
      float gap = 0.012;
      if (dx < -gap) panel = 1; else if (dx > gap) panel = 0; else {
        float e = abs(dx) / gap;
        gl_FragColor = vec4(vec3(0.62) * ((e > 0.55 && e < 0.85) ? 1.0 : 0.0), 1.0); return;
      }
    }
    vec4 box = panel == 0 ? uBox0 : uBox1;
    float vy = uFlat > 0.5 ? vUv.y : vyDown;
    vec2 p = box.xy + vec2(vUv.x, vy) * box.zw; // metres; apex (0,0)
    float r = length(p);
    float aWorld = atan(p.x, p.y);
    float echo = 0.0, inAny = 0.0, fl = 0.0;
    float t = floor(uTime * 8.0);   // "pings": speckle changes 8× a second
    float rays = vnoise(vec2(aWorld * 22.0 + 3.1, 0.5));

    if (uFlat > 0.5) {
      // ================= Panoramic: plan-view photograph =================
      if (abs(aWorld) <= uFan[0].y && r <= uRange * 1.45 && r > 0.05) {
        inAny = 1.0;
        vec2 rw = vec2(p.y, p.x) / r;                // ray direction in world (x, z)
        vec2 w = uApexXZ + vec2(p.y, p.x);           // world (x, z) of this pixel
        float Db = terrainDepth(w);
        // structure seen through the beam: coverage over the beam footprint (soft, fuzzy clumps, not line drawings);
        // the tap ring is rotated at random per pixel and per ping, so the top map's texels never show as a grid
        float rb = max(0.35, r * 0.03);
        float rot = hash(gl_FragCoord.xy * 0.37 + floor(uTime * 8.0) * 0.11) * 6.2832;
        float S = topDepth(p), cov = 0.0;
        for (int q = 0; q < 8; q++) {
          float ang = float(q) * 0.7854 + rot;
          float Sq = topDepth(p + rb * vec2(cos(ang), sin(ang)));
          cov += step(Sq, Db - 0.08);
          S = min(S, Sq);
        }
        cov = (cov + step(topDepth(p), Db - 0.08) * 2.0) / 10.0;
        bool hasS = cov > 0.05;
        float target = (hasS ? S : Db) - uApexDepth; // depth below the transducer of what this pixel sees
        float lobe = panoLobe(atan(target, r));
        // acoustic shadow: march back toward the transducer; what lies above the ray blocks it. The shadow builds
        // up with how much of the path is blocked, so solid things cast solid shadows and sparse brush only a faint
        // one (a single hit made every twig a hard, dotted black ray); per-pixel jitter keeps it soft
        float jit = hash(gl_FragCoord.xy * 0.61 + t * 0.13); // per-pixel offsets (tried 2026-09-25: ray-coherent ones drew parallel streak lines, fixed ones stair-stepped the top map's texels)
        float occl = 0.0;
        for (int s = 0; s < 40; s++) {
          float tt = r * (float(s) + jit) / 40.0;
          if (tt < 0.4 || tt > r - 0.45) continue;
          vec2 pt = p * (tt / r);
          float occ = min(terrainDepth(uApexXZ + vec2(pt.y, pt.x)), topDepth(pt)) - uApexDepth;
          float line = target * tt / r;
          occl += smoothstep(0.1, 0.6, line - occ);
        }
        // Shadows (Jason 2026-09-25, rocks on the hump: 这些石头感觉画面不正常; app Panoramic structure clips, 2025-03,
        // reference/app-study/panoramic-structure/): anything that blocks a couple of samples of the path is a real,
        // dark shadow trailing away from the boat — a rock only blocked 1–2 samples, so it cast a faint dotted one
        float shade = clamp(occl / 2.0, 0.0, 1.0);
        // Calibrated in echo units against the app's lake frames (§7.13): after the tone curve the field sits
        // at LUT index 0.10–0.25 (echo 0.099–0.138), shadows ≈ 0.03–0.06, faces toward the transducer higher.
        // The window is steep down there, so every texture is a SMALL multiplicative variation.
        float patchesN = vnoise(w * 0.33 + 3.7) * 0.6 + vnoise(w * 1.1 - 1.3) * 0.4;   // bottom patches, fixed to the lake
        float streakP = vnoise(vec2(aWorld * 260.0, r * 2.6 + t * 0.21));               // along-ray streaks, change per ping
        float speck = hash(gl_FragCoord.xy * 0.73 + t * 0.37);
        float beamGain = vnoise(vec2(aWorld * 30.0 + 1.7, 0.3));                       // beam-to-beam gain
        // bottom: grazing incidence — slopes facing the transducer brighter, back slopes darker
        float slope = (terrainDepth(w - rw * 0.7) - terrainDepth(w + rw * 0.7)) / 1.4;
        float incid = clamp(1.0 + 0.9 * slope, 0.82, 1.55);
        float grainP = hash(floor(vec2(r * aWorld / 0.07, r / 0.22)) + t);             // grains ≈ 7 cm across × 22 cm along the ray, per ping
        float bands = vnoise(vec2(aWorld * 16.0 + 5.3, 0.7));                         // wide beam-to-beam gain bands (the app's fan of rays)
        // Texture by range, as the app shows it (Jason 2026-09-24: 背景太失真了 完全不像是声纳画面):
        //  - short/medium range (app lake frames, 14–29 m): a smooth crimson field whose fine texture is soft
        //    speckle smeared ACROSS the beams (angular cells ≈ 1.6°, range cells ≈ 5 cm), re-drawn every ping,
        //    over soft patches and a few wide brightness sectors;
        //  - long range (app 62 m frame): radial streaks, grain and strong beam-to-beam sectors.
        float ping = floor(uTime * 8.0);
        float smearA = vnoise(vec2(aWorld / 0.028, r / 0.05) + vec2(ping * 7.13, ping * 3.71));
        float smearB = vnoise(vec2(aWorld / 0.012, r / 0.03) + vec2(ping * 1.97, ping * 5.31));
        float smear = 0.65 * smearA + 0.35 * smearB;
        float longR = smoothstep(35.0, 55.0, uRange);
        float sector = vnoise(vec2(aWorld * 5.0 + 5.3, 0.7));                            // wide beam-group sectors (≈ 11°)
        float fine = mix(0.34 * (smear - 0.5), 0.08 * (streakP - 0.5) + 0.2 * (grainP - 0.5) + 0.05 * (speck - 0.5), longR);
        float m = 0.84 + 0.22 * patchesN + fine + 0.12 * (sector - 0.5) + 0.06 * longR * (beamGain - 0.5) + 0.44 * longR * (bands - 0.5);
        float e = 0.126 * m * incid * lobe; // only what the 5°–25° slab reaches shows (the 3D curtain is the same slab)
        if (hasS) {
          // structure: the edge rising toward the transducer is hot, the rest a mid-bright granular clump
          // The side facing the transducer lights up (the app: bright near edges, bright branch lines). The facing is
          // taken from the height right under the pixel against the height a little toward the boat; it used the
          // footprint's highest tap, which lit a ring all round every rock (the "bubbles"), far side included.
          float dN = max(0.35, 0.03 * r);
          float S0 = topDepth(p), face = 0.0;
          if (S0 < Db - 0.08) {
            float Sn = min(topDepth(p - (p / r) * dN), terrainDepth(w - rw * dN));
            face = clamp((Sn - S0) / dN, 0.0, 1.5);
          }
          float es = (0.17 + 0.8 * face) * (0.7 + 0.45 * mix(smear, grainP, longR)) * lobe;
          e = mix(e, max(e, es), smoothstep(0.08, 0.9, cov)); // sparse brush reads faint, solid rock/wood bright
        }
        e *= (1.0 - 0.85 * shade) * (1.0 - 0.2 * fishShadow(p));
        // near the transducer: darker, with clutter speckle and bright spokes along a few beams (app)
        float near = 1.0 - smoothstep(0.0, 0.3 * uRange, r);
        e = mix(e, e * 0.84, near);
        float spoke = smoothstep(0.82, 0.97, vnoise(vec2(aWorld * 55.0 + 2.1, floor(uTime * 2.0) * 0.37)));
        e = max(e, near * (step(0.95, speck) * (0.14 + 0.2 * rays) + spoke * (0.13 + 0.12 * grainP)));
        echo = max(e, fishEcho(p, 0));
      }
    } else {
      // ================= Down / Forward / Combo: vertical slab =================
      float streak = vnoise(vec2(aWorld * 140.0, r * 5.0 + t * 0.37));
      float mottle = vnoise(p * 9.0 + t * 0.5) * 0.7 + vnoise(p * 23.0 - t * 0.3) * 0.5;
      float grain = hash(floor(vec2(aWorld * 600.0, r * 6.0)) + t);
      float tex = uStreak > 0.5 ? 0.45 + 0.75 * streak + 0.25 * grain : 0.35 + 0.9 * mottle + 0.2 * grain;
      float fil = vnoise(vec2(aWorld * 420.0, r * 9.0 + t * 0.13));
      float fil2 = vnoise(vec2(aWorld * 900.0 + 7.0, r * 18.0 - t * 0.1));
      float filament = 0.35 + 0.75 * fil + 0.35 * fil2 * fil;
      float floorTex = uStreak > 0.5 ? 0.10 + 0.08 * rays + 0.05 * streak : 0.06 + 0.16 * mottle;
      floorTex = max(0.0, floorTex - 0.22 * uNoise) * (1.0 - 0.35 * min(r / uRange, 1.0));
      int kFrom = 0, kTo = uFanCount;
      if (uSplit > 0.5) { kFrom = panel == 0 ? 1 : 0; kTo = kFrom + 1; }
      for (int k = 0; k < ${MAX_FANS}; k++) {
        if (k < kFrom || k >= kTo) continue;
        float inF;
        float e = fanEcho(k, p, r, aWorld, tex, filament, inF);
        inAny = max(inAny, inF);
        echo = max(echo, e);
        // ice page, Forward: the fan's upper edge runs flat just under the ice; its underside returns a dotted near-field
        // streak along that edge for the first few metres (the app's surface rays at the apex, sonar-style.md 6.2)
        if (uIceCeiling > 0.5 && uFan[k].x + uFan[k].y >= 1.55 && inF > 0.0) {
          float dEdge = (uFan[k].x + uFan[k].y) - aWorld;
          float ceilW = exp(-dEdge * dEdge / (CEIL_W * CEIL_W));
          float env = mix(CEIL_PEAK, 0.08, smoothstep(0.3, 3.2, r)) * (1.0 - smoothstep(2.2, 3.6, r));
          float dots = step(0.45, hash12(floor(vec2(aWorld * 25.0, r * 4.0)) + floor(uTime * 2.0) * vec2(1.7, 3.1)));
          echo = max(echo, ceilW * env * (0.45 + 0.55 * dots) * tex);
        }
      }
      fl = idxFloor(grain, hash12(floor(p * 12.0) + t * vec2(1.37, 2.11)));
      float near = 1.0 - smoothstep(0.0, 2.4, r);
      echo = max(echo, inAny * near * near * (0.25 + 0.6 * rays) * tex * 0.5);
      echo = max(echo, inAny * floorTex * 0.7);
    }
    // the signal gate: the fan keeps its shape but carries no returns (LUT index 0) while the Mini is out of the water,
    // and the picture comes back through the tone window as the signal ramps up (the bottom, the strongest echo, first)
    echo *= uSignal;

    if (uDebug > 0.5) { float d = texture2D(uDepth0, vUv).r; gl_FragColor = vec4(vec3(d >= 0.9999 ? 0.0 : 1.0 - linearize(d) / 60.0), 1.0); return; }
    float idx = max(toneIdx(echo), fl * uSignal) * inAny;
    // one colour map for fan, dial and history (SonarScreen.jsx picks it; the ice page: ?icemap=)
    vec3 col = pal(idx) * inAny;
    gl_FragColor = vec4(col, 1.0);
  }
`
