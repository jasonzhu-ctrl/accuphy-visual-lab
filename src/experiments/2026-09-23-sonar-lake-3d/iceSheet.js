// The frozen lake surface, one shader (like the summer water): wind-blown snow drifts over black ice, pressure
// cracks and bubble veins where the ice is bare, the auger holes (live, with slush and shavings; old ones frozen
// over), and the window — the beam's reach, seen from above through the ice, where the snow turns to glass so the
// lit lakebed shows (decision #55: wherever the device goes, whatever its beam reaches lights up; the rest stays as
// it was). Lighting is its own (sun / sky / the shelter lamp); the time-of-day presets feed the uniforms (iceScene.js).
import * as THREE from 'three'
import { MAX_BEAMS } from './lakeMaterial'
import { MAX_HOLES, WIND } from './iceScene'

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
      varying vec3 vWorld;
      void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vWorld = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }
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
      uniform sampler2D uTerrain; uniform float uTerrainHalf; uniform vec2 uWind; uniform vec3 uHighlight;
      uniform int uBeamCount;
      uniform vec3 uApex[MB]; uniform vec3 uC[MB]; uniform vec3 uH[MB]; uniform vec3 uN[MB];
      uniform vec4 uAng[MB]; uniform vec2 uRT[MB]; uniform vec4 uBox[MB];

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
      float fbm3(vec2 p) { return 0.5 * vnoise(p) + 0.25 * vnoise(p * 2.1 + 1.3) + 0.125 * vnoise(p * 4.3 + 2.7); }
      float fbm4(vec2 p) { return fbm3(p) + 0.0625 * vnoise(p * 8.9 + 5.1); }
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
      // drift height 0..1: long dunes and sastrugi ridges along the wind (the fine crust is added for the mask only)
      float drift(vec2 P) {
        vec2 Pw = vec2(dot(P, uWind), dot(P, vec2(-uWind.y, uWind.x)));
        float big = fbm4(P * 0.035 + 3.0);
        float sast = fbm3(vec2(Pw.x * 0.09, Pw.y * 0.55) + 7.0);
        return 0.68 * big + 0.32 * sast;
      }
      void main() {
        vec2 P = vWorld.xz;
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
        // ---- snow over the ice ----
        float h0 = drift(P);
        float e = 0.6;
        float hx = drift(P + vec2(e, 0.0)), hz = drift(P + vec2(0.0, e));
        vec3 N = normalize(vec3(-(hx - h0) * 3.2, e * 0.9, -(hz - h0) * 3.2)); // soft, sculpted drifts
        float h = 0.82 * h0 + 0.18 * fbm3(P * 0.8 + 1.7);
        float thr = mix(0.62, 0.30, uCover); // drift heights sit mostly in 0.35–0.6: cover 0.78 leaves scoured patches in the troughs only
        float snow = smoothstep(thr - 0.035, thr + 0.035, h) * (1.0 - clear);
        float lamb = max(dot(N, uSun), 0.0);
        vec3 sky = mix(uSkyHorizon, uSkyZenith, 0.45);
        vec3 snowAlb = vec3(0.93, 0.95, 0.98);
        vec3 litSnow = snowAlb * (sky * uAmbient * (0.7 + 0.3 * N.y) + uSunColor * uSunI * lamb);
        litSnow *= mix(vec3(0.84, 0.9, 1.0), vec3(1.0), smoothstep(0.25, 0.7, h)); // the troughs go blue
        float cell = hash(floor(P * 26.0));
        float glint = step(0.986, cell) * (0.5 + 0.5 * sin(uTime * 3.0 + cell * 60.0)) * lamb * uSunI; // facets catching the sun
        litSnow += uSunColor * glint * 1.2;
        // ---- bare ice ----
        vec2 vA = voro(P * 0.5), vB = voro(P * 1.9 + 5.0);
        float crack = (1.0 - smoothstep(0.0, 0.05, vA.y - vA.x)) * 0.9 + (1.0 - smoothstep(0.0, 0.03, vB.y - vB.x)) * 0.45;
        float bubbles = smoothstep(0.78, 0.92, vnoise(P * 24.0)) * 0.4;
        float frost = smoothstep(0.58, 0.9, fbm3(P * 2.4 + 11.0)) * 0.3;
        float fres = pow(1.0 - max(dot(V, vec3(0.0, 1.0, 0.0)), 0.0), 3.0);
        vec3 reflSky = mix(uSkyHorizon, uSkyZenith, 0.3);
        vec3 iceSurf = mix(uWater, reflSky, 0.12 + 0.55 * fres);
        float white = clamp(max(crack, max(bubbles, frost)), 0.0, 1.0);
        vec3 iceCol = mix(iceSurf, vec3(0.86, 0.91, 0.96) * (0.5 + 0.5 * uAmbient), white * 0.85);
        float iceAlpha = clamp(mix(0.9, 0.42, uClear) + white * 0.45 + fres * 0.35, 0.0, 1.0);
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
        float win = pow(clamp(beam * 1.3, 0.0, 1.0), 0.7) * uWindow * uBeamOn; // the snow over the beam glows and goes half-clear
        float edge = clamp(wide - beam, 0.0, 1.0) * uWindow * uBeamOn;
        // ---- put it together ----
        vec3 col = mix(iceCol, litSnow, snow);
        float alpha = mix(iceAlpha, 1.0, snow);
        float top = max(slush, chips); // fresh shavings and slush: the whitest thing on the ice
        col = mix(col, litSnow * 1.05, top); alpha = mix(alpha, 1.0, top);
        vec3 glowCol = mix(litSnow, uHighlight * 1.1, 0.55); // snow lit from below: cyan through white
        col = mix(col, glowCol, win * 0.8);
        alpha = mix(alpha, mix(0.62, 0.3, snow * 0.0 + 0.5), win); // half-clear: the cone and the lit bottom show through, the snow's grain stays
        col += uHighlight * edge * 0.25;
        float rip = vnoise(P * 60.0 + uTime * vec2(0.9, -0.6)) - 0.5;
        vec3 holeCol = mix(vec3(0.01, 0.03, 0.05), vec3(0.25, 0.75, 0.95), glow * 0.85) + rip * 0.06;
        col = mix(col, holeCol, hole); alpha = mix(alpha, 0.96, hole);
        vec3 skin = vec3(0.6, 0.68, 0.78) * (sky * uAmbient + uSunColor * uSunI * lamb * 0.5);
        col = mix(col, skin, oldHole); alpha = mix(alpha, 1.0, oldHole);
        // the shelter lamp: a warm pool on the snow by the door
        vec3 toL = uLamp.xyz - vWorld; float dl = length(toL);
        float lamp = uLamp.w * 2.2 / (1.0 + dl * dl * 0.18) * max(dot(N, toL / max(dl, 0.01)), 0.0);
        col += uLampColor * lamp * mix(0.3, 1.0, snow);
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
