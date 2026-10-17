// The frozen lake surface, one shader (like the summer water): wind-blown snow drifts over black ice, pressure
// cracks and bubble veins where the ice is bare, the auger holes (live, with slush and shavings; old ones frozen
// over), and the window — the beam's reach, seen from above through the ice, where the snow turns to glass so the
// lit lakebed shows (decision #55: wherever the device goes, whatever its beam reaches lights up; the rest stays as
// it was). Lighting is its own (sun / sky / the shelter lamp); the time-of-day presets feed the uniforms (iceScene.js).
import * as THREE from 'three'
import { MAX_BEAMS } from './lakeMaterial'
import { MAX_HOLES, WIND } from './iceScene'

// ---- GLSL shared with other ice shaders (the slab face in IceCamp.jsx imports these, so its snow cap and the sheet's
//      snow cannot drift apart). Plain strings, no backticks inside. ----
// value noise on a hashed lattice
export const NOISE_GLSL = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float hashL(vec2 i) { return hash(i); }
  float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hashL(i), hashL(i + vec2(1, 0)), f.x), mix(hashL(i + vec2(0, 1)), hashL(i + vec2(1, 1)), f.x), f.y); }
  float fbm3(vec2 p) { return 0.5 * vnoise(p) + 0.25 * vnoise(p * 2.1 + 1.3) + 0.125 * vnoise(p * 4.3 + 2.7); }
  float fbm4(vec2 p) { return fbm3(p) + 0.0625 * vnoise(p * 8.9 + 5.1); }
`
// The snow on the ice (needs NOISE_GLSL first), as a mask and as a depth (metres). x = the opaque core, y = the thin
// dusting round it, z = the blown-snow strokes along the wind; open clears a soft stretch round the hole cutC (the
// angler set up on bare ice). wind = the unit wind direction, cover = how much the drifts bury (LOOKS).
export const SNOW_GLSL = /* glsl */ `
  vec3 iceSnowParts(vec2 P, vec2 wind, float cover, vec2 cutC) {
    vec2 Pw = vec2(dot(P, wind), dot(P, vec2(-wind.y, wind.x)));
    float big = fbm4(P * 0.035 + 3.0), sast = fbm3(vec2(Pw.x * 0.07, Pw.y * 0.6) + 7.0);
    float h = 0.82 * (0.55 * big + 0.45 * sast) + 0.18 * fbm3(P * 0.8 + 1.7);
    float thr = mix(0.62, 0.30, cover);
    float hh = h + 0.02 * (vnoise(P * 2.3 + 9.0) - 0.5);
    float core = smoothstep(thr - 0.012, thr + 0.012, hh);
    float skirt = smoothstep(thr - 0.09, thr - 0.005, hh);
    float streakN = fbm3(vec2(Pw.x * 0.05, Pw.y * 0.7) + 2.0);
    float streaks = smoothstep(0.645, 0.665, streakN + 0.03 * (vnoise(P * 3.0) - 0.5));
    float open = 1.0 - smoothstep(9.0, 16.0, distance(P, cutC) + 3.0 * (fbm3(P * 0.11 + 5.0) - 0.5));
    return vec3(core, skirt, streaks) * (1.0 - 0.9 * open);
  }
  // how thick the snow lies: a wind-swept big lake (Lake Winnipeg: strong winds keep the snow thin and even) — low
  // drifts of a few cm, a dusting, strokes, not dunes (decision #106), with a fine wind-rippled crust; nothing within
  // the scooped ring round the live hole
  float iceSnowDepth(vec2 P, vec3 sp, vec2 cutC) {
    float hole = 1.0 - smoothstep(2.4, 3.4, distance(P, cutC));
    float d = sp.x * (0.06 + 0.03 * fbm3(P * 0.9 + 4.0)) + sp.y * 0.01 + sp.z * 0.025;
    d += (fbm3(P * 2.6 + 1.0) - 0.5) * 0.012 * max(max(sp.x, sp.y), sp.z);
    return max(d, 0.0) * (1.0 - hole);
  }
  // the coverage the eye gets: the core, the dusting at 40 %, the strokes
  float iceSnowMask(vec3 sp) { return max(max(sp.x, 0.4 * sp.y), sp.z); }
