// The frozen lake surface, one shader: wind-blown snow drifts over black ice, milky refrozen plates, long pressure
// cracks with snow settled in them, bubbles frozen in the ice, the sky mirrored by Fresnel, sun glints on the snow and
// the shelter lamp's warm pool by its door. From below (the back face) the sheet is a ceiling lit by the sky through
// it. Lighting is its own (sun / sky / lamp); the time-of-day presets feed the uniforms (presets.js).
import * as THREE from 'three'
import { WIND } from './presets'

export function makeIceMaterial() {
  const uniforms = {
    uTime: { value: 0 },
    uSun: { value: new THREE.Vector3(-0.62, 0.22, -0.35).normalize() }, uSunColor: { value: new THREE.Color('#ffb48c') }, uSunI: { value: 0.75 },
    uSkyZenith: { value: new THREE.Color('#17213a') }, uSkyHorizon: { value: new THREE.Color('#6b6f8e') }, uAmbient: { value: 0.85 },
    uFogColor: { value: new THREE.Color('#3b4a66') }, uFogDensity: { value: 0.0038 },
    uWater: { value: new THREE.Color('#0a2630') },
    uCover: { value: 0.78 }, uClear: { value: 0.55 },
    uLamp: { value: new THREE.Vector4(0, 0, 0, 0) }, uLampColor: { value: new THREE.Color('#ffb060') },
    uWind: { value: WIND.clone() },
    uGlow: { value: new THREE.Color('#e08a5e') }, uGlowDir: { value: new THREE.Vector3(-0.8, 0, -0.45).normalize() }, // the afterglow, mirrored in the ice
    uClip: { value: new THREE.Vector2(0, 0) },     // the cutaway: x = on, y = world z of the cut wall
    uCenter: { value: new THREE.Vector2(0, 0) },   // where the near (displaced) sheet is centred
    uOpenC: { value: new THREE.Vector2(1e4, 1e4) }, // an open stretch of bare ice round this point (where the anglers set up)
  }
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      attribute float aDisp;
      uniform vec2 uWind; uniform float uCover; uniform vec2 uOpenC; uniform vec2 uCenter;
      varying vec3 vWorld;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
      float fbm3(vec2 p) { return 0.5 * vnoise(p) + 0.25 * vnoise(p * 2.1 + 1.3) + 0.125 * vnoise(p * 4.3 + 2.7); }
      float fbm4(vec2 p) { return fbm3(p) + 0.0625 * vnoise(p * 8.9 + 5.1); }
      // The snow on the ice, as a mask and as a depth (metres). Shared by the vertex stage (which raises the sheet by it)
      // and the fragment stage (which shades it with the real slopes). x = the opaque core, y = the thin dusting round it,
      // z = the blown-snow strokes along the wind; open clears a soft stretch round uOpenC.
      vec3 snowParts(vec2 P) {
        vec2 Pw = vec2(dot(P, uWind), dot(P, vec2(-uWind.y, uWind.x)));
        float big = fbm4(P * 0.035 + 3.0), sast = fbm3(vec2(Pw.x * 0.07, Pw.y * 0.6) + 7.0);
        float h = 0.82 * (0.55 * big + 0.45 * sast) + 0.18 * fbm3(P * 0.8 + 1.7);
        float thr = mix(0.62, 0.30, uCover);
        float hh = h + 0.02 * (vnoise(P * 2.3 + 9.0) - 0.5);
        float core = smoothstep(thr - 0.012, thr + 0.012, hh);
        float skirt = smoothstep(thr - 0.09, thr - 0.005, hh);
        float streakN = fbm3(vec2(Pw.x * 0.05, Pw.y * 0.7) + 2.0);
        float streaks = smoothstep(0.645, 0.665, streakN + 0.03 * (vnoise(P * 3.0) - 0.5));
        float open = 1.0 - smoothstep(9.0, 16.0, distance(P, uOpenC) + 3.0 * (fbm3(P * 0.11 + 5.0) - 0.5));
        return vec3(core, skirt, streaks) * (1.0 - 0.9 * open);
      }
      // how thick the snow lies: a wind-swept big lake keeps the snow thin and even — low drifts of a few cm, a dusting,
      // strokes along the wind, not dunes
      float snowDepth(vec2 P, vec3 sp) {
        float d = sp.x * (0.06 + 0.03 * fbm3(P * 0.9 + 4.0)) + sp.y * 0.01 + sp.z * 0.025;
        d += (fbm3(P * 2.6 + 1.0) - 0.5) * 0.012 * max(max(sp.x, sp.y), sp.z);
        return max(d, 0.0);
      }
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        // real relief: the near sheet (aDisp = 1, 0.5 m mesh) rises by the snow's depth, fading to flat at its edge
        float fade = aDisp * (1.0 - smoothstep(100.0, 116.0, distance(wp.xz, uCenter)));
        if (fade > 0.001) wp.y += snowDepth(wp.xz, snowParts(wp.xz)) * fade;
        vWorld = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec3 vWorld;
      uniform float uTime; uniform vec3 uSun; uniform vec3 uSunColor; uniform float uSunI;
      uniform vec3 uSkyZenith; uniform vec3 uSkyHorizon; uniform float uAmbient;
      uniform vec3 uFogColor; uniform float uFogDensity; uniform vec3 uWater;
      uniform float uCover; uniform float uClear;
      uniform vec4 uLamp; uniform vec3 uLampColor;
      uniform vec2 uWind; uniform vec3 uGlow; uniform vec3 uGlowDir; uniform vec2 uClip; uniform vec2 uCenter; uniform vec2 uOpenC;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
      float fbm3(vec2 p) { return 0.5 * vnoise(p) + 0.25 * vnoise(p * 2.1 + 1.3) + 0.125 * vnoise(p * 4.3 + 2.7); }
      float fbm4(vec2 p) { return fbm3(p) + 0.0625 * vnoise(p * 8.9 + 5.1); }
      // the sky as the dome draws it (iceSky.js), for the mirror in the ice
      vec3 skyAt(vec3 d) {
        float el = d.y;
        vec3 sk = mix(uSkyHorizon, uSkyZenith, pow(clamp(el * 1.6, 0.0, 1.0), 0.6));
        float az = max(dot(normalize(vec3(d.x, 0.0, d.z)), uGlowDir), 0.0);
        sk = mix(sk, uGlow, pow(az, 5.0) * exp(-max(el, 0.0) * 9.0) * 0.9);
        return el < 0.0 ? mix(uFogColor, uSkyHorizon, exp(el * 40.0)) : sk;
      }
      // Real black ice: long, nearly straight refrozen cracks tens of metres long, a few bright and wide with a frosty
      // halo, many hairlines, each with its own brightness and breaks — not a honeycomb. One family of such lines:
      // spacing sp, turned by ang. Returns (core, halo).
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
      // the snow (same as the vertex stage)
      vec3 snowParts(vec2 P) {
        vec2 Pw = vec2(dot(P, uWind), dot(P, vec2(-uWind.y, uWind.x)));
        float big = fbm4(P * 0.035 + 3.0), sast = fbm3(vec2(Pw.x * 0.07, Pw.y * 0.6) + 7.0);
        float h = 0.82 * (0.55 * big + 0.45 * sast) + 0.18 * fbm3(P * 0.8 + 1.7);
        float thr = mix(0.62, 0.30, uCover);
        float hh = h + 0.02 * (vnoise(P * 2.3 + 9.0) - 0.5);
        float core = smoothstep(thr - 0.012, thr + 0.012, hh);
        float skirt = smoothstep(thr - 0.09, thr - 0.005, hh);
        float streakN = fbm3(vec2(Pw.x * 0.05, Pw.y * 0.7) + 2.0);
        float streaks = smoothstep(0.645, 0.665, streakN + 0.03 * (vnoise(P * 3.0) - 0.5));
        float open = 1.0 - smoothstep(9.0, 16.0, distance(P, uOpenC) + 3.0 * (fbm3(P * 0.11 + 5.0) - 0.5));
        return vec3(core, skirt, streaks) * (1.0 - 0.9 * open);
      }
      float snowDepth(vec2 P, vec3 sp) {
        float d = sp.x * (0.06 + 0.03 * fbm3(P * 0.9 + 4.0)) + sp.y * 0.01 + sp.z * 0.025;
        d += (fbm3(P * 2.6 + 1.0) - 0.5) * 0.012 * max(max(sp.x, sp.y), sp.z);
        return max(d, 0.0);
      }
      void main() {
        vec2 P = vWorld.xz;
        if (uClip.x > 0.5 && P.y > uClip.y) discard; // the cutaway
        vec3 V = normalize(cameraPosition - vWorld);
        // less snow and fewer milky plates on the open stretch round uOpenC (soft, noisy edge)
        float openD = distance(P, uOpenC);
        float open = 1.0 - smoothstep(9.0, 16.0, openD + 3.0 * (fbm3(P * 0.11 + 5.0) - 0.5));
        float keep = 1.0 - 0.9 * open;
        // ---- snow over the ice: the mask, the depth and the real slopes ----
        vec3 sp = snowParts(P);
        float sd = snowDepth(P, sp);
        float e = 0.35;
        float sdx = snowDepth(P + vec2(e, 0.0), snowParts(P + vec2(e, 0.0))), sdz = snowDepth(P + vec2(0.0, e), snowParts(P + vec2(0.0, e)));
        vec3 Nsnow = normalize(vec3(-(sdx - sd), e, -(sdz - sd)));
        vec2 Pw = vec2(dot(P, uWind), dot(P, vec2(-uWind.y, uWind.x)));
        float streaks = sp.z;
        float snow = max(max(sp.x, 0.4 * sp.y), sp.z) * keep;
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
        F = 0.045 + F;                                       // and a faint skin of sky everywhere, so the sheet reads as a surface over the dark water
        vec3 reflSky = skyAt(reflect(-V, Nn));
        vec3 Hh = normalize(uSun + V);
        float specSun = pow(max(dot(Nn, Hh), 0.0), 180.0) * uSunI;
        // From ~45 m a real crack is a hairline: what shows is tone — a patchwork of clear black ice and milky refrozen
        // 'snow ice' — the sky's sheen, the snow, and a few long faint lines where snow has settled in a pressure crack.
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
        float specL = (pow(max(dot(Nn, Hl), 0.0), 320.0) * 3.0 + pow(max(dot(Nn, Hl), 0.0), 24.0) * 0.12) * lampF; // the lit door, mirrored in the ice
        vec3 iceCol = vec3(0.004, 0.012, 0.02) + reflSky * F * 1.5 * (0.8 + 0.4 * polish) + uSunColor * specSun * 0.6 + uLampColor * specL;
        iceCol = mix(iceCol, milkyLit, milky * 0.7);
        iceCol += whiteLit * halo * 0.5;
        iceCol = mix(iceCol, whiteLit, white);
        // toward the horizon the sheet closes up: the sky's mirror wins over what lies under it
        float graze = pow(1.0 - cosT, 2.0);
        float iceAlpha = clamp(mix(0.5, 0.26, uClear) + F * 1.4 + graze * 0.55 + milky * 0.6 + white * 0.7 + halo * 0.3 + specL * 0.5, 0.0, 1.0);
        // ---- put it together ----
        vec3 col = mix(iceCol, litSnow * (1.0 + 0.15 * streaks), snow);
        float alpha = mix(iceAlpha, 1.0, snow);
        // the shelter lamp: a warm pool on the snow by the door
        vec3 toL = uLamp.xyz - vWorld; float dl = length(toL);
        float lamp = uLamp.w * 2.2 / (1.0 + dl * dl * 0.18) * max(dot(N, toL / max(dl, 0.01)), 0.0);
        col += uLampColor * lamp * mix(0.3, 1.0, snow);
        if (!gl_FrontFacing) {
          // from under the ice: the sheet is a ceiling lit by the sky through it — bright where the ice is clear, dark
          // under the snow, the milky plates in between, cracks and bubbles as light leaks. Clear ice stays a little
          // see-through, so things on the ice read as silhouettes.
          vec3 skyUp = mix(uSkyHorizon, uSkyZenith, 0.35) * 1.6 + uGlow * 0.15;
          float block = clamp(snow * 0.92 + milky * 0.55, 0.0, 1.0);
          float leak = clamp(core * 0.6 + halo * 0.25 + bub * 0.5, 0.0, 1.0);
          float ripple = 0.9 + 0.2 * fbm3(P * 1.7 + 3.0); // frozen ripples on the underside
          vec3 under = skyUp * (1.0 - block) * ripple * vec3(0.78, 0.9, 1.0) + skyUp * leak * 0.6 + vec3(0.02, 0.05, 0.07) * block;
          float uAlpha = mix(0.72, 1.0, block);
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
