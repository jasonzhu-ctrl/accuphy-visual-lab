import * as THREE from 'three'

// One material for everything under water: lambert + hemisphere light,
// depth/distance fog, and the "beam reveal": fragments inside a beam wedge are
// lit up. Wedges are described exactly like wedge.js builds them:
//   p = worldPos - apex; u = p·c, v = p·h, w = p·n
//   inside ⇔ r=|(u,v)| < R, atan(v,u) ∈ [a0,a1], w ∈ [s0,s1]·u·tan(theta)
export const MAX_BEAMS = 2

export function makeLakeMaterial({ fish = false } = {}) {
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
    uReveal: { value: 1.0 },
    uHighlight: { value: new THREE.Color('#7fe6ff') },
  }
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexColors: true,
    defines: fish ? { FISH: 1 } : {},
    vertexShader: /* glsl */ `
      varying vec3 vWorld; varying vec3 vNormal; varying vec3 vColor;
      #ifdef FISH
        attribute float aPattern; attribute vec3 aBelly;
        varying float vPattern; varying vec3 vBelly; varying vec3 vLocal;
      #endif
      void main() {
      #ifdef FISH
        vPattern = aPattern; vBelly = aBelly; vLocal = position;
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
        vec4 wp = m * vec4(position, 1.0);
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
      uniform vec4 uAng[${MAX_BEAMS}]; uniform vec2 uRT[${MAX_BEAMS}];
      uniform float uReveal; uniform vec3 uHighlight;
      #ifdef FISH
        varying float vPattern; varying vec3 vBelly; varying vec3 vLocal;
        float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
      #endif

      float insideBeam(int k, vec3 p) {
        vec3 d = p - uApex[k];
        float u = dot(d, uC[k]), v = dot(d, uH[k]), w = dot(d, uN[k]);
        float r = length(vec2(u, v));
        float ang = atan(v, u);
        float soft = 0.04; // radians of edge softness
        float inA = smoothstep(uAng[k].x - soft, uAng[k].x + soft, ang) * (1.0 - smoothstep(uAng[k].y - soft, uAng[k].y + soft, ang));
        float lim = max(u, 0.0) * uRT[k].y;
        float lo = uAng[k].z * lim, hi = uAng[k].w * lim;
        float sw = max(0.15, 0.06 * lim);
        float inW = smoothstep(lo - sw, lo + sw, w) * (1.0 - smoothstep(hi - sw, hi + sw, w));
        float inR = 1.0 - smoothstep(uRT[k].x - 1.0, uRT[k].x, r);
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
        // back → belly gradient by local height (fish geometry is 1 unit long, y in [-0.18, 0.18])
        float t = smoothstep(0.08, -0.14, vLocal.y);
        albedo = mix(vColor, vBelly, t);
        // markings: 1 vertical bars, 2 light spots, 3 dark spots, 4 dark lateral stripe
        if (vPattern > 0.5 && vPattern < 1.5) { float bar = smoothstep(0.35, 0.5, abs(fract(vLocal.x * 9.0) - 0.5) * 2.0); albedo *= mix(0.55, 1.0, bar) * (1.0 - 0.6 * t) + 0.6 * t; }
        if (vPattern > 1.5 && vPattern < 2.5) { float sp = step(0.86, hash3(floor(vLocal * 22.0))); albedo = mix(albedo, albedo * 1.7 + 0.15, sp * (1.0 - t)); }
        if (vPattern > 2.5 && vPattern < 3.5) { float sp = step(0.88, hash3(floor(vLocal * 26.0))); albedo = mix(albedo, albedo * 0.35, sp * (1.0 - t * 0.8)); }
        if (vPattern > 3.5) { float st = 1.0 - smoothstep(0.02, 0.05, abs(vLocal.y + 0.01)); float br = step(0.5, hash3(floor(vLocal * vec3(10.0, 1.0, 1.0)))); albedo = mix(albedo, albedo * 0.35, st * br); }
      #endif
        vec3 base = albedo * (0.28 + 0.42 * hemi + 0.6 * lambert);
        // dim everything under water a little; the beam brings it back
        float beam = 0.0;
        for (int k = 0; k < ${MAX_BEAMS}; k++) { if (k < uBeamCount) beam = max(beam, insideBeam(k, vWorld)); }
        beam *= uReveal;
        // outside the beam things stay murky; inside they pop (Garmin look)
        vec3 lit = base * (0.72 + 2.3 * beam) + uHighlight * 0.3 * beam;
        // underwater fog by distance from camera
        float dist = length(vWorld - cameraPosition);
        float fog = 1.0 - exp(-dist * uFogDensity);
        fog *= 1.0 - 0.7 * beam; // the beam also cuts through the murk
        vec3 col = mix(lit, uFogColor, clamp(fog, 0.0, 0.92));
        gl_FragColor = vec4(col, 1.0);
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
    })
  }
}
