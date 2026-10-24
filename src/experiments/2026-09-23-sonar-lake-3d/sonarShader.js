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
  uniform sampler2D uDepthB0; uniform sampler2D uDepthB1; // the far side of structure (back-face strips)
  uniform sampler2D uEcho0; uniform sampler2D uEcho1; uniform vec2 uFanR; // the echo splat of every structure surface (angle × range), per fan
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
  uniform vec4 uTune; // dev only (window.__sonarTune.k): scales for the band's pulse, tail, peak+edge and integrated body, all 1 in production
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
  uniform float uIce; uniform float uIceSplit; uniform float uAspect; uniform float uTicks; uniform sampler2D uLUT2;
  uniform sampler2D uHist; uniform sampler2D uHistPrev; uniform float uHistPass; uniform float uHistFill; uniform float uIceAmber;
  uniform float uSignal; // the ice page's signal gate (IceCamp.jsx s.signal): 0 while the Mini is out of the water; always 1 on the summer lake

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
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
  float sampleDistB(int k, vec2 uv, float rayLen) {
    float d = (k == 0) ? texture2D(uDepthB0, uv).r : texture2D(uDepthB1, uv).r;
    if (d >= 0.9999) return 1e9;
    return linearize(d) * rayLen;
  }
  float sampleEcho(int k, float u, float rn) { return (k == 0) ? texture2D(uEcho0, vec2(u, rn)).r : texture2D(uEcho1, vec2(u, rn)).r; }
  float sampleTag(int k, vec2 uv) { return (k == 0) ? texture2D(uColor0, uv).a : texture2D(uColor1, uv).a; }
  vec4 markRow(int i, float row) { return texture2D(uMarks, vec2((float(i) + 0.5) / 64.0, (row + 0.5) / 5.0)); }

  // ---- fish: analytic marks (sonarMarks.js) ----
  // What a formed beam makes of one fish (decision #120, after LiveScope and the app's own recordings): every point
  // of the body a → b (tail → head, screen metres, apex at 0) is smeared by the beam's point spread — thin along the
  // ray (the pulse, sr), a fixed ANGLE across it (st grows with range). Far fish are needles along the arc, near ones
  // show their own length and heading. The spindle tapers to points, trails a little in range behind the target, is
  // brightest at the swim bladder, and is broken up by speckle on the beam grid that changes every ping (the rim much
  // more than the core: never holes in the middle). Strong targets leak into the neighbouring beams (sidelobes): a
  // faint ladder along the arc. Returns 0..1 (× the mark's strength outside).
  float fishDash(vec2 p, vec4 seg, float bw, float seed, float ping, float lobe, float asp) {
    vec2 a = seg.xy, b = seg.zw, c = 0.5 * (a + b);
    float rc = max(length(c), 0.3);
    vec2 rh = c / rc, th = vec2(rh.y, -rh.x);
    float sr = 0.7 * uPulse + 0.25 * bw, st = uBeamHalf * rc + bw;
    // into the mark's frame, in units of the spread: x across the ray, y along it
    vec2 pa = p - a, ba = b - a;
    vec2 qa = vec2(dot(pa, th) / st, dot(pa, rh) / sr), qb = vec2(dot(ba, th) / st, dot(ba, rh) / sr);
    float h = clamp(dot(qa, qb) / max(dot(qb, qb), 1e-6), 0.0, 1.0);
    vec2 q = qa - qb * h;
    if (q.y * q.y > 16.0 || abs(q.x) > 9.0) return 0.0;
    float tx = abs(q.x);
    // range tail behind the target; the spindle narrows toward its ends
    float qy = q.y / ((q.y > 0.0 ? 1.5 : 1.0) * mix(1.0, 0.6, smoothstep(0.3, 1.5, tx)));
    float d2 = tx * tx + qy * qy;
    if (d2 > 7.0 && lobe <= 0.0) return 0.0; // below 1e-4 even with the ragged rim
    // speckle on the beam grid (angle × range) in cells of the mark's own spread, new every ping, the last ping
    // still showing a little (persistence)
    float ang = atan(p.x, p.y), rp = length(p);
    vec2 nc = vec2(ang * rc / (0.55 * st), rp / (1.1 * sr)) + seed * 17.0;
    vec2 o1 = vec2(fract(ping * 0.1731) * 97.0, fract(ping * 0.3117) * 89.0);
    vec2 o0 = vec2(fract((ping - 1.0) * 0.1731) * 97.0, fract((ping - 1.0) * 0.3117) * 89.0);
    float n = 0.65 * (0.6 * vnoise(nc + o1) + 0.4 * vnoise(nc * 2.3 + o1.yx)) + 0.35 * vnoise(nc + o0);
    n = clamp(0.5 + (n - 0.5) * 2.6, 0.0, 1.0); // the averaged noise sits in 0.3–0.7: back to full contrast
    d2 += (n - 0.5) * 1.3 * smoothstep(0.4, 2.5, d2);                     // ragged rim
    // core ±20 %, rim much more: LiveScope's and the app's marks are smooth spindles inside (#123)
    float tex = mix(0.8 + 0.4 * n, 0.12 + 1.75 * n, smoothstep(0.25, 1.6, d2));
    // along the body (when it is longer than the spread): the swim bladder (~90 % of the echo) in the front half,
    // weaker head and tail peaks; broadside the flank fills in between, head-on the peaks stand apart
    float prof = max(max(exp(-30.0 * (h - 0.6) * (h - 0.6)), 0.45 * exp(-90.0 * (h - 0.93) * (h - 0.93))),
                     max(0.4 * exp(-60.0 * (h - 0.08) * (h - 0.08)), mix(0.1, 0.55, asp)));
    float body = mix(1.0, prof, smoothstep(0.6, 2.5, length(qb)));
    // a second, weaker ridge just behind the first on bigger or nearer fish (the far side of the body / the swim bladder;
    // LiveScope's close marks often show two parallel ridges along the arc)
    float off = (0.9 * bw + 0.015) / sr;
    float ridge2 = 0.55 * smoothstep(1.0, 1.6, off) * exp(-1.5 * (tx * tx + (q.y - off) * (q.y - off) / 1.2));
    float e = max(exp(-1.5 * d2), ridge2) * tex * body;
    // sidelobes: the next beams out along the arc, a few faint stripes fading away
    float sx = tx - 1.5;
    if (lobe > 0.0 && sx > 0.0) {
      float rung = 0.5 + 0.5 * cos(6.2832 * sx / 1.6);
      e = max(e, lobe * exp(-1.5 * q.y * q.y) * rung * rung * exp(-sx / 2.2) * (0.6 + 0.8 * n));
    }
    return e;
  }
  // the old capsule mark (until #120), kept for the ice page's jig
  float legacyMark(vec2 p, vec4 A, vec4 B, float rr, vec2 rh) {
    vec2 pa = p - A.xy, ba = A.zw - A.xy;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    vec2 q = pa - ba * h;
    float qr = dot(q, rh), qt = q.x * rh.y - q.y * rh.x;
    float sr = 0.6 * B.x + 0.8 * uPulse, st = B.x + rr * 0.004;
    float d2 = qr * qr / (sr * sr) + qt * qt / (st * st);
    if (d2 > 14.0) return 0.0;
    d2 += (vnoise(p * 9.0 + B.w * 37.0) - 0.5) * 0.9 * smoothstep(0.6, 3.0, d2);
    return B.y * exp(-1.5 * d2) * (0.35 + 0.65 * sin(3.14159 * h));
  }
  float fishEcho(vec2 p, int k) {
    float e = 0.0;
    float rr = max(length(p), 0.05);
    vec2 rh = p / rr;
    float ping = floor(uTime * 8.0);
    for (int i = 0; i < 64; i++) {
      if (i >= uMarkCount) break;
      vec4 B = markRow(i, 1.0);
      if (abs(B.z - float(k)) > 0.5) continue;
      vec4 A = markRow(i, 0.0);
      // quick reject: well clear of the body and its spread
      vec2 pa = p - A.xy, ba = A.zw - A.xy;
      float reach = length(ba) + 0.5 + B.x + 12.0 * uBeamHalf * rr;
      if (dot(pa, pa) > reach * reach) continue;
      vec4 F = markRow(i, 3.0);
      if (F.x < -0.5) { e = max(e, legacyMark(p, A, B, rr, rh)); continue; }
      // the whole echo flickers ping to ping: a calm fish is steady, a swimming or turning one swings widely, more so
      // when it faces the beam (a small, changing target)
      float fl = hash(vec2(B.w * 91.7, fract(ping * 0.0731) * 113.0));
      float s = B.y * (1.0 + min(0.7, 0.06 + 0.4 * F.x + 0.25 * (1.0 - F.y)) * (fl - 0.5) * 2.0);
      float lobe = 0.075 * smoothstep(0.75, 1.3, B.y);
      e = max(e, s * fishDash(p, A, B.x, B.w, ping, lobe, F.y));
      e = max(e, B.y * F.w * fishDash(p, markRow(i, 4.0), B.x, B.w + 0.5, ping - 1.0, 0.0, F.y));
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
    float acc = 0.0, peak = 0.0, spk = 0.0, edge = 0.0, solidAcc = 0.0;
    // which thickness rows a pixel samples: the same set for a short run along the ray (0.08° × 0.67 m cells), not
    // a fresh random set per pixel. Per-pixel sets turned big steel faces into salt-and-pepper dust (the wreck at
    // 40 m, Jason 2026-09-25: 这个船的画面和 [app 的] 相差好远 结构和感觉完全不对); coherent sets draw them as the
    // app does — solid masses with streaks along the beams (reference/app-study/pl-forward-wreck-*.jpg)
    float jit = vnoise(vec2(aWorld * 50.0, r * 1.5) + 0.11); // the row set drifts smoothly along and across the beam (~1.2° × 0.67 m), no cell edges
    // the bottom band as the 2.0.0 recordings draw it (PL Down, 80 ft, 2026-10-23: a 0.5 m body above 40 % of peak with a
    // 0.6 m tail, not a thin line): a slightly longer pulse and tail than before (0.22 + 0.010 r / 0.35 + 0.015 r)
    // measured on the 2.0.0 PL Down burst (2026-10-23, 20 frames, flat bottom 31–40 ft): the band above 40 % of its peak
    // is 1.4–1.6 ft thick and does NOT grow with range (the pulse is a fixed length in time); ours was 3.9 ft
    float sigma = 0.15 + 0.003 * r;
    float tailLen = 0.28 + 0.008 * r;
    // the grain of a real return (same recording, measured in the hull: cells ~0.6 m along the ray × 0.25 m across,
    // re-drawn every ping, 18 % of the pixels change class between pings): structure faces and the mass behind them
    // are built from it, instead of the thin radial filaments that drew a wreck as a line drawing
    float png = floor(uTime * 8.0);
    // measured in the recording's hull: grains ~0.6 m ACROSS the beam × 0.25 m along the ray (the beam's width smears
    // across, the range cell is short), and about a fifth of them change between pings
    float g2 = vnoise(vec2(aWorld * r * 2.0 + png * 0.37, r * 4.5 + png * 1.9));          // grains ~0.6 m across the beam × 0.25 m along the ray
    float g3 = vnoise(vec2(aWorld * r * 7.0 + 3.0 + png * 0.9, r * 16.0 - png * 3.1));   // finer speckle, new every ping
    float gh = vnoise(vec2(aWorld * r * 1.0 + 9.0, r * 1.2 + png * 0.23));              // slow patches, a little darker
    float grainS = (0.3 + 1.0 * pow(0.45 * g2 + 0.55 * g3, 1.2)) * mix(0.8, 1.0, gh); // 0.25..1.3: dense speckle with red pits (the recording's faces are 85 % lit; its dark cavities are geometry)
    // Structure as the app draws it (Jason 2026-10-23: 结构物的画面跟真实的声纳的画面差距还是比较远; references: the PL Forward
    // wreck frames and the 2.0.0 Live Combo pilings, reference/app-study/2026-10-23/40-live-combo.jpg): a trunk or
    // piling is a solid column with a hot core, and it throws a BLACK shadow — the bottom band breaks off behind it and
    // comes back a few metres on. Two things make that: the beam's main lobe is peaked across the slab (the centre
    // rows carry most of the energy, so a trunk on the centreline blocks most of it), and whatever the rows in front
    // of a pixel hit as structure casts a shadow on the rows behind — wblk / wsum below, squared like the app's.
    float wsum = 0.0, wblk = 0.0;
    for (int j = 0; j < 24; j++) {
      float v = (float(j) + jit) / 24.0;
      float ty = (v * 2.0 - 1.0) * uFan[k].w;
      float lobe0 = 1.0 - abs(v * 2.0 - 1.0), wgt0 = 0.33 + 1.87 * pow(lobe0, 1.8);
      float rayLen = length(vec3(tan(a), ty, 1.0));
      float hit = sampleDist(k, vec2(u, v), rayLen);
      // the bottom is not a smooth surface: a static roughness of ±8 cm along the fan and a per-ping wobble of ±20 cm
      // (the burst's leading edge moves 2.5 in between pings, median; ours moved 0.8),
      // so the leading edge is slightly irregular and breathes from ping to ping (the recording's edge does)
      hit += (vnoise(vec2(aWorld * r * 0.7 + 2.0, 3.0)) - 0.5) * 0.16 + (vnoise(vec2(aWorld * r * 2.5 + png * 0.6, png * 0.37 + 9.0)) - 0.5) * 0.26
           + (vnoise(vec2(aWorld * r * 9.0 + png * 1.7, png * 0.53 + 4.0)) - 0.5) * 0.2;
      float dr = r - hit;
      float tag = sampleTag(k, vec2(u, v));
      float structure = step(0.25, tag), steel = step(0.62, tag), wood = step(0.55, tag) * (1.0 - steel); // 0.5 timber/rock · 0.6 wood · 0.75 steel
      float hitS = sampleDist(k, vec2(u, v), rayLen); hit = mix(hit, hitS, structure); dr = r - hit; // structure keeps its exact hit
      // timber and rock faces are sharp (real pulse ≈ 0.1 m) and solid; the bottom band is wider with a tail.
      // Steel (wrecks) is by far the strongest reflector: after the log compression its pulse skirts and the
      // ringing inside the hull stay bright, so the app draws a wreck as thick glowing bands with long tails,
      // not a line drawing (Jason 2026-09-25: 结构物的成像不对劲; PL Forward wreck recording, same depth and scale:
      // reference/engine-compare/wreck-compare-*.png)
      // timber and rock: a solid pulse ~0.3 m long (was 0.08 m — a line drawing), with some orange smear behind the
      // face; steel keeps its wide bands and long tails (#63)
      float sg = mix(sigma, mix((0.15 + 0.006 * r) * (1.0 + 1.0 * smoothstep(6.0, 30.0, r)), sigma, steel), structure);
      // the bottom's pulse: a sharp onset (the burst's band rises over 0.5 ft) and a softer back; structure is painted by the echo splat below
      float pulse = exp(-dr * dr / (sg * sg * (dr < 0.0 ? 0.2 : 1.0))) * (1.0 - structure);
      float tail = dr > 0.0 ? (0.55 + 0.65 * steel) * exp(-dr / (tailLen * (1.0 + 0.5 * steel))) * (1.0 - structure + steel) : 0.0; // the bottom's tail; steel keeps a long tail (#63)
      // the far side of what this row hit (back-face strip): a hull's thickness, a trunk's diameter. No far face found
      // (an open mesh, the lakebed lockup) → wood 2.5 m, timber 0.4 m
      float hit2 = sampleDistB(k, vec2(u, v), rayLen);
      float th = (hit2 > 1e8) ? mix(0.4, 2.5, wood) : clamp(hit2 - hit, 0.15, 6.0);
      // the body between the faces (Jason 2026-10-23: 石头太透明 … 从中间更亮往边上散发; 树和船都很透明): rock and timber are solid —
      // brightest just inside the near face, fading toward the far one; a wooden hull is lit through a little weaker;
      // steel reads solid too (its walls ring). This fills what the surface splat leaves hollow.
      float insideB = step(0.0, dr) * (1.0 - step(th, dr));
      solidAcc += wgt0 * insideB * structure * mix(1.0, 0.6, wood) * exp(-dr / max(0.5 * th, 0.15)) * (0.65 + 0.5 * grainS);

      float second = 0.045 * exp(-(r - 2.0 * hit) * (r - 2.0 * hit) / (2.5 * sigma * sigma)); // the second echo under the bottom: small and faint (Jason 2026-10-23)
      float lobe = 1.0 - abs(v * 2.0 - 1.0);
      float wgt = 0.33 + 1.87 * pow(lobe, 1.8); // the main lobe across the slab (same mean as the old triangle)
      // the acoustic shadow starts behind the FAR face and fades over a few metres; a wooden hull hardly shades the bottom
      // under it (the recording's bottom runs lit under the hull), timber and rock shade hard
      float body = 0.0; // (structure is painted by the splat)
      wsum += wgt; wblk += wgt * structure * mix(1.0, 0.3, wood) * smoothstep(th + 0.15, th + 0.6, dr) * exp(-max(dr - th - 0.6, 0.0) / 1.8);
      acc += (1.3 * uTune.x * pulse + uTune.y * tail + body + second) * wgt; // the band's profile measured on the burst: peak 0.5 ft under the edge, 75 % width 1.1 ft, 15 % width 2.7 ft, orange body
      peak = max(peak, pulse * (1.0 - structure));
      edge = max(edge, exp(-dr * dr / (0.16 * sg * sg)) * (1.0 - structure)); // the first return: a thin hot line
      // (spk: the structure echo comes from the splat after the loop)

    }
    float shade = pow(1.0 - 0.7 * wblk / max(wsum, 1e-3), 1.6); // a notch behind structure, not a black hole (the recordings' side views barely shade a flat bottom)
    // structure from the echo splat: every surface the fan sees at this angle and range, all faces, both sides — the real
    // picture of a wooden hull is its whole section (deck line, planking, ribs, far side). A 0.3 m pulse along the
    // range (5 taps), the per-ping grain on top. Steel sums brighter (its amp in lakeMaterial) and keeps its row tail.
    float rn = r / uFanR[k], dRn = 0.06 / uFanR[k]; // ±0.12 m along the range: the recording's range cells are sharp (Jason: 树的清晰度再提升一点)
    float es = 0.0;
    for (int i = -2; i <= 2; i++) es += exp(-0.9 * float(i * i)) * sampleEcho(k, u, rn + float(i) * dRn);
    es /= 1.87;
    float body = clamp(solidAcc / max(wsum, 1e-3), 0.0, 1.0);
    spk = (1.0 - exp(-(es + 0.25 * body) * 9.0)) * 0.95 * (0.55 + 0.6 * grainS); // surfaces (splat) + the solid body between them, soft knee
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
    float accI = acc / 16.0, K = mix(3.0, 2.5, max(capR, capD)); // 0.8 → 2.5 (2026-10-23): the measured band peaks at LUT 0.62 (yellow-orange), ours sat at 0.42 // was 0.4: it held the band body at dark red; the 2.0.0 PL Down recording shows an orange body (2026-10-23) // (4–10 m on range tried: the Mini's calibrated shelf lost its hot edge, 6 → 0.3 % white)
    accI = K * (1.0 - exp(-accI / K));
    // no separate hot line at the first return any more: both the per-row peak and the edge line were a max over the 24 rows,
    // which spread the band into a 2.4 ft plateau (switching them off reproduced the burst's profile: 75 % width 1.1 ft, a tail to 2.7 ft)
    acc = (uTune.w * accI + uTune.z * 0.1 * edge * (0.55 + 0.6 * filament)) * shade + spk; // structure (the splat) is not shaded by its own shadow
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
    float sMix = clamp(spk * 2.5, 0.0, 1.0); // structure carries its own grain (above), not the radial streaks of the water and the bottom
    float e = max(acc * atten * mix(tex, 1.0, sMix) * tvg, fishEcho(p, k) * mix(1.4, 1.0, smoothstep(8.0, 16.0, r)));
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
    // gain raises the picture (it used to lower it — the window's floor rose with uGain); 0.40 reproduces the look the old
    // 0.57 gave, so the page's default label now reads like the app's recordings (40 %), 2026-10-23
    float lo = (1.0 - width) * 0.5 + width * (0.47 - uGain) + 0.5 * width * uContrast;
    float hi = lo + width * (1.0 - 0.45 * uContrast) * (uFlat > 0.5 ? 1.0 : 1.15);
    float idx = echo > 0.0005 ? clamp((lv - lo) / (hi - lo), 0.0, 1.0) : 0.0;
    return pow(idx, uGamma);
  }
  vec3 lut2(float idx) { return texture2D(uLUT2, vec2(idx * (255.0 / 256.0) + 0.5 / 256.0, 0.5)).rgb; }
  // the flasher dial (the Mini's Ice Fishing views): depth runs clockwise from the top round a white ring; the
  // returns paint the ring in the app's jet colours; the pale centre disc carries the DOM depth readout
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
    vec3 col = mix(ring, lut2(idx), on * (0.75 + 0.25 * across));
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

  // ---- small scatterers in the water column (#123) ----
  // Bait, plankton and debris: the app's water carries short dim dashes on ~4 % of it (plm-forward-fish-a/c.jpg: ≈ 0.8°
  // across × 5 cm along the ray, peak LUT ≈ 0.55, 1–2 per m², mostly in the upper few metres), LiveScope's too; the
  // engine's water was empty. One possible scatterer per 0.55 m cell of the fan plane (world x × depth, so they stay put
  // when the boat turns the picture), drawn with the fish marks' beam spread but smaller and dimmer, a few blinking out
  // each ping; only in water (above the bottom under them), thinner with depth.
  float waterSpecks(vec2 p, float r) {
    vec2 w = vec2(uApexXZ.x + p.x, uApexDepth + p.y);            // world x, depth below the surface (m)
    if (w.y > terrainDepth(vec2(w.x, uApexXZ.y)) - 0.25) return 0.0;
    vec2 rh = p / max(r, 0.3);
    float st = 0.8 * uBeamHalf * r + 0.012, sr = 0.5 * uPulse;
    float ping = fract(floor(uTime * 8.0) * 0.0731) * 113.0;
    const float CELL = 0.55;
    vec2 c0 = floor(w / CELL);
    float e = 0.0;
    for (int i = -1; i <= 1; i++) {
      for (int j = -1; j <= 1; j++) {
        vec2 c = c0 + vec2(float(i), float(j));
        float h = hash(c * 1.37 + 0.71);
        float dens = 0.04 + 0.17 * (1.0 - smoothstep(2.5, 9.0, c.y * CELL)); // 60 % of #129's density (Jason 2026-10-23: 星星点点的噪声稍微减掉一点)
        if (h > dens) continue;
        vec2 sp = (c + vec2(hash(c + 3.1), hash(c + 7.7))) * CELL;
        vec2 q = vec2(sp.x - uApexXZ.x, sp.y - uApexDepth) - p;   // screen metres, pixel → speck
        float qr = dot(q, rh), qt = q.x * rh.y - q.y * rh.x;
        float d2 = qr * qr / (sr * sr) + qt * qt / (st * st);
        if (d2 > 6.0) continue;
        float on = step(0.3, hash(c + ping));                     // ~70 % of pings
        float amp = (0.16 + 0.2 * hash(c + 11.3) * hash(c + 5.9)) * (1.15 - 0.5 * uNoise);
        e = max(e, amp * on * exp(-1.5 * d2));
      }
    }
    return e * (1.0 - 0.3 * min(r / uRange, 1.0));
  }
  void main() {
    vec2 vUv = vUv0;
    // ---- the 2D history pass (Ice Fishing View): shift the record one column left, draw the newest ping at the right edge
    if (uHistPass > 0.5) {
      float W = 384.0;
      // uHistFill: the first time the view opens, every column is written at once as a plausible recent record (the
      // angler has sat on this hole a while): the same bottom with per-ping speckle and a hair of depth wobble, so the
      // panel is never empty for its first 48 s (2026-10-17)
      bool fill = uHistFill > 0.5;
      if (!fill && vUv.x < 1.0 - 1.0 / W) { gl_FragColor = texture2D(uHistPrev, vUv + vec2(1.0 / W, 0.0)); return; }
      float col = fill ? floor(vUv.x * W) : 0.0, cell = floor(vUv.y * 256.0);
      float wob = fill ? 0.04 * sin(col * 0.05) + 0.025 * sin(col * 0.17 + 1.3) : 0.0;
      float depth = (1.0 - vUv.y) * uRange + wob;
      float n = hash(vec2(fill ? col * 1.37 + 11.0 : floor(uTime * 8.0), cell));
      float floorN = max(0.0, 0.06 + 0.16 * n - 0.22 * uNoise) * 0.7 * (uFanCount > 0 ? 1.0 : 0.0) * uSignal; // no signal: the record scrolls a dark gap
      float e = flasherEcho(depth) * (fill ? 0.82 + 0.36 * hash(vec2(col * 0.71, cell + 5.0)) : 1.0);
      gl_FragColor = vec4(toneIdx(max(e, floorN)), 0.0, 0.0, 1.0); return;
    }
    // ---- the ice views: the flasher on the left, the Live Down fan or the 2D history on the right
    if (uIce > 0.5) {
      if (vUv.x < uIceSplit) { gl_FragColor = vec4(flasherPixel(vUv), 1.0); return; }
      if (vUv.x < uIceSplit + 0.006) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
      vUv.x = (vUv.x - uIceSplit - 0.006) / (1.0 - uIceSplit - 0.006);
      if (uIce > 1.5) {
        if (vUv.x > 0.965) { gl_FragColor = vec4(lut2(vUv.y), 1.0); return; } // the colour bar at the edge
        gl_FragColor = vec4(lut2(texture2D(uHist, vec2(vUv.x / 0.965, vUv.y)).r), 1.0); return;
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
    float echo = 0.0, inAny = 0.0;
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
      float streak = vnoise(vec2(aWorld * 220.0, r * 2.5 + t * 0.37)); // fibres along the ray: ~2 in across, ~0.4 m long (the burst's band is fibrous, feathered on top)
      float mottle = vnoise(p * 9.0 + t * 0.5) * 0.7 + vnoise(p * 23.0 - t * 0.3) * 0.5;
      float grain = hash(floor(vec2(aWorld * 600.0, r * 6.0)) + t);
      float tex = uStreak > 0.5 ? 0.4 + 0.6 * streak + 0.9 * grain * grain * grain : 0.35 + 0.9 * mottle + 0.2 * grain; // grain³: rare white points on a yellow-orange band (real: 2 % white, 21 % yellow)
      float fil = vnoise(vec2(aWorld * 420.0, r * 9.0 + t * 0.13));
      float fil2 = vnoise(vec2(aWorld * 900.0 + 7.0, r * 18.0 - t * 0.1));
      float filament = 0.35 + 0.75 * fil + 0.35 * fil2 * fil;
      float floorTex = uStreak > 0.5 ? 0.05 + 0.06 * rays + 0.04 * streak : 0.04 + 0.12 * mottle; // halved 2026-10-23: the 2.0.0 recordings' field is black at noise reject 25
      floorTex = max(0.0, floorTex - 0.22 * uNoise) * (1.0 - 0.35 * min(r / uRange, 1.0));
      int kFrom = 0, kTo = uFanCount;
      if (uSplit > 0.5) { kFrom = panel == 0 ? 1 : 0; kTo = kFrom + 1; }
      for (int k = 0; k < ${MAX_FANS}; k++) {
        if (k < kFrom || k >= kTo) continue;
        float inF;
        float e = fanEcho(k, p, r, aWorld, tex, filament, inF);
        inAny = max(inAny, inF);
        echo = max(echo, e);
      }
      float near = 1.0 - smoothstep(0.0, 2.4, r);
      echo = max(echo, inAny * near * near * (0.25 + 0.6 * rays) * tex * 0.5);
      echo = max(echo, inAny * floorTex * 0.7);
      echo = max(echo, inAny * waterSpecks(p, r));
    }
    // the signal gate: the fan keeps its shape but carries no returns (LUT index 0) while the Mini is out of the water,
    // and the picture comes back through the tone window as the signal ramps up (the bottom, the strongest echo, first)
    echo *= uSignal;

    if (uDebug > 0.5) { float d = texture2D(uDepth0, vUv).r; gl_FragColor = vec4(vec3(d >= 0.9999 ? 0.0 : 1.0 - linearize(d) / 60.0), 1.0); return; }
    float idx = toneIdx(echo) * inAny;
    // the ice views draw their Live Down panel in the same jet map as the dial (the app's ice views, home-plm-row.jpg);
    // ?icelut=amber keeps the Lab's amber there instead (for Jason to compare)
    vec3 col = (uIce > 0.5 && uIceAmber < 0.5) ? lut2(idx) : texture2D(uLUT, vec2(idx * (255.0 / 256.0) + 0.5 / 256.0, 0.5)).rgb;
    col *= inAny;
    gl_FragColor = vec4(col, 1.0);
  }
`
