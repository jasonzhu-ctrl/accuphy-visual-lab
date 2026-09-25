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
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, aW); }
`

export const sonarFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uDepth0; uniform sampler2D uDepth1;
  uniform sampler2D uColor0; uniform sampler2D uColor1; // .a = tag: 0.5 structure, 0 bottom
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
      s = max(s, 0.85 * (1.0 - smoothstep(0.55, 1.3, d)));
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
  float panoLobe(float g) { return smoothstep(0.01, 0.07, g) * (1.0 - 0.55 * smoothstep(0.52, 1.13, g)); }

  void main() {
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
        // structure seen through the beam: coverage over the beam footprint (soft, fuzzy clumps, not line drawings)
        float rb = max(0.3, r * 0.025);
        float S = topDepth(p), cov = 0.0;
        for (int q = 0; q < 8; q++) {
          float ang = float(q) * 0.7854 + 0.4;
          float Sq = topDepth(p + rb * vec2(cos(ang), sin(ang)));
          cov += step(Sq, Db - 0.08);
          S = min(S, Sq);
        }
        cov = (cov + step(topDepth(p), Db - 0.08) * 2.0) / 10.0;
        bool hasS = cov > 0.05;
        float target = (hasS ? S : Db) - uApexDepth; // depth below the transducer of what this pixel sees
        float lobe = panoLobe(atan(target, r));
        // acoustic shadow: march back toward the transducer; anything (terrain, structure) above the ray blocks it
        float jit = hash(floor(gl_FragCoord.xy / 3.0) * 0.61 + t * 0.13);    // 3-px cells: blotchy, not hairy
        float shade = 0.0;
        for (int s = 0; s < 40; s++) {
          float tt = r * (float(s) + jit) / 40.0;
          if (tt < 0.4 || tt > r - 0.45) continue;
          vec2 pt = p * (tt / r);
          float occ = min(terrainDepth(uApexXZ + vec2(pt.y, pt.x)), topDepth(pt)) - uApexDepth;
          float line = target * tt / r;
          shade = max(shade, smoothstep(0.1, 0.5, line - occ));
        }
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
        float m = 0.84 + 0.22 * patchesN + 0.08 * (streakP - 0.5) + 0.2 * (grainP - 0.5) + 0.05 * (speck - 0.5) + 0.06 * (beamGain - 0.5) + (0.24 + 0.2 * smoothstep(15.0, 50.0, uRange)) * (bands - 0.5);  // bands show more at long range (app 62 m frame)
        float e = 0.126 * m * incid * mix(0.86, 1.0, lobe);
        if (hasS) {
          // structure: the edge rising toward the transducer is hot, the rest a mid-bright granular clump
          float Sn = min(topDepth(p - (p / r) * 0.35), terrainDepth(w - rw * 0.35));
          float face = clamp((Sn - S) / 0.35, 0.0, 3.0);
          float es = (0.17 + 0.14 * face) * (0.7 + 0.45 * grainP) * mix(0.75, 1.0, lobe);
          e = mix(e, max(e, es), smoothstep(0.05, 0.6, cov));
        }
        e *= (1.0 - 0.3 * shade) * (1.0 - 0.28 * fishShadow(p));
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
        float a = aWorld - uFan[k].x;
        if (abs(a) > uFan[k].y || r > uReach) continue;
        inAny = 1.0;
        float u = 0.5 + 0.5 * tan(a) / uFan[k].z;
        float acc = 0.0, peak = 0.0, spk = 0.0;
        float jit = hash(gl_FragCoord.xy * 0.37 + 0.11);
        float sigma = 0.22 + 0.010 * r;
        float tailLen = 0.35 + 0.015 * r;
        for (int j = 0; j < 24; j++) {
          float v = (float(j) + jit) / 24.0;
          float ty = (v * 2.0 - 1.0) * uFan[k].w;
          float hit = sampleDist(k, vec2(u, v), length(vec3(tan(a), ty, 1.0)));
          float dr = r - hit;
          float structure = step(0.25, sampleTag(k, vec2(u, v)));
          // structure faces are sharp (real pulse ≈ 0.1 m) and solid; the bottom band is wider with a tail
          float sg = mix(sigma, 0.08 + 0.004 * r, structure);
          float pulse = exp(-dr * dr / (sg * sg)) * (1.0 - 0.22 * structure) * mix(1.0, 0.85 + 0.25 * filament, structure);
          float tail = dr > 0.0 ? 0.6 * exp(-dr / tailLen) : 0.0;
          float second = 0.10 * exp(-(r - 2.0 * hit) * (r - 2.0 * hit) / (4.0 * sigma * sigma));
          float wgt = 0.55 + 0.9 * (1.0 - abs(v * 2.0 - 1.0));
          acc += (1.2 * pulse + tail + second) * wgt;
          peak = max(peak, pulse * (1.0 - structure));
          spk = max(spk, pulse * structure);
        }
        acc = acc / 16.0 + 0.7 * peak + 0.9 * spk;
        float atten = 1.0 - 0.4 * clamp(r / uRange, 0.0, 1.0);
        echo = max(echo, max(acc * atten * tex, fishEcho(p, k)));
        echo = max(echo, logoEcho(p, k) * atten * (0.7 + 0.55 * (filament - 0.8)) * (0.72 + 0.28 * tex));
      }
      float near = 1.0 - smoothstep(0.0, 2.4, r);
      echo = max(echo, inAny * near * near * (0.25 + 0.6 * rays) * tex * 0.5);
      echo = max(echo, inAny * floorTex * 0.7);
    }

    if (uDebug > 0.5) { float d = texture2D(uDepth0, vUv).r; gl_FragColor = vec4(vec3(d >= 0.9999 ? 0.0 : 1.0 - linearize(d) / 60.0), 1.0); return; }
    // the app's tone curve (assets/aio_shader.glsl): log compression → gain / dynamic-range window → LUT
    float raw = echo * 65535.0;
    float bs = 4000.0;
    float lv = log(1.0 + raw / bs) / log(1.0 + 65535.0 / bs);
    float width = clamp(uDynRange, 0.05, 1.0);
    float lo = (1.0 - width) * 0.5 + width * (uGain - 0.5) + 0.5 * width * uContrast;
    float hi = lo + width * (1.0 - 0.45 * uContrast);
    float idx = echo > 0.0005 ? clamp((lv - lo) / (hi - lo), 0.0, 1.0) : 0.0;
    idx = pow(idx, uGamma) * inAny;
    vec3 col = texture2D(uLUT, vec2(idx * (255.0 / 256.0) + 0.5 / 256.0, 0.5)).rgb;
    col *= inAny;
    gl_FragColor = vec4(col, 1.0);
  }
`
