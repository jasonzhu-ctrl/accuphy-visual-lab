import * as THREE from 'three'

// One material for everything under water: lambert + hemisphere light,
// depth/distance fog, and the "beam reveal": fragments inside a beam wedge are
// lit up. Wedges are described exactly like wedge.js builds them:
//   p = worldPos - apex; u = p·c, v = p·h, w = p·n
//   inside ⇔ r=|(u,v)| < R, atan(v,u) ∈ [a0,a1], w ∈ [s0,s1]·u·tan(theta)
export const MAX_BEAMS = 2

export function makeLakeMaterial({ fish = false, structure = false } = {}) {
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
    uBox: { value: [new THREE.Vector3(-1e5, 1e5, 1e5), new THREE.Vector3(-1e5, 1e5, 1e5)] }, // screen-box clip: xMin, xMax (forward), yMax (depth) from the apex
    uReveal: { value: 1.0 },
    uSonarPass: { value: 0.0 }, // 1 while rendering the sonar depth strips: alpha = fish mask
    uFishSonarScale: { value: 1.0 / 2.6 }, // fish are DRAWN ×2.6 in the lake (fish.js); the sonar sees them at true size (§7.4)
    uHighlight: { value: new THREE.Color('#7fe6ff') },
  }
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexColors: true,
    defines: fish ? { FISH: 1 } : structure ? { STRUCTURE: 1 } : {},
    vertexShader: /* glsl */ `
      varying vec3 vWorld; varying vec3 vNormal; varying vec3 vColor;
      #ifdef FISH
        attribute float aPattern; attribute vec3 aBelly; attribute vec3 aSide;
        varying float vPattern; varying vec3 vBelly; varying vec3 vSide; varying vec3 vLocal;
        uniform float uSonarPass; uniform float uFishSonarScale;
      #endif
      void main() {
        vec3 pos = position;
      #ifdef FISH
        vPattern = aPattern; vBelly = aBelly; vSide = aSide; vLocal = position;
        // fish are not rendered in the sonar passes any more (analytic marks, sonarMarks.js)
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
        vNormal = normalize(mat3(m) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec3 vWorld; varying vec3 vNormal; varying vec3 vColor;
      uniform vec3 uSun; uniform vec3 uFogColor; uniform float uFogDensity;
      uniform int uBeamCount;
      uniform vec3 uApex[${MAX_BEAMS}]; uniform vec3 uC[${MAX_BEAMS}]; uniform vec3 uH[${MAX_BEAMS}]; uniform vec3 uN[${MAX_BEAMS}];
      uniform vec4 uAng[${MAX_BEAMS}]; uniform vec2 uRT[${MAX_BEAMS}]; uniform vec3 uBox[${MAX_BEAMS}];
      uniform float uReveal; uniform vec3 uHighlight; uniform float uSonarPass;
      #ifdef FISH
        varying float vPattern; varying vec3 vBelly; varying vec3 vSide; varying vec3 vLocal;
        float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
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
        vec3 bx = uBox[k]; float bm = margin * 30.0;
        inR *= smoothstep(bx.x - 0.3 - bm, bx.x + 0.3 - bm, d.x) * (1.0 - smoothstep(bx.y - 0.3 + bm, bx.y + 0.3 + bm, d.x)) * (1.0 - smoothstep(bx.z - 0.3 + bm, bx.z + 0.3 + bm, -d.y));
        // fade with range like a real beam
        float atten = 1.0 - 0.6 * clamp(r / uRT[k].x, 0.0, 1.0);
        return inA * inW * inR * atten;
      }

      void main() {
        vec3 n = normalize(vNormal);
        if (!gl_FrontFacing) n = -n;
        float lambert = max(dot(n, uSun), 0.0);
        float hemi = 0.5 + 0.5 * n.y;
        vec3 albedo = vColor;
      #ifdef FISH
        // back → side → belly gradient by local height (geometry is 1 unit long, |y| ≲ 0.23)
        float hgt = vLocal.y;
        float tb = smoothstep(0.12, -0.02, hgt);   // back → side
        float ts = smoothstep(-0.03, -0.13, hgt);  // side → belly
        albedo = mix(mix(vColor, vSide, tb), vBelly, ts);
        float upper = 1.0 - ts; // 1 on back/sides, 0 on belly
        int pat = int(vPattern + 0.5);
        if (pat == 1) { // dark vertical bars, strongest on the sides, fade on the belly
          float bar = smoothstep(0.3, 0.55, abs(fract(vLocal.x * 8.0 + 0.25) - 0.5) * 2.0);
          albedo *= mix(0.5, 1.0, bar) * upper + (1.0 - upper);
        } else if (pat == 2) { // light spots
          float sp = step(0.84, hash3(floor(vLocal * 24.0)));
          albedo = mix(albedo, albedo * 1.9 + 0.2, sp * upper);
        } else if (pat == 3) { // dark speckle / mottling
          float sp = step(0.8, hash3(floor(vLocal * 26.0)));
          albedo = mix(albedo, albedo * 0.4, sp * (0.3 + 0.7 * upper));
        } else if (pat == 4) { // dark lateral band of blotches (largemouth)
          float st = 1.0 - smoothstep(0.02, 0.05, abs(hgt + 0.02));
          float br = step(0.35, hash3(floor(vLocal * vec3(9.0, 1.0, 1.0))));
          albedo = mix(albedo, albedo * 0.3, st * br);
        } else if (pat == 5) { // dark saddles across the back (walleye)
          float sad = step(0.45, hash3(floor(vLocal * vec3(6.0, 1.0, 1.0)))) * smoothstep(-0.02, 0.1, hgt);
          albedo = mix(albedo, albedo * 0.55, sad);
        } else if (pat == 6) { // small black spots on the upper half (chinook)
          float sp = step(0.9, hash3(floor(vLocal * 30.0))) * smoothstep(-0.04, 0.06, hgt);
          albedo = mix(albedo, vec3(0.05), sp);
        } else if (pat == 8) { // musky: dark olive-brown bars, broken into dashes, strongest mid-side
          float bx = fract(vLocal.x * 7.0 + 0.3);
          float bar = 1.0 - smoothstep(0.22, 0.34, abs(bx - 0.5) * 2.0);
          float broken = step(0.3, hash3(floor(vLocal * vec3(7.0, 11.0, 1.0)) + 2.0)); // gaps in the bars
          float band = smoothstep(-0.12, -0.04, hgt) * (1.0 - smoothstep(0.06, 0.13, hgt));
          albedo = mix(albedo, vec3(0.16, 0.17, 0.09), bar * broken * band * 0.85);
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
        vec3 lit = base * (0.72 + 2.3 * beam) + uHighlight * 0.3 * beam + uHighlight * 0.9 * edge;
        // underwater fog by distance from camera
        float dist = length(vWorld - cameraPosition);
        float fog = 1.0 - exp(-dist * uFogDensity);
        fog *= 1.0 - 0.7 * beam; // the beam also cuts through the murk
        vec3 col = mix(lit, uFogColor, clamp(fog, 0.0, 0.92));
        // sonar pass alpha: 1 = fish, 0.5 = structure (timber, rocks, wrecks), 0 = bottom
        float isFish = 0.0;
      #ifdef STRUCTURE
        isFish = 0.5;
      #endif
      #ifdef FISH
        isFish = 1.0;
        // rim light on fish caught in the beam — a bright edge, like a spotlight from behind
        vec3 V = normalize(cameraPosition - vWorld);
        float rim = pow(1.0 - max(dot(n, V), 0.0), 2.2);
        col += uHighlight * rim * beam * 1.6 + vec3(1.0, 0.98, 0.9) * pow(rim, 6.0) * beam * 1.2;
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
      if (s.box) u.uBox.value[k].set(s.box.xMin, s.box.xMax, s.box.yMax); else u.uBox.value[k].set(-1e5, 1e5, 1e5)
    })
  }
}
