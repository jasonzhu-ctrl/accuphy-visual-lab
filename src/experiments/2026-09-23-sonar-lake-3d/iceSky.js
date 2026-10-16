// A sky dome for the ice scene, procedural (no HDRI to download): a horizon-to-zenith gradient, a warm glow where
// the sun went down, stars that fade in, and — in the night preset — a slow aurora. Below the horizon it is the fog
// colour, so the far ice fades into it without a seam. Centred on the camera every frame (Scene.jsx).
import * as THREE from 'three'

export function makeSkyDome(radius = 1000) {
  const uniforms = {
    uTime: { value: 0 },
    uZenith: { value: new THREE.Color('#17213a') }, uHorizon: { value: new THREE.Color('#6b6f8e') }, uBelow: { value: new THREE.Color('#3b4a66') },
    uGlow: { value: new THREE.Color('#e08a5e') }, uGlowDir: { value: new THREE.Vector3(-0.8, 0, -0.45).normalize() },
    uStars: { value: 0.55 }, uAurora: { value: 0 },
  }
  const mat = new THREE.ShaderMaterial({
    uniforms, side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
    vertexShader: /* glsl */ `varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      precision highp float; varying vec3 vDir;
      uniform float uTime; uniform vec3 uZenith; uniform vec3 uHorizon; uniform vec3 uBelow; uniform vec3 uGlow; uniform vec3 uGlowDir; uniform float uStars; uniform float uAurora;
      float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
      float fbm(vec2 p) { return 0.5 * vnoise(p) + 0.25 * vnoise(p * 2.03 + 1.7) + 0.125 * vnoise(p * 4.1 + 3.1) + 0.0625 * vnoise(p * 8.3 + 5.3); }
      void main() {
        vec3 d = normalize(vDir);
        float el = d.y;
        // the gradient: horizon haze up to a deep zenith
        vec3 sky = mix(uHorizon, uZenith, pow(clamp(el * 1.6, 0.0, 1.0), 0.6));
        // the afterglow, low and toward the glow direction
        float az = max(dot(normalize(vec3(d.x, 0.0, d.z)), uGlowDir), 0.0);
        float glow = pow(az, 5.0) * exp(-max(el, 0.0) * 9.0) * 0.9;
        sky = mix(sky, uGlow, glow);
        // stars: a 3D hash grid, the brighter ones twinkling
        vec3 cellP = d * 320.0;
        float st = hash3(floor(cellP));
        float star = step(0.9965, st) * smoothstep(0.03, 0.2, el) * uStars;
        float tw = 0.6 + 0.4 * sin(uTime * (2.0 + st * 5.0) + st * 90.0);
        sky += vec3(0.9, 0.93, 1.0) * star * tw * (0.6 + 0.6 * step(0.999, st));
        // the aurora: slow green curtains with a violet top, between 12° and 55° up
        if (uAurora > 0.01) {
          float ang = atan(d.x, d.z);
          float band = fbm(vec2(ang * 2.2 + uTime * 0.03, el * 3.0 - uTime * 0.02)) * fbm(vec2(ang * 6.0 - uTime * 0.05, 1.7));
          float h = smoothstep(0.2, 0.42, el) * (1.0 - smoothstep(0.45, 0.85, el));
          float curtain = smoothstep(0.22, 0.5, band) * h;
          float ray = 0.6 + 0.4 * vnoise(vec2(ang * 40.0 + uTime * 0.2, el * 2.0));
          vec3 ac = mix(vec3(0.15, 0.95, 0.5), vec3(0.6, 0.3, 0.9), smoothstep(0.3, 0.75, el));
          sky += ac * curtain * ray * uAurora * 0.75;
        }
        vec3 col = el < 0.0 ? mix(uBelow, uHorizon, smoothstep(-0.05, 0.0, el) * 0.0 + exp(el * 40.0)) : sky;
        gl_FragColor = vec4(pow(max(col, 0.0), vec3(1.0 / 2.2)), 1.0);
      }
    `,
  })
  const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 24), mat)
  m.renderOrder = -100
  m.frustumCulled = false
  m.userData.uniforms = uniforms
  return m
}
