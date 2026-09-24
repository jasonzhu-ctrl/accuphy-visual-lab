// Phase 2 placeholder rendering. Everything is in METRES in a side-view lake:
// x = 0 at the left edge, y = 0 at the top, y grows downward. The water
// surface is at uSurfaceY. The transducer (fan apex) sits on the surface at
// x = uDeviceX. Inside the fan the realistic scene is replaced by a crude
// "sonar" look (black + yellow returns) — the real engine comes in Phase 3.

export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

export const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform vec2  uResolution;  // drawing-buffer size in pixels
  uniform vec2  uSceneSize;   // metres (width, height) of the visible scene
  uniform float uSurfaceY;    // metres from top
  uniform float uDeviceX;     // metres from left
  uniform float uTime;
  // up to two fans: (startDeg, endDeg) measured from straight-down, +forward
  uniform vec2  uFanA;
  uniform vec2  uFanB;
  uniform float uFanCount;
  uniform float uRange;       // display range in metres (fan radius)
  uniform float uShowScene;   // 1 = realistic scene visible outside fan

  #define PI 3.14159265

  // ---------- placeholder lake ----------
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }

  // lakebed depth (metres below surface) as a function of x (metres)
  float bedDepth(float x) {
    float w = uSceneSize.x;
    float t = x / w;
    float base = 30.0 + 11.0 * sin(t * 3.1) + 5.0 * sin(t * 9.7 + 1.3) + 2.0 * noise(vec2(x * 0.25, 0.0));
    // shallow shore on the left
    base = mix(2.0, base, smoothstep(0.0, 0.22, t));
    return base;
  }

  // wreck: a box sitting on the bed around x = 62% of the scene
  float wreckMask(vec2 p) {
    float cx = uSceneSize.x * 0.62;
    float bed = uSurfaceY + bedDepth(cx);
    vec2 d = abs(p - vec2(cx, bed - 3.0)) - vec2(7.0, 3.0);
    return 1.0 - smoothstep(0.0, 0.3, max(d.x, d.y));
  }
  // rock pile around x = 35%
  float rockMask(vec2 p) {
    float cx = uSceneSize.x * 0.35;
    float bed = uSurfaceY + bedDepth(cx);
    float r = length((p - vec2(cx, bed - 1.5)) * vec2(0.6, 1.0)) - 3.5;
    return 1.0 - smoothstep(0.0, 0.3, r);
  }
  // weed strands between 45% and 55%
  float weedMask(vec2 p) {
    float t = p.x / uSceneSize.x;
    if (t < 0.44 || t > 0.56) return 0.0;
    float bed = uSurfaceY + bedDepth(p.x);
    float h = 4.0 + 3.0 * noise(vec2(p.x * 0.8, 2.0));
    float strand = smoothstep(0.35, 0.0, abs(fract(p.x * 1.6) - 0.5)); // thin columns
    float sway = 0.15 * sin(uTime * 1.5 + p.x * 2.0) * (bed - p.y);
    float inside = step(bed - h, p.y + sway) * step(p.y, bed + 0.2);
    return strand * inside;
  }

  vec3 sceneColor(vec2 p) {
    float bed = uSurfaceY + bedDepth(p.x);
    if (p.y < uSurfaceY) {
      // sky + far shore
      vec3 sky = mix(vec3(0.55, 0.75, 0.95), vec3(0.85, 0.92, 1.0), p.y / uSurfaceY);
      float hills = uSurfaceY - (2.0 + 4.0 * noise(vec2(p.x * 0.08, 5.0)) + 2.0 * noise(vec2(p.x * 0.3, 9.0)));
      vec3 land = vec3(0.25, 0.42, 0.28);
      return mix(sky, land, step(hills, p.y));
    }
    float depth = p.y - uSurfaceY;
    vec3 water = mix(vec3(0.10, 0.45, 0.60), vec3(0.02, 0.08, 0.16), clamp(depth / 45.0, 0.0, 1.0));
    vec3 sand = vec3(0.45, 0.40, 0.28) * (0.8 + 0.2 * noise(p * 1.5));
    vec3 c = mix(water, sand, step(bed, p.y));
    c = mix(c, vec3(0.35, 0.25, 0.15), wreckMask(p));
    c = mix(c, vec3(0.35, 0.35, 0.33), rockMask(p));
    c = mix(c, vec3(0.15, 0.40, 0.18), weedMask(p) * 0.9);
    // surface highlight
    c += vec3(0.6, 0.8, 1.0) * (1.0 - smoothstep(0.0, 0.35, depth)) * 0.35;
    return c;
  }

  // ---------- fan test ----------
  // angle from straight-down in degrees, +forward(right). p relative to apex.
  float fanAngleDeg(vec2 rel) { return degrees(atan(rel.x, rel.y)); }
  float inFan(vec2 rel, vec2 fan) {
    if (rel.y < 0.0 && abs(rel.x) < 0.001) return 0.0;
    float a = fanAngleDeg(rel);
    float r = length(rel);
    float ang = step(fan.x, a) * step(a, fan.y);
    float rad = 1.0 - smoothstep(uRange - 0.6, uRange, r);
    return ang * rad;
  }

  // crude "sonar look" for Phase 2 (real engine in Phase 3):
  // yellow returns on black where there is bed / structure, faint range rings.
  vec3 sonarColor(vec2 p, vec2 rel) {
    float bed = uSurfaceY + bedDepth(p.x);
    float r = length(rel);
    float atten = exp(-r / (uRange * 1.2));
    float hit = 0.0;
    hit = max(hit, (1.0 - smoothstep(0.0, 1.2, abs(p.y - bed))) * 1.0);           // bed line
    hit = max(hit, wreckMask(p) * 0.9);
    hit = max(hit, rockMask(p) * 0.8);
    hit = max(hit, weedMask(p) * 0.7);
    hit *= 0.75 + 0.25 * noise(vec2(r * 6.0, fanAngleDeg(rel) * 0.5 + uTime * 3.0)); // speckle
    hit *= atten;
    vec3 ramp = mix(vec3(0.0), vec3(0.85, 0.32, 0.0), smoothstep(0.0, 0.5, hit));
    ramp = mix(ramp, vec3(1.0, 0.85, 0.35), smoothstep(0.5, 1.0, hit));
    // range rings every 5 m, very faint
    float ring = 1.0 - smoothstep(0.0, 0.12, abs(fract(r / 5.0 + 0.5) - 0.5) * 5.0);
    ramp += vec3(0.25, 0.25, 0.3) * ring * 0.25;
    return ramp;
  }

  void main() {
    // use the real pixel position, not the interpolated uv: independent of
    // camera / viewport state, so it cannot drift when the canvas is resized
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 p = vec2(uv.x, 1.0 - uv.y) * uSceneSize;     // metres, y down
    vec2 apex = vec2(uDeviceX, uSurfaceY);
    vec2 rel = p - apex;                               // y down = +depth
    rel.y = max(rel.y, 0.0);

    float fan = inFan(rel, uFanA);
    if (uFanCount > 1.5) fan = max(fan, inFan(rel, uFanB));
    if (p.y < uSurfaceY) fan = 0.0;

    vec3 scene = sceneColor(p);
    vec3 sonar = sonarColor(p, rel);
    // fan edge glow
    float edge = 0.0;
    if (fan > 0.0) {
      float a = fanAngleDeg(rel);
      float dA = min(abs(a - uFanA.x), abs(a - uFanA.y));
      if (uFanCount > 1.5) dA = min(dA, min(abs(a - uFanB.x), abs(a - uFanB.y)));
      edge = 1.0 - smoothstep(0.0, 1.2, dA);
    }
    vec3 outside = mix(vec3(0.0), scene, uShowScene);
    vec3 c = mix(outside, sonar, fan);
    c += vec3(1.0, 0.85, 0.4) * edge * 0.35 * fan;
    gl_FragColor = vec4(c, 1.0);
  }
`
