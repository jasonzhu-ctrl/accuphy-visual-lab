import * as THREE from 'three'

// One material for everything under water: lambert + hemisphere light,
// depth/distance fog, and the "beam reveal": fragments inside a beam wedge are
// lit up. Wedges are described exactly like wedge.js builds them:
//   p = worldPos - apex; u = p·c, v = p·h, w = p·n
//   inside ⇔ r=|(u,v)| < R, atan(v,u) ∈ [a0,a1], w ∈ [s0,s1]·u·tan(theta)
export const MAX_BEAMS = 2

export function makeLakeMaterial({ fish = false, structure = false, steel = false, logo = false } = {}) {
  const uniforms = {
    uSun: { value: new THREE.Vector3(0.4, 0.8, 0.3).normalize() },
    uFogColor: { value: new THREE.Color('#17545f') },
    uFogDensity: { value: 0.0085 },
    uBeamCount: { value: 0 },
    uApex: { value: [new THREE.Vector3(), new THREE.Vector3()] },
    uC: { value: [new THREE.Vector3(), new THREE.Vector3()] },
    uH: { value: [new THREE.Vector3(), new THREE.Vector3()] },
    uN: { value: [new THREE.Vector3(), new THREE.Vector3()] },
    uAng: { value: [new THREE.Vector4(), new THREE.Vector4()] }, // a0, a1, s0, s1
    uRT: { value: [new THREE.Vector2(), new THREE.Vector2()] },  // R, tan(theta)
    uBox: { value: [new THREE.Vector4(-1e5, 1e5, 1e5, 1e5), new THREE.Vector4(-1e5, 1e5, 1e5, 1e5)] }, // screen-box clip: xMin, xMax (forward), yMax (depth), zMax (|sideways|) from the apex
    uReveal: { value: 1.0 },
    uSonarPass: { value: 0.0 }, // 1 while rendering the sonar depth strips: alpha = fish mask
    uFishSonarScale: { value: 1.0 / 2.6 }, // fish are DRAWN ×2.6 in the lake (fish.js); the sonar sees them at true size (§7.4)
    uHighlight: { value: new THREE.Color('#7fe6ff') },
    uRevealGain: { value: 1.0 }, // ice scene: a stronger lift inside the beam (the window in the snow must read lit)
    uClip: { value: new THREE.Vector2(0, 0) }, // ice section view: x = on, y = world z of the cut wall; fragments beyond it are cut away in the main view
    uOutGamma: { value: 1.0 },   // ice scene: < 1 brightens the dark water world a little (main view only)
  }
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexColors: true,
    defines: fish ? { FISH: 1 } : logo ? { STRUCTURE: 1, LOGO: 1 } : steel ? { STRUCTURE: 1, STEEL: 1 } : structure ? { STRUCTURE: 1 } : {},
    vertexShader: /* glsl */ `
      varying vec3 vWorld; varying vec3 vNormal; varying vec3 vColor;
      #ifdef FISH
        attribute float aPattern; attribute vec3 aBelly; attribute vec3 aSide;
        attribute vec4 aSwim; // per fish, set every frame in Scene.jsx: wave phase, activity, turn bend, wavelength
        varying float vPattern; varying vec3 vBelly; varying vec3 vSide; varying vec3 vLocal; varying vec2 vUv;
        uniform float uSonarPass; uniform float uFishSonarScale;
      #endif
      void main() {
        vec3 pos = position, nrm = normal;
      #ifdef FISH
        vPattern = aPattern; vBelly = aBelly; vSide = aSide; vLocal = position; vUv = uv; // markings stay on the body; uv: body, eye or fin (fishGeometry.js)
        // fish are not rendered in the sonar passes any more (analytic marks, sonarMarks.js)
        // Swimming (decision #86, docs/boat-fish-plan.md §3a): the body bends sideways (local z) with a wave that
        // runs from head to tail. s = 0 at the nose (x = +0.5) → 1 at the tail tip (x ≈ −0.7). Half-amplitude:
        // a little head recoil, smallest just behind the head, 0.1 of the length at the tail tip (the carangiform
        // envelope 0.02 − 0.0825 s + 0.1625 s²), times the activity. Plus a C-bend β (s − 0.3)² into the turn.
        // The normal follows the bend exactly (a shear in x–z: n' = (nx − dz/dx · nz, ny, nz)).
        float s = (0.5 - position.x) / 1.2;
        float A = 1.2 * (0.02 - 0.0825 * s + 0.1625 * s * s), dA = 1.2 * (0.325 * s - 0.0825);
        float kw = 6.2831853 / aSwim.w, ph = kw * s - aSwim.x, sn = sin(ph), cs = cos(ph), b = s - 0.3;
        pos.z += aSwim.y * A * sn + aSwim.z * b * b;
        float dzdx = -(aSwim.y * (dA * sn + A * kw * cs) + 2.0 * aSwim.z * b) / 1.2;
        nrm = vec3(normal.x - dzdx * normal.z, normal.y, normal.z);
      #endif
        vec3 c = vec3(1.0);
        #ifdef USE_COLOR
          c = color;
        #endif
        #ifdef USE_INSTANCING_COLOR
          c = instanceColor;
        #endif
        vColor = c;
        mat4 m = modelMatrix;
        #ifdef USE_INSTANCING
          m = modelMatrix * instanceMatrix;
        #endif
        vec4 wp = m * vec4(pos, 1.0);
        vWorld = wp.xyz;
        vNormal = normalize(mat3(m) * nrm);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec3 vWorld; varying vec3 vNormal; varying vec3 vColor;
      uniform vec3 uSun; uniform vec3 uFogColor; uniform float uFogDensity;
      uniform int uBeamCount;
      uniform vec3 uApex[${MAX_BEAMS}]; uniform vec3 uC[${MAX_BEAMS}]; uniform vec3 uH[${MAX_BEAMS}]; uniform vec3 uN[${MAX_BEAMS}];
      uniform vec4 uAng[${MAX_BEAMS}]; uniform vec2 uRT[${MAX_BEAMS}]; uniform vec4 uBox[${MAX_BEAMS}];
      uniform float uReveal; uniform vec3 uHighlight; uniform float uSonarPass; uniform float uRevealGain; uniform float uOutGamma; uniform vec2 uClip;
      #ifdef FISH
        varying float vPattern; varying vec3 vBelly; varying vec3 vSide; varying vec3 vLocal; varying vec2 vUv;
        float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
        float vn1(float x) { float i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(hash3(vec3(i, 7.1, 3.3)), hash3(vec3(i + 1.0, 7.1, 3.3)), f); }
        // round spots on a jittered grid (in some cells only): 1 inside a spot, soft edge
        float spots(vec3 p, float scale, float rad, float keep) {
          vec3 q = p * scale, c = floor(q);
          vec3 j = vec3(hash3(c), hash3(c + 17.0), hash3(c + 31.0)) - 0.5;
          float d = length(q - c - 0.5 - 0.5 * j);
          return (1.0 - smoothstep(rad * 0.75, rad, d)) * step(1.0 - keep, hash3(c + 5.0));
        }
      #endif

      float insideBeam(int k, vec3 p, float margin) {
        vec3 d = p - uApex[k];
        float u = dot(d, uC[k]), v = dot(d, uH[k]), w = dot(d, uN[k]);
        float r = length(vec2(u, v));
        float ang = atan(v, u);
        float soft = 0.03; // radians of edge softness
        float inA = smoothstep(uAng[k].x - margin - soft, uAng[k].x - margin + soft, ang) * (1.0 - smoothstep(uAng[k].y + margin - soft, uAng[k].y + margin + soft, ang));
        float lim = max(u, 0.0) * uRT[k].y;
        float lo = uAng[k].z * lim - margin * 4.0 * lim, hi = uAng[k].w * lim + margin * 4.0 * lim;
        float sw = max(0.12, 0.05 * lim);
        float inW = smoothstep(lo - sw, lo + sw, w) * (1.0 - smoothstep(hi - sw, hi + sw, w));
        float inR = 1.0 - smoothstep(uRT[k].x - 0.6 + margin * 30.0, uRT[k].x + margin * 30.0, r);
        // PL Forward: only the part of the fan the phone shows (range ahead × depth range down)
        vec4 bx = uBox[k]; float bm = margin * 30.0;
        inR *= 1.0 - smoothstep(bx.w - 0.3 + bm, bx.w + 0.3 + bm, abs(d.z));
        inR *= smoothstep(bx.x - 0.3 - bm, bx.x + 0.3 - bm, d.x) * (1.0 - smoothstep(bx.y - 0.3 + bm, bx.y + 0.3 + bm, d.x)) * (1.0 - smoothstep(bx.z - 0.3 + bm, bx.z + 0.3 + bm, -d.y));
        // fade with range like a real beam
        float atten = 1.0 - 0.6 * clamp(r / uRT[k].x, 0.0, 1.0);
        return inA * inW * inR * atten;
      }

      void main() {
        if (uClip.x > 0.5 && uSonarPass < 0.5 && vWorld.z > uClip.y) discard; // the section cut (the sonar still sees the whole lake)
        vec3 n = normalize(vNormal);
        if (!gl_FrontFacing) n = -n;
        float lambert = max(dot(n, uSun), 0.0);
        float hemi = 0.5 + 0.5 * n.y;
        vec3 albedo = vColor;
        bool isEye = false;
      #ifdef FISH
        // back → side → belly gradient by local height (geometry is 1 unit long, |y| ≲ 0.23)
        float hgt = vLocal.y;
        float tb = smoothstep(0.12, -0.02, hgt);   // back → side
        float ts = smoothstep(-0.03, -0.13, hgt);  // side → belly
        albedo = mix(mix(vColor, vSide, tb), vBelly, ts);
        float upper = 1.0 - ts; // 1 on back/sides, 0 on belly
        int pat = int(vPattern + 0.5);
        isEye = vUv.x < -0.5 && vUv.x > -1.5;
        if (isEye) { // decision #90: a black pupil, an iris ring, a dark rim and a catch-light toward the nose
          vec2 e = vec2((vUv.x + 1.0) * 5.0, vUv.y);
          float r = length(e);
          vec3 iris = pat == 5 ? vec3(0.66, 0.68, 0.56) : pat == 7 ? vec3(0.78, 0.8, 0.82) : vec3(0.72, 0.55, 0.2); // walleye milky-silver, smelt silver, the rest gold
          albedo = mix(vec3(0.02), iris, smoothstep(0.4, 0.5, r));
          albedo = mix(albedo, vec3(0.05), smoothstep(0.84, 0.96, r));
          albedo += vec3(0.9) * (1.0 - smoothstep(0.0, 0.22, length(e - vec2(0.3, 0.32))));
        } else if (vUv.x < -1.5) { // fins: see-through (toward the water's colour), with darker rays
          float ray = smoothstep(0.22, 0.5, abs(fract(vUv.y * 9.0) - 0.5));
          albedo = mix(vSide, uFogColor, 0.35) * (0.72 + 0.28 * ray);
          if (pat == 5 && vLocal.x < -0.655 && hgt < -0.135) albedo = vec3(0.9, 0.9, 0.86);      // walleye: the white tip of the lower tail lobe
          if (pat == 10 && hgt < -0.04) albedo = mix(albedo, vec3(0.86, 0.42, 0.12), 0.7);       // yellow perch: orange lower fins
        } else if (pat == 1) { // dark vertical bars, strongest on the sides, fade on the belly
          float bar = smoothstep(0.3, 0.55, abs(fract(vLocal.x * 8.0 + 0.25) - 0.5) * 2.0);
          albedo *= mix(0.5, 1.0, bar) * upper + (1.0 - upper);
        } else if (pat == 2) { // light spots (round)
          float sp = spots(vLocal, 24.0, 0.34, 0.45);
          albedo = mix(albedo, albedo * 1.9 + 0.2, sp * upper);
        } else if (pat == 3) { // dark speckle / mottling (round blotches)
          float sp = max(spots(vLocal, 20.0, 0.42, 0.5), spots(vLocal + 0.37, 34.0, 0.38, 0.35));
          albedo = mix(albedo, albedo * 0.4, sp * (0.3 + 0.7 * upper));
        } else if (pat == 4) { // dark lateral band of blotches (largemouth)
          float st = 1.0 - smoothstep(0.02, 0.05, abs(hgt + 0.02 + 0.012 * (vn1(vLocal.x * 23.0) - 0.5)));
          float br = smoothstep(0.32, 0.45, vn1(vLocal.x * 9.0));
          albedo = mix(albedo, albedo * 0.3, st * br);
        } else if (pat == 5) { // dark saddles across the back (walleye)
          float sad = smoothstep(0.42, 0.56, vn1(vLocal.x * 6.0 + 0.5)) * smoothstep(-0.02, 0.1, hgt);
          albedo = mix(albedo, albedo * 0.55, sad);
        } else if (pat == 6) { // small black spots on the upper half (chinook)
          float sp = spots(vLocal, 30.0, 0.3, 0.42) * smoothstep(-0.04, 0.06, hgt);
          albedo = mix(albedo, vec3(0.05), sp);
        } else if (pat == 8) { // musky: dark olive-brown bars, broken into dashes, strongest mid-side
          float bx = fract(vLocal.x * 7.0 + 0.3);
          float bar = 1.0 - smoothstep(0.22, 0.34, abs(bx - 0.5) * 2.0);
          float broken = step(0.3, hash3(floor(vLocal * vec3(7.0, 11.0, 1.0)) + 2.0)); // gaps in the bars
          float band = smoothstep(-0.12, -0.04, hgt) * (1.0 - smoothstep(0.06, 0.13, hgt));
          albedo = mix(albedo, vec3(0.16, 0.17, 0.09), bar * broken * band * 0.85);
        } else if (pat == 9) { // northern pike: rows of pale, bean-shaped spots on the green sides
          vec2 q = vec2(vLocal.x * 16.0 + 0.5 * floor(vLocal.y * 34.0), vLocal.y * 34.0);
          float sp = 1.0 - smoothstep(0.24, 0.34, length((fract(q) - 0.5) * vec2(0.8, 1.5)));
          float band = smoothstep(-0.11, -0.05, hgt) * (1.0 - smoothstep(0.07, 0.12, hgt));
          albedo = mix(albedo, vec3(0.84, 0.85, 0.58), sp * band * 0.85);
        } else if (pat == 10) { // yellow perch: 6–8 dark bars, broad on the back, tapering down the side
          float bx = abs(fract(vLocal.x * 6.5 + 0.2) - 0.5);
          float bar = 1.0 - smoothstep(0.12, 0.2 * smoothstep(-0.1, 0.08, hgt) + 0.02, bx);
          albedo = mix(albedo, vec3(0.2, 0.22, 0.08), bar * smoothstep(-0.09, -0.02, hgt) * 0.8);
        } else if (pat == 7) { // bright silver lateral stripe (smelt)
          float st = 1.0 - smoothstep(0.015, 0.04, abs(hgt + 0.015));
          albedo = mix(albedo, vec3(0.95, 0.97, 1.0), st * 0.8);
        }
      #endif
        vec3 base = albedo * (0.28 + 0.42 * hemi + 0.6 * lambert);
        // dim everything under water a little; the beam brings it back
        float beam = 0.0, wide = 0.0;
        for (int k = 0; k < ${MAX_BEAMS}; k++) { if (k < uBeamCount) { beam = max(beam, insideBeam(k, vWorld, 0.0)); wide = max(wide, insideBeam(k, vWorld, 0.02)); } }
        beam *= uReveal;
        float edge = clamp(wide - beam, 0.0, 1.0) * uReveal; // thin bright rim where the beam footprint ends
        // procedural surface texture: fine speckle for sand/bark
        float tex = 0.9 + 0.2 * fract(sin(dot(floor(vWorld * 9.0), vec3(12.9898, 78.233, 37.719))) * 43758.5453);
        albedo *= tex;
      #ifndef FISH
        // bark: vertical striations on brown (timber) surfaces — grooves follow the trunk
        float brown = smoothstep(0.02, 0.08, vColor.r - vColor.b);
        float groove = fract(sin(dot(floor(vec2(atan(vWorld.z, vWorld.x) * 40.0 + vWorld.x * 3.0, vWorld.y * 1.2)), vec2(12.9898, 78.233))) * 43758.5453);
        albedo *= 1.0 - brown * 0.28 * groove;
      #endif
        // outside the beam things stay murky; inside they pop (Garmin look)
        vec3 lit = base * (0.72 + 2.3 * beam * uRevealGain) + uHighlight * 0.3 * beam * uRevealGain + uHighlight * 0.9 * edge;
      #ifdef LOGO
        // the brand mark keeps Accuphy blue: a gentler beam lift, no cyan wash (the ×3 lift clipped it to cyan)
        lit = base * (0.95 + 0.85 * beam) + uHighlight * 0.06 * beam + uHighlight * 0.5 * edge;
      #endif
        // underwater fog by distance from camera
        float dist = length(vWorld - cameraPosition);
        float fog = 1.0 - exp(-dist * uFogDensity);
        fog *= 1.0 - 0.7 * beam; // the beam also cuts through the murk
        vec3 col = mix(lit, uFogColor, clamp(fog, 0.0, 0.92));
        if (uSonarPass < 0.5 && uOutGamma != 1.0) col = pow(max(col, 0.0), vec3(uOutGamma));
        // sonar pass alpha: 1 = fish, 0.75 = steel (wrecks), 0.5 = other structure (timber, rocks), 0 = bottom
        float isFish = 0.0;
      #ifdef STRUCTURE
        isFish = 0.5;
      #endif
      #ifdef STEEL
        isFish = 0.75;
      #endif
      #ifdef FISH
        isFish = 1.0;
        // rim light on fish caught in the beam — a bright edge, like a spotlight from behind
        vec3 V = normalize(cameraPosition - vWorld);
        float rim = pow(1.0 - max(dot(n, V), 0.0), 2.2);
        col += uHighlight * rim * beam * 1.6 + vec3(1.0, 0.98, 0.9) * pow(rim, 6.0) * beam * 1.2;
        if (isEye && int(vPattern + 0.5) == 5) col += vec3(0.14, 0.15, 0.12) * (0.25 + beam); // walleye: the glassy eye catches the light
      #endif
        // sonar pass: alpha carries "is this a fish" so the screen can draw fish brighter
        gl_FragColor = vec4(col, uSonarPass > 0.5 ? isFish : 1.0);
      }
    `,
  })
  mat.userData.uniforms = uniforms
  return mat
}

// Push wedge specs (from wedge.js) into every lake material's uniforms.
export function setBeamUniforms(materials, specs, apex) {
  for (const m of materials) {
    const u = m.userData.uniforms
    u.uBeamCount.value = Math.min(specs.length, MAX_BEAMS)
    specs.slice(0, MAX_BEAMS).forEach((s, k) => {
      u.uApex.value[k].copy(apex)
      u.uC.value[k].copy(s.frame.c); u.uH.value[k].copy(s.frame.h); u.uN.value[k].copy(s.frame.n)
      u.uAng.value[k].set(s.a0, s.a1, s.s0, s.s1)
      u.uRT.value[k].set(s.R, Math.tan(s.theta))
      if (s.box) u.uBox.value[k].set(s.box.xMin, s.box.xMax, s.box.yMax, s.box.zMax ?? 1e5); else u.uBox.value[k].set(-1e5, 1e5, 1e5, 1e5)
    })
  }
}
