// Falling snow: one Points cloud that drifts with the wind and wraps inside a box around the camera's target.
// Soft round flakes, bigger near the camera, fading out far away and right at the lens.
import * as THREE from 'three'
import { WIND } from './iceScene'

export function makeSnowfall(count = 2600, box = new THREE.Vector3(110, 34, 110), { speed = 1, size = 1, alpha = 1, color = '#eef3f8' } = {}) {
  const pos = new Float32Array(count * 3), seed = new Float32Array(count)
  let s = 4242
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (rnd() - 0.5) * box.x; pos[i * 3 + 1] = rnd() * box.y; pos[i * 3 + 2] = (rnd() - 0.5) * box.z
    seed[i] = rnd()
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uWind: { value: WIND.clone() }, uCenter: { value: new THREE.Vector3() }, uBox: { value: box }, uAmount: { value: 0.6 }, uColor: { value: new THREE.Color(color) }, uPixelRatio: { value: 1 }, uSpeed: { value: speed }, uSize: { value: size }, uAlphaMul: { value: alpha }, uClipZ: { value: 1e5 } },
    vertexShader: /* glsl */ `
      attribute float aSeed; uniform float uTime; uniform vec2 uWind; uniform vec3 uCenter; uniform vec3 uBox; uniform float uAmount; uniform float uPixelRatio; uniform float uSpeed; uniform float uSize; uniform float uAlphaMul;
      varying float vAlpha; varying float vZ;
      void main() {
        float s = aSeed;
        vec3 p = position;
        float fall = (0.75 + 0.7 * s) * uSpeed;
        p.y = mod(p.y - uTime * fall, uBox.y);
        float w = (1.4 + 1.2 * s) * uSpeed;
        p.x += uTime * uWind.x * w + sin(uTime * (0.8 + s) + s * 31.0) * 0.5;
        p.z += uTime * uWind.y * w + cos(uTime * (0.7 + s * 1.3) + s * 17.0) * 0.5;
        p.x = mod(p.x + uBox.x * 0.5, uBox.x) - uBox.x * 0.5;
        p.z = mod(p.z + uBox.z * 0.5, uBox.z) - uBox.z * 0.5;
        vZ = p.z + uCenter.z;
        vec4 mv = modelViewMatrix * vec4(p + uCenter, 1.0);
        float dist = -mv.z;
        gl_PointSize = clamp((2.6 + 4.5 * s) * uSize * uPixelRatio * (48.0 / dist), 1.0, 16.0);
        vAlpha = uAmount * uAlphaMul * (0.35 + 0.55 * s) * smoothstep(1.5, 9.0, dist) * (1.0 - smoothstep(70.0, 120.0, dist));
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      precision mediump float; uniform vec3 uColor; uniform float uClipZ; varying float vAlpha; varying float vZ;
      void main() { if (vZ > uClipZ) discard; float d = length(gl_PointCoord - 0.5); float a = (1.0 - smoothstep(0.18, 0.5, d)) * vAlpha; if (a < 0.01) discard; gl_FragColor = vec4(pow(uColor, vec3(1.0 / 2.2)), a); }
    `,
  })
  const pts = new THREE.Points(geo, mat)
  pts.frustumCulled = false
  pts.renderOrder = 5
  pts.userData.uniforms = mat.uniforms
  return pts
}
