// Phase 4 — the app-style sonar screen, computed from what the beam actually
// hits in the 3D scene. For each beam a "sonar camera" sits at the transducer,
// looks along the fan centre, covers beamDeg horizontally × thickDeg vertically
// and renders a DEPTH strip. The screen shader then asks, for every screen
// pixel (angle a, range r): how many thickness-rows hit at about range r?
// That sum is the echo strength → yellow-mode colour ramp (docs/sonar-style.md).
export const MAX_FANS = 2

export const sonarVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
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
  uniform vec2 uScreenMin;    // metres: (x at the left edge, y at the top edge); apex is at (0,0), y grows downward
  uniform vec2 uScreenSize;   // metres: (width, height) of the screen
  uniform float uTime;
  uniform float uUnitM;       // grid spacing in metres (1 ft or 1 m based)
  uniform float uFlat;        // 1 = panoramic (top-down), 0 = side view
  uniform float uDebug;       // 1 = show the raw depth strip (dev)

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
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

  vec3 ramp(float v) { // yellow mode: black → dark red → orange → yellow → near white
    v = clamp(v, 0.0, 1.0);
    vec3 c0 = vec3(0.0), c1 = vec3(0.19, 0.0, 0.0), c2 = vec3(0.50, 0.06, 0.0), c3 = vec3(0.75, 0.31, 0.0), c4 = vec3(0.88, 0.56, 0.0), c5 = vec3(0.94, 0.75, 0.0), c6 = vec3(1.0, 1.0, 0.88);
    if (v < 0.16) return mix(c0, c1, v / 0.16);
    if (v < 0.33) return mix(c1, c2, (v - 0.16) / 0.17);
    if (v < 0.5)  return mix(c2, c3, (v - 0.33) / 0.17);
    if (v < 0.66) return mix(c3, c4, (v - 0.5) / 0.16);
    if (v < 0.83) return mix(c4, c5, (v - 0.66) / 0.17);
    return mix(c5, c6, (v - 0.83) / 0.17);
  }

  void main() {
    // screen metres: x from -w/2..w/2, y = 0 at the apex (top) growing downward
    // side views: apex at the top, depth grows downward. Panoramic (uFlat): apex at
    // the bottom centre and the fan opens upward, like the app's top-down picture.
    float vy = uFlat > 0.5 ? vUv.y : 1.0 - vUv.y;
    vec2 p = uScreenMin + vec2(vUv.x, vy) * uScreenSize;
    float r = length(p);
    float aWorld = atan(p.x, p.y); // angle from straight-down, +right
    float echo = 0.0;
    float inAny = 0.0;
    for (int k = 0; k < ${MAX_FANS}; k++) {
      if (k >= uFanCount) break;
      float a = aWorld - uFan[k].x;         // angle inside this fan
      if (abs(a) > uFan[k].y || r > uRange) continue;
      inAny = 1.0;
      float u = 0.5 + 0.5 * tan(a) / uFan[k].z; // depth-strip column for this angle
      // integrate across the fan thickness: many jittered rows so a sloping
      // bottom becomes one soft band, not a stack of stripes (Jason 2026-09-24)
      float acc = 0.0, fishHit = 0.0;
      float jit = hash(floor(p * 13.0) + 0.37);
      float sigma = 0.35 + 0.012 * r; // bottom pulse widens with range like a real beam
      float du = 1.5 / 1024.0;         // angular softness for fish: look one column either side
      for (int j = 0; j < 16; j++) {
        float v = (float(j) + jit) / 16.0;
        float ty = (v * 2.0 - 1.0) * uFan[k].w;
        float rayLen = length(vec3(tan(a), ty, 1.0));
        float hit = sampleDist(k, vec2(u, v), rayLen);
        float dr = (r - hit);
        float fish = (k == 0) ? texture2D(uColor0, vec2(u, v)).a : texture2D(uColor1, vec2(u, v)).a;
        float pulse = exp(-dr * dr / (sigma * sigma));
        float tail = (dr > 0.0) ? 0.35 * exp(-dr / 1.6) : 0.0;
        float wgt = 0.55 + 0.9 * (1.0 - abs(v * 2.0 - 1.0));
        acc += (pulse + tail) * wgt * (1.0 - fish);
        // fish: the app draws a mark elongated ALONG THE BEAM (radially), with a bright
        // core and a soft rim — short toward the transducer, longer away from it
        if (fish > 0.5) {
          float sr = dr < 0.0 ? 0.35 : 0.75 + 0.01 * r;
          float blob = exp(-dr * dr / (sr * sr));
          fishHit = max(fishHit, blob);
        }
      }
      acc /= 9.0;
      // fish go near-white at the core (ramp top), with a touch of speckle texture
      float fishEcho = fishHit * (1.15 + 0.25 * hash(floor(p * 9.0) + 1.7));
      // range attenuation + speckle
      float atten = 1.0 - 0.45 * clamp(r / uRange, 0.0, 1.0);
      float sp = 0.75 + 0.5 * hash(floor(p * 7.0) + floor(uTime * 12.0));
      // grazing-angle bottom returns are weak; the app's Panoramic runs at ~70 % gain
      float gain = uFlat > 0.5 ? 3.0 : 1.0;
      echo = max(echo, max(acc * atten * sp * gain, fishEcho * (0.8 + 0.2 * atten)));
    }
    // black water, echoes only — no invented rings/grid (Jason 2026-09-24);
    // the real app chrome is learned later from the app's playback mode
    // surface clutter: a short noisy streak right under the transducer (see sonar-style.md)
    if (uFlat < 0.5 && inAny > 0.5 && r < 2.4) echo = max(echo, (1.0 - r / 2.4) * (0.25 + 0.45 * hash(floor(p * 15.0) + floor(uTime * 10.0))));
    vec3 col = ramp(echo);
    gl_FragColor = vec4(col, 1.0);
  }
`