`

export function makeIceMaterial(terrain) {
  const uniforms = {
    uTime: { value: 0 },
    uSun: { value: new THREE.Vector3(-0.62, 0.22, -0.35).normalize() }, uSunColor: { value: new THREE.Color('#ffb48c') }, uSunI: { value: 0.75 },
    uSkyZenith: { value: new THREE.Color('#17213a') }, uSkyHorizon: { value: new THREE.Color('#6b6f8e') }, uAmbient: { value: 0.85 },
    uFogColor: { value: new THREE.Color('#3b4a66') }, uFogDensity: { value: 0.0038 },
    uWater: { value: new THREE.Color('#0a2630') },
    uCover: { value: 0.78 }, uClear: { value: 0.55 }, uWindow: { value: 1 },
    uHoles: { value: Array.from({ length: MAX_HOLES }, () => new THREE.Vector4(1e4, 1e4, 0.3, 0)) }, uHoleCount: { value: 0 },
    uBeamOn: { value: 1 },
    uLamp: { value: new THREE.Vector4(0, 0, 0, 0) }, uLampColor: { value: new THREE.Color('#ffb060') },
    uTerrain: { value: terrain.tex }, uTerrainHalf: { value: terrain.H },
    uWind: { value: WIND.clone() },
    uHighlight: { value: new THREE.Color('#7fe6ff') },
    uGlow: { value: new THREE.Color('#e08a5e') }, uGlowDir: { value: new THREE.Vector3(-0.8, 0, -0.45).normalize() }, // the afterglow, mirrored in the ice
    uClip: { value: new THREE.Vector2(0, 0) }, // section view: x = on, y = world z of the cut wall
    uCenter: { value: new THREE.Vector2(0, 0) }, // where the near (displaced) sheet is centred
    // the cutaway: pool centre, its radius, the island's radius, and up to two beam boxes (xMin, xMax, zHalf, on) from the centre
    uCutOn: { value: 1 }, uCutC: { value: new THREE.Vector2(1e4, 1e4) }, uCutR: { value: 5.5 }, uIsland: { value: 1.9 },
    uCutBox: { value: [new THREE.Vector4(0, 0, 0, 0), new THREE.Vector4(0, 0, 0, 0)] },
    // the beams, exactly as lakeMaterial.js describes them (setBeamUniforms fills these)
    uBeamCount: { value: 0 },
    uApex: { value: [new THREE.Vector3(), new THREE.Vector3()] },
    uC: { value: [new THREE.Vector3(), new THREE.Vector3()] },
    uH: { value: [new THREE.Vector3(), new THREE.Vector3()] },
    uN: { value: [new THREE.Vector3(), new THREE.Vector3()] },
    uAng: { value: [new THREE.Vector4(), new THREE.Vector4()] },
    uRT: { value: [new THREE.Vector2(), new THREE.Vector2()] },
    uBox: { value: [new THREE.Vector4(-1e5, 1e5, 1e5, 1e5), new THREE.Vector4(-1e5, 1e5, 1e5, 1e5)] },
  }
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      attribute float aDisp;
      uniform vec2 uWind; uniform float uCover; uniform vec2 uCutC; uniform vec2 uCenter;
      varying vec3 vWorld;
      ${NOISE_GLSL}
      ${SNOW_GLSL}
      vec3 snowParts(vec2 P) { return iceSnowParts(P, uWind, uCover, uCutC); }
      float snowDepth(vec2 P, vec3 sp) { return iceSnowDepth(P, sp, uCutC); }
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        // real relief (#106): the near sheet (aDisp = 1, 0.5 m mesh) rises by the snow's depth, fading to flat at its edge
        float fade = aDisp * (1.0 - smoothstep(100.0, 116.0, distance(wp.xz, uCenter)));
        if (fade > 0.001) wp.y += snowDepth(wp.xz, snowParts(wp.xz)) * fade;
        vWorld = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      #define MAXH ${MAX_HOLES}
      #define MB ${MAX_BEAMS}
      varying vec3 vWorld;
      uniform float uTime; uniform vec3 uSun; uniform vec3 uSunColor; uniform float uSunI;
      uniform vec3 uSkyZenith; uniform vec3 uSkyHorizon; uniform float uAmbient;
      uniform vec3 uFogColor; uniform float uFogDensity; uniform vec3 uWater;
      uniform float uCover; uniform float uClear; uniform float uWindow;
      uniform vec4 uHoles[MAXH]; uniform int uHoleCount; uniform float uBeamOn;
      uniform vec4 uLamp; uniform vec3 uLampColor;
      uniform sampler2D uTerrain; uniform float uTerrainHalf; uniform vec2 uWind; uniform vec3 uHighlight; uniform vec3 uGlow; uniform vec3 uGlowDir; uniform vec2 uClip;
      uniform float uCutOn; uniform vec2 uCutC; uniform float uCutR; uniform float uIsland; uniform vec4 uCutBox[MB]; uniform vec2 uCenter;
      uniform int uBeamCount;
      uniform vec3 uApex[MB]; uniform vec3 uC[MB]; uniform vec3 uH[MB]; uniform vec3 uN[MB];
      uniform vec4 uAng[MB]; uniform vec2 uRT[MB]; uniform vec4 uBox[MB];

      ${NOISE_GLSL}
      ${SNOW_GLSL}
      // nearest two cell seeds: pressure cracks run along the cell borders
      vec2 voro(vec2 p) {
        vec2 i = floor(p), f = fract(p); float f1 = 8.0, f2 = 8.0;
        for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
          vec2 g = vec2(float(x), float(y)); vec2 o = vec2(hash(i + g), hash(i + g + 19.3));
          vec2 r = g + o - f; float d = dot(r, r);
          if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) { f2 = d; }
        }
        return sqrt(vec2(f1, f2));
      }
      float insideBeam(int k, vec3 p, float margin) {
        vec3 d = p - uApex[k];
        float u = dot(d, uC[k]), v = dot(d, uH[k]), w = dot(d, uN[k]);
        float r = length(vec2(u, v));
        float ang = atan(v, u);
        float soft = 0.03;
        float inA = smoothstep(uAng[k].x - margin - soft, uAng[k].x - margin + soft, ang) * (1.0 - smoothstep(uAng[k].y + margin - soft, uAng[k].y + margin + soft, ang));
        float lim = max(u, 0.0) * uRT[k].y;
        float lo = uAng[k].z * lim - margin * 4.0 * lim, hi = uAng[k].w * lim + margin * 4.0 * lim;
        float sw = max(0.12, 0.05 * lim);
        float inW = smoothstep(lo - sw, lo + sw, w) * (1.0 - smoothstep(hi - sw, hi + sw, w));
        float inR = 1.0 - smoothstep(uRT[k].x - 0.6 + margin * 30.0, uRT[k].x + margin * 30.0, r);
        vec4 bx = uBox[k]; float bm = margin * 30.0;
        inR *= 1.0 - smoothstep(bx.w - 0.3 + bm, bx.w + 0.3 + bm, abs(d.z));
        inR *= smoothstep(bx.x - 0.3 - bm, bx.x + 0.3 - bm, d.x) * (1.0 - smoothstep(bx.y - 0.3 + bm, bx.y + 0.3 + bm, d.x)) * (1.0 - smoothstep(bx.z - 0.3 + bm, bx.z + 0.3 + bm, -d.y));
        float atten = 1.0 - 0.6 * clamp(r / uRT[k].x, 0.0, 1.0);
        return inA * inW * inR * atten;
      }
      float terrainDepth(vec2 w) { return texture2D(uTerrain, (w + uTerrainHalf) / (2.0 * uTerrainHalf)).r; }
      // the sky as the dome draws it (iceSky.js), for the mirror in the ice
      vec3 skyAt(vec3 d) {
        float el = d.y;
        vec3 sk = mix(uSkyHorizon, uSkyZenith, pow(clamp(el * 1.6, 0.0, 1.0), 0.6));
        float az = max(dot(normalize(vec3(d.x, 0.0, d.z)), uGlowDir), 0.0);
        sk = mix(sk, uGlow, pow(az, 5.0) * exp(-max(el, 0.0) * 9.0) * 0.9);
        return el < 0.0 ? mix(uFogColor, uSkyHorizon, exp(el * 40.0)) : sk;
      }
      // Real black ice (reference photos 2026-10-16: Unsplash 'frozen lake ice cracks', Waider's Norwegian lakes): long,
      // nearly straight refrozen cracks tens of metres long, a few bright and wide with a frosty halo, many hairlines, each
      // with its own brightness and breaks — not a honeycomb. One family of such lines: spacing sp, turned by ang.
      // Returns (core, halo).
      vec2 crackFamily(vec2 P, float ang, float sp, float wobble, float seed, float wMin, float wMax) {
        float c = cos(ang), sn = sin(ang);
        vec2 q = vec2(c * P.x - sn * P.y, sn * P.x + c * P.y);
        float k = floor(q.x / sp + seed);
        float jit = (hash(vec2(k, seed)) - 0.5) * sp * 0.5;
        float wander = (vnoise(vec2(q.y * 0.05 + k * 3.1, seed)) - 0.5) * wobble;
        float x0 = (k - seed + 0.5) * sp + jit + wander;
        float tilt = (hash(vec2(k + 41.0, seed)) - 0.5) * 0.5; // ±14°: neighbours drift apart or cross, like real cracks
        float yk = (hash(vec2(k + 53.0, seed)) - 0.5) * 60.0;
        float d = abs((q.x - x0) * cos(tilt) + (q.y - yk) * sin(tilt));
        float present = step(0.3, hash(vec2(k + 7.0, seed)));
        float along = smoothstep(0.28, 0.5, vnoise(vec2(q.y * 0.1, k * 5.3 + seed)));
        float bright = 0.35 + 0.65 * hash(vec2(k + 13.0, seed));
        float w = mix(wMin, wMax, hash(vec2(k + 29.0, seed)));
        float aa = fwidth(q.x) * 1.5;
        float core = 1.0 - smoothstep(w, w + aa + 0.005, d);
        float halo = (1.0 - smoothstep(w, w * 3.0 + 0.25, d)) * 0.4;
        return vec2(core, halo) * present * along * bright;
      }
      // bubbles frozen into the ice: white discs, 3–10 cm, in one cell of seven
      float bubbles(vec2 P) {
        vec2 g = P * 1.6, cell = floor(g), f = fract(g);
        float h = hash(cell);
        if (h < 0.86) return 0.0;
        vec2 o = vec2(hash(cell + 3.1), hash(cell + 7.7)) * 0.6 + 0.2;
        float r = 0.05 + 0.11 * hash(cell + 11.0);
        float d = length(f - o);
        return (1.0 - smoothstep(r * 0.55, r, d)) * (0.45 + 0.55 * hash(cell + 19.0));
      }
      float sdBox(vec2 p, vec2 b, float rr) { vec2 q = abs(p) - b + rr; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - rr; }
      // the pool: a circle round the hole plus the beams' footprints, minus the island (negative inside the pool)
      float cutSDF(vec2 P) {
        vec2 q = P - uCutC;
        float d = length(q) - uCutR;
        for (int k = 0; k < MB; k++) { vec4 b = uCutBox[k]; if (b.w > 0.5) d = min(d, sdBox(q - vec2((b.x + b.y) * 0.5, 0.0), vec2((b.y - b.x) * 0.5, b.z), 1.2)); }
        return max(d, uIsland - length(q));
      }
      vec3 snowParts(vec2 P) { return iceSnowParts(P, uWind, uCover, uCutC); }
      float snowDepth(vec2 P, vec3 sp) { return iceSnowDepth(P, sp, uCutC); }
      void main() {
        vec2 P = vWorld.xz;
        if (uClip.x > 0.5 && P.y > uClip.y) discard; // the section cut
        vec3 V = normalize(cameraPosition - vWorld);
        // ---- the holes ----
        float hole = 0.0, oldHole = 0.0, clear = 0.0, slush = 0.0, chips = 0.0, glow = 0.0;
        for (int i = 0; i < MAXH; i++) {
          if (i >= uHoleCount) break;
          vec4 Hh = uHoles[i];
          float d = distance(P, Hh.xy), r = Hh.z;
          float open = 1.0 - smoothstep(r * 0.9, r * 1.06, d);
          if (Hh.w > 0.75) { // the live hole: snow scooped away round it, shavings, a slush rim, the beam's glow below
            hole = max(hole, open);
            clear = max(clear, 1.0 - smoothstep(r * 3.0, r * 7.0, d));
            slush = max(slush, (1.0 - smoothstep(r * 1.02, r * 1.45, d)) * smoothstep(r * 0.95, r * 1.08, d));
            chips = max(chips, (1.0 - smoothstep(r * 1.3, r * 3.4, d)) * smoothstep(0.52, 0.7, vnoise(P * 22.0 + float(i) * 7.0)));
            glow = max(glow, uBeamOn * exp(-d / (r * 1.3)));
          } else { // an old hole: frozen over, a ring of old slush
            oldHole = max(oldHole, open);
            clear = max(clear, 0.6 * (1.0 - smoothstep(r * 2.4, r * 5.0, d)));
            slush = max(slush, 0.5 * (1.0 - smoothstep(r * 1.02, r * 1.4, d)) * smoothstep(r * 0.95, r * 1.08, d));
          }
        }
        // ---- the window: along the line of sight through this bit of ice, does the eye meet the beam? (the lit
        //      bottom lies far behind the hole from the camera's angle, so a straight-down test cut the window in the
        //      wrong place) — march the view ray down through the water to the bottom
        float beam = 0.0, wide = 0.0;
        vec3 rd = -V;
        if (rd.y < -0.05 && uBeamCount > 0) {
          float tEnd = min(48.0, terrainDepth(P) * 1.25 / -rd.y);
          float jit = hash(gl_FragCoord.xy * 0.37); // per-pixel offset: grain instead of stair-steps at the cone's edge
          for (int j = 0; j < 20; j++) {
            float t = (float(j) + jit) * tEnd / 20.0;
            vec3 q = vWorld + rd * t;
            if (q.y < -terrainDepth(q.xz) - 0.3) break;
            for (int k = 0; k < MB; k++) {
              if (k < uBeamCount) { beam = max(beam, insideBeam(k, q, 0.0)); wide = max(wide, insideBeam(k, q, 0.02)); }
            }
          }
        }
        // Jason 2026-10-16: 水里的声纳coverage的渲染被白色的雪挡住了 — over the beam the snow and the milky ice thin out
        // (decision #55: whatever the beam reaches lights up), so the coverage always shows; bare ice is untouched
        float win = smoothstep(0.04, 0.45, beam) * uWindow * uBeamOn;
        // the angler set up on an open stretch: less snow within ~14 m of the hole (soft, noisy edge), and a gentle
        // thinning over the beam further out — no cone-shaped hole in the snow (#99)
        float openD = distance(P, uCutC);
        float open = 1.0 - smoothstep(9.0, 16.0, openD + 3.0 * (fbm3(P * 0.11 + 5.0) - 0.5));
        float keep = (1.0 - 0.5 * win) * (1.0 - 0.9 * open); // what is left of the snow / milky plates
        float edge = clamp(wide - beam, 0.0, 1.0) * uWindow * uBeamOn;
        // ---- snow over the ice: the mask, the depth and the real slopes (#106) ----
        vec3 sp = snowParts(P);
        float sd = snowDepth(P, sp);
        float snow = iceSnowMask(sp) * (1.0 - clear) * keep;
        // the slopes only where there is snow: N = mix(up, Nsnow, smoothstep(0, 0.3, snow)) is exactly up without it
        vec3 Nsnow = vec3(0.0, 1.0, 0.0);
        if (snow > 0.0) {
          float e = 0.35;
          float sdx = snowDepth(P + vec2(e, 0.0), snowParts(P + vec2(e, 0.0))), sdz = snowDepth(P + vec2(0.0, e), snowParts(P + vec2(0.0, e)));
          Nsnow = normalize(vec3(-(sdx - sd), e, -(sdz - sd)));
        }
        vec2 Pw = vec2(dot(P, uWind), dot(P, vec2(-uWind.y, uWind.x)));
        float streaks = sp.z;
        vec3 N = normalize(mix(vec3(0.0, 1.0, 0.0), Nsnow, smoothstep(0.0, 0.3, snow)));
        float lamb = max(dot(N, uSun), 0.0);
        vec3 sky = mix(uSkyHorizon, uSkyZenith, 0.45);
        vec3 snowAlb = vec3(0.93, 0.95, 0.98);
        vec3 litSnow = snowAlb * (sky * uAmbient * (0.7 + 0.3 * N.y) * 1.35 + uSunColor * uSunI * lamb + 0.03);
        litSnow *= mix(vec3(0.84, 0.9, 1.0), vec3(1.0), smoothstep(0.02, 0.16, sd)); // the thin edges go blue, the ridges white
        float cell = hash(floor(P * 26.0));
        float glint = step(0.986, cell) * (0.5 + 0.5 * sin(uTime * 3.0 + cell * 60.0)) * lamb * uSunI; // facets catching the sun
        litSnow += uSunColor * glint * 1.2;
        // ---- bare ice: a dark mirror of the sky, long white cracks, bubbles, frost, specks ----
        float camD = length(vWorld - cameraPosition);
        // the surface: flat glass with a faint frozen-in undulation, so the sky's mirror is not dead even
        vec3 Nn = normalize(vec3((vnoise(P * 0.23) - 0.5) * 0.05, 1.0, (vnoise(P * 0.23 + 5.0) - 0.5) * 0.05));
        float cosT = max(dot(V, Nn), 0.0);
        float F = 0.02 + 0.98 * pow(1.0 - cosT, 5.0);        // Fresnel: a window straight down, a mirror toward the horizon
        F = 0.045 + F;                                       // and a faint skin of sky everywhere, so the sheet reads as a surface over the dark water (#99)
        float fres = F;
        vec3 reflSky = skyAt(reflect(-V, Nn));
        vec3 Hh = normalize(uSun + V);
        float specSun = pow(max(dot(Nn, Hh), 0.0), 180.0) * uSunI;
        // At this scale (the camera 45 m off, 40 m of lake across the screen) a crack is a hairline a millimetre wide:
        // invisible. What shows from the air is tone — a patchwork of clear black ice and milky refrozen 'snow ice' —
        // the sky's sheen, the snow, and at most a couple of long faint lines where snow has settled in a pressure crack.
        vec2 cA = crackFamily(P, 0.35, 36.0, 2.5, 1.7, 0.012, 0.03);
        vec2 cB = crackFamily(P, 1.9, 52.0, 3.0, 4.3, 0.01, 0.025);
        float core = clamp(cA.x + cB.x, 0.0, 1.0) * 0.5;
        float halo = clamp(cA.y + cB.y, 0.0, 1.0) * 0.6; // the soft white line of snow in the groove is what the eye gets
        float cloud = fbm4(P * 0.045 + 17.0);
        float milky = smoothstep(0.5, 0.64, cloud) * (0.6 + 0.4 * fbm3(P * 0.6 + 2.0)) * keep; // opaque, pale grey-blue plates
        float polish = 0.5 + 0.5 * fbm3(vec2(Pw.x * 0.12, Pw.y * 0.9) + 4.0);          // faint wind polish along the wind
        float nearD = 1.0 - smoothstep(12.0, 32.0, camD);                                 // close-up detail only near the camera
        float bub = bubbles(P) * nearD * 0.5;
        float speck = step(0.994, hash(floor(P * 14.0))) * nearD * 0.4;
        float white = clamp(core + bub + speck, 0.0, 1.0);
        vec3 whiteLit = vec3(0.86, 0.92, 1.0) * (sky * uAmbient * 1.6 + uSunColor * uSunI * 0.5 + 0.1);
        vec3 milkyLit = vec3(0.62, 0.7, 0.8) * (sky * uAmbient * 1.5 + uSunColor * uSunI * 0.45 + 0.06) * (0.85 + 0.3 * polish);
        // the water below is what gives black ice its black; the sky is laid over it by Fresnel
        vec3 Lv = uLamp.xyz - vWorld; float dlm = max(length(Lv), 0.1); vec3 Hl = normalize(Lv / dlm + V);
        float lampF = uLamp.w / (1.0 + dlm * dlm * 0.015);
        float specL = (pow(max(dot(Nn, Hl), 0.0), 320.0) * 3.0 + pow(max(dot(Nn, Hl), 0.0), 24.0) * 0.12) * lampF; // the lit door, mirrored in the ice (#106)
        vec3 iceCol = vec3(0.004, 0.012, 0.02) + reflSky * F * 1.5 * (0.8 + 0.4 * polish) + uSunColor * specSun * 0.6 + uLampColor * specL;
        iceCol = mix(iceCol, milkyLit, milky * 0.7);
        iceCol += whiteLit * halo * 0.5;
        iceCol = mix(iceCol, whiteLit, white);
        // toward the horizon the sheet closes up: the sky's mirror wins over what lies under it (#103)
        float graze = pow(1.0 - cosT, 2.0);
        float iceAlpha = clamp(mix(0.5, 0.26, uClear) + F * 1.4 + graze * 0.55 + milky * 0.6 + white * 0.7 + halo * 0.3 + specL * 0.5, 0.0, 1.0);
        // ---- put it together ----
        vec3 col = mix(iceCol, litSnow * (1.0 + 0.15 * streaks), snow);
        float alpha = mix(iceAlpha, 1.0, snow);
        float top = max(slush, chips); // fresh shavings and slush: the whitest thing on the ice
        col = mix(col, litSnow * 1.05, top); alpha = mix(alpha, 1.0, top);
        col += uHighlight * win * 0.06 * (1.0 - keep); // a breath of the beam's light under the thinned snow
        float rip = vnoise(P * 60.0 + uTime * vec2(0.9, -0.6)) - 0.5;
        vec3 holeCol = mix(vec3(0.01, 0.03, 0.05), vec3(0.25, 0.75, 0.95), glow * 0.85) + rip * 0.06;
        col = mix(col, holeCol, hole); alpha = mix(alpha, 0.96, hole);
        vec3 skin = vec3(0.6, 0.68, 0.78) * (sky * uAmbient + uSunColor * uSunI * lamb * 0.5);
        col = mix(col, skin, oldHole); alpha = mix(alpha, 1.0, oldHole);
        // the cutaway: inside the pool the ice is gone — still dark water shows the lit bottom and the beam like the
        // summer lake; along the cut a pale lip is the slab's top edge (IceCamp.jsx adds the walls below it)
        if (uCutOn > 0.5) {
          float cd = cutSDF(P);
          float inPool = 1.0 - smoothstep(-0.1, 0.02, cd);
          float lip = (1.0 - smoothstep(0.0, 0.2, abs(cd - 0.08))) * (1.0 - inPool);
          vec3 pool = mix(uWater * 1.6 + vec3(0.0, 0.03, 0.04), reflSky, 0.08 + 0.3 * fres) + rip * 0.03;
          col = mix(col, pool, inPool); alpha = mix(alpha, 0.12, inPool);
          vec3 lipCol = vec3(0.9, 0.95, 1.0) * (sky * uAmbient * 2.0 + uSunColor * uSunI * 0.6 + 0.12);
          col = mix(col, lipCol, lip * 0.9); alpha = max(alpha, lip);
        }
        // the shelter lamp: a warm pool on the snow by the door
        vec3 toL = uLamp.xyz - vWorld; float dl = length(toL);
        float lamp = uLamp.w * 2.2 / (1.0 + dl * dl * 0.18) * max(dot(N, toL / max(dl, 0.01)), 0.0);
        col += uLampColor * lamp * mix(0.3, 1.0, snow);
        if (!gl_FrontFacing) {
          // view A, from under the ice (reference: under-ice photography, docs/ice-relationship-study.md): the sheet is a
          // ceiling lit by the sky through it — bright where the ice is clear, dark under the snow, the milky plates in
          // between, cracks and bubbles as light leaks, the hole a disc of open daylight. Clear ice stays a little
          // see-through, so the kit on the ice reads as silhouettes.
          vec3 skyUp = mix(uSkyHorizon, uSkyZenith, 0.35) * 1.6 + uGlow * 0.15;
          float block = clamp(snow * 0.92 + milky * 0.55 + oldHole * 0.3, 0.0, 1.0);
          float leak = clamp(core * 0.6 + halo * 0.25 + bub * 0.5, 0.0, 1.0);
          float ripple = 0.9 + 0.2 * fbm3(P * 1.7 + 3.0); // frozen ripples on the underside
          vec3 under = skyUp * (1.0 - block) * ripple * vec3(0.78, 0.9, 1.0) + skyUp * leak * 0.6 + vec3(0.02, 0.05, 0.07) * block;
          under = mix(under, skyUp * 2.2 + vec3(0.2), hole);
          float uAlpha = mix(0.72, 1.0, block) ; uAlpha = mix(uAlpha, 0.35, hole);
          float dU = length(vWorld - cameraPosition);
          float fogU = 1.0 - exp(-dU * 0.02);
          under = mix(under, uWater * 1.5, fogU); uAlpha = mix(uAlpha, 1.0, fogU);
          gl_FragColor = vec4(pow(max(under, 0.0), vec3(1.0 / 2.2)), uAlpha);
          return;
        }
        // distance fog
        float dist = length(vWorld - cameraPosition);
        float fog = 1.0 - exp(-dist * uFogDensity);
        col = mix(col, uFogColor, fog); alpha = mix(alpha, 1.0, fog);
        gl_FragColor = vec4(pow(max(col, 0.0), vec3(1.0 / 2.2)), alpha); // linear → sRGB, like the built-in materials
      }
    `,
  })
  mat.userData.uniforms = uniforms
  return mat
}

// Push the hole list into the material: [{ x, z, live }] newest last
export function setHoles(mat, holes) {
  const u = mat.userData.uniforms
  const list = holes.slice(-MAX_HOLES)
  list.forEach((h, i) => u.uHoles.value[i].set(h.x, h.z, h.r, h.live ? 1 : 0.5))
  u.uHoleCount.value = list.length
}
