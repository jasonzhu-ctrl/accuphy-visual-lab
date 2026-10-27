// Falling snow: one Points cloud that drifts with the wind and wraps inside a box around the camera's target.
// Soft round flakes, bigger near the camera, fading out far away and right at the lens.
// Options (all default to the old behaviour):
//   follow  — centre the box on the camera itself (a quarter box ahead along the view), so after a hop the flakes are
//             still in front of the lens; uCenter.y stays the box's floor
//   windMul — how much the surface wind carries the flakes (0 for marine snow under the ice: no wind down there)
//   skyLit  — light the flakes by the sky (uSkyHorizon) and the shelter lamp (uLamp, uLampColor), so at dusk they are
//             about as bright as the lit snow on the ice — a little above the sky behind them — and never brighter
//             than the cabin lights (M32)
// The wrap is in world space: a flake keeps its place when the centre moves (no jump while the camera travels).
import * as THREE from 'three'
import { WIND } from './iceScene'

export function makeSnowfall(count = 2600, box = new THREE.Vector3(110, 34, 110), { speed = 1, size = 1, alpha = 1, color = '#eef3f8', windMul = 1, follow = false, skyLit = false } = {}) {
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
    uniforms: {
      uTime: { value: 0 }, uWind: { value: WIND.clone() }, uCenter: { value: new THREE.Vector3() }, uBox: { value: box }, uAmount: { value: 0.6 },
      uColor: { value: new THREE.Color(color) }, uPixelRatio: { value: 1 }, uSpeed: { value: speed }, uSize: { value: size }, uAlphaMul: { value: alpha }, uClipZ: { value: 1e5 },
      uWindMul: { value: windMul }, uFollow: { value: follow ? 1 : 0 }, uSkyLit: { value: skyLit ? 1 : 0 },
      uSkyHorizon: { value: new THREE.Color('#7d82a6') }, uLamp: { value: new THREE.Vector4(0, 0, 0, 0) }, uLampColor: { value: new THREE.Color('#ffb060') },
    },
    vertexShader: /* glsl */ `
      attribute float aSeed; uniform float uTime; uniform vec2 uWind; uniform vec3 uCenter; uniform vec3 uBox; uniform float uAmount; uniform float uPixelRatio; uniform float uSpeed; uniform float uSize; uniform float uAlphaMul;
      uniform float uWindMul; uniform float uFollow; uniform float uSkyLit; uniform vec3 uSkyHorizon; uniform vec4 uLamp; uniform vec3 uLampColor;
      varying float vAlpha; varying float vZ; varying vec3 vLight;
      void main() {
        float s = aSeed;
        vec3 p = position;
        float fall = (0.75 + 0.7 * s) * uSpeed;
        p.y = mod(p.y - uTime * fall, uBox.y);
        float w = (1.4 + 1.2 * s) * uSpeed * uWindMul;
        p.x += uTime * uWind.x * w + sin(uTime * (0.8 + s) + s * 31.0) * 0.5;
        p.z += uTime * uWind.y * w + cos(uTime * (0.7 + s * 1.3) + s * 17.0) * 0.5;
        vec3 c = uCenter;
        if (uFollow > 0.5) { // the camera's ground point, a quarter box ahead along the view (viewMatrix row 2 = -forward)
          vec2 f = normalize(-vec2(viewMatrix[0][2], viewMatrix[2][2]) + vec2(1e-4, 0.0));
          c = vec3(cameraPosition.x + f.x * uBox.x * 0.25, uCenter.y, cameraPosition.z + f.y * uBox.z * 0.25);
        }
        vec3 wp = vec3(c.x + mod(p.x - c.x + uBox.x * 0.5, uBox.x) - uBox.x * 0.5, p.y + c.y, c.z + mod(p.z - c.z + uBox.z * 0.5, uBox.z) - uBox.z * 0.5);
        vZ = wp.z;
        vec4 mv = viewMatrix * modelMatrix * vec4(wp, 1.0);
        float dist = -mv.z;
        float px = clamp((2.6 + 4.5 * s) * uSize * uPixelRatio * (48.0 / dist), 1.0, 11.0 * uPixelRatio);
        gl_PointSize = px;
        // big near flakes are soft bokeh, not white coins: the larger the disc, the fainter
        vAlpha = uAmount * uAlphaMul * (0.35 + 0.55 * s) * smoothstep(2.0, 12.0, dist) * (1.0 - smoothstep(70.0, 120.0, dist)) * mix(1.0, 0.6, smoothstep(7.0, 11.0, px / uPixelRatio));
        vLight = vec3(1.0);
        if (uSkyLit > 0.5) {
          float dl = length(wp - uLamp.xyz);
          vLight = min(max(uSkyHorizon * 2.4, vec3(0.16)) + uLampColor * uLamp.w * 0.9 / (1.0 + dl * dl * 0.25), vec3(1.0));
        }
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      precision mediump float; uniform vec3 uColor; uniform float uClipZ; varying float vAlpha; varying float vZ; varying vec3 vLight;
      void main() {
        if (vZ > uClipZ) discard;
        float d = length(gl_PointCoord - 0.5);
        float a = pow(1.0 - smoothstep(0.06, 0.5, d), 1.2) * vAlpha; // a soft disc: bright core, no hard rim
        if (a < 0.01) discard;
        gl_FragColor = vec4(pow(uColor * vLight, vec3(1.0 / 2.2)), a); // linear -> display, like the ice sheet
      }
    `,
  })
  const pts = new THREE.Points(geo, mat)
  pts.frustumCulled = false
  pts.renderOrder = 5
  pts.userData.uniforms = mat.uniforms
  return pts
}
