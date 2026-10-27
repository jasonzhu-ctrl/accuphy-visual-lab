import * as THREE from 'three'

// One material for everything under water: lambert + hemisphere light,
// depth/distance fog, and the "beam reveal": fragments inside a beam wedge are
// lit up. Wedges are described exactly like wedge.js builds them:
//   p = worldPos - apex; u = p·c, v = p·h, w = p·n
//   inside ⇔ r=|(u,v)| < R, atan(v,u) ∈ [a0,a1], w ∈ [s0,s1]·u·tan(theta)
export const MAX_BEAMS = 2
// the summer lake's clock for the light patterns on the shallows (one uniform shared by every lake material; Scene.jsx
// Water advances it)
export const LAKE_TIME = { value: 0 }

export function makeLakeMaterial({ fish = false, structure = false, steel = false, wood = false, logo = false } = {}) {
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
    uFishEchoSize: { value: 1.0 }, // the fish-echo test page's ?fishsize= (#153)
    uHighlight: { value: new THREE.Color('#7fe6ff') },
    uRevealGain: { value: 1.0 }, // ice scene: a stronger lift inside the beam (the window in the snow must read lit)
    uClip: { value: new THREE.Vector2(0, 0) }, // ice section view: x = on, y = world z of the cut wall; fragments beyond it are cut away in the main view
    uOutGamma: { value: 1.0 },   // ice scene: < 1 brightens the dark water world a little (main view only)
    uAirView: { value: 0.0 },    // the summer lake (Scene.jsx): seen from above the water, the water column over each point tints it — shallows clear, deep water dark — and light patterns play on the shallows; 0 (the ice page, any camera under water): fog by distance as before
    uTime: LAKE_TIME,
    uFarFlash: { value: new THREE.Vector3(0, 30, 60) }, // dev (ads): a lift of the beam's far part — amount, from, to (metres from the apex); 0 = off
    uBeamGain: { value: 1.0 },   // ice scene: the signal gate (IceCamp.jsx s.signal): the lit footprint fades out while the Mini is out of the water
    uPanoLobe: { value: new THREE.Vector2(0, 0.61) }, // Panoramic as a sound picture (#171): x = on, y = the strip camera's depression (rad); the fish pass weights by the flat fan's lobe
    uSplat: { value: new THREE.Vector3(1, 1, 30) }, // sonar pass 3 (echo splat): tan(half width), tan(half thickness), range of the fan being drawn
    uSplatBig: { value: new THREE.Vector4(1, 0.7, 1, 0.5) }, // large-scale light and dark on big targets: steel contrast, wood contrast, steel facing, cells per metre (dev: window.__sonarTune.kb)
  }
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexColors: true,
    defines: fish ? { FISH: 1 } : logo ? { STRUCTURE: 1, LOGO: 1 } : steel ? { STRUCTURE: 1, STEEL: 1 } : wood ? { STRUCTURE: 1, WOOD: 1 } : structure ? { STRUCTURE: 1 } : {},
    vertexShader: /* glsl */ `
      varying vec3 vWorld; varying vec3 vNormal; varying vec3 vColor; varying vec3 vSplat; varying float vBad;
      uniform float uSonarPass; uniform vec3 uSplat;
      #ifdef FISH
        attribute float aPattern; attribute vec3 aBelly; attribute vec3 aSide;
        attribute vec4 aSwim; // per fish, set every frame in Scene.jsx: wave phase, activity, turn bend, wavelength
        varying float vPattern; varying vec3 vBelly; varying vec3 vSide; varying vec3 vLocal; varying vec2 vUv;
        varying float vLenF; // the fish's length (its instance scale), for the fish-echo pass
        uniform float uFishSonarScale; uniform float uFishEchoSize; uniform vec2 uPanoLobe;
      #endif
      void main() {
        vec3 pos = position, nrm = normal;
      #ifdef FISH
        vPattern = aPattern; vBelly = aBelly; vSide = aSide; vLocal = position; vUv = uv; // markings stay on the body; uv: body, eye or fin (fishGeometry.js)
        #ifdef USE_INSTANCING
          vLenF = length(instanceMatrix[0].xyz) * uFishSonarScale; // the true length (the lake draws fish ×2.6)
        #else
          vLenF = 0.4;
        #endif
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
        // the fish-echo pass (#153): the true size, not the lake's ×2.6, with the marks' bloom (a big fish's strong echo spills
        // into the neighbouring cells: a 1.1 m musky ×1.9, a bass ×1.1), never below 0.22 m (a bait fish is a point target the
        // beam smears into a speck; smaller, it fell between the image's cells), and the test page's ?fishsize= factor
        // A thin, far fish is thinner across the beam than the gap between the picture's beam samples (sonarShader fishImg: 0.4 σ
        // apart, σ = 0.6 × 0.014 rad) and fell between them as parallel strokes: its cross-section is made at least that thick.
        if (uSonarPass > 3.5) {
          float tl = max(vLenF, 0.01), ls = max(tl * (1.0 + 0.9 * smoothstep(0.3, 1.1, tl)), 0.22) * uFishEchoSize;
          vec3 ctr = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
          #ifdef USE_INSTANCING
            ctr = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
          #endif
          pos.yz *= max(1.0, 0.0045 * length(ctr - cameraPosition) / (0.25 * ls));
          pos *= uFishSonarScale * ls / tl;
        }
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
        // sonar pass 3 — the echo splat (2026-10-23, decision #135): every structure surface is drawn where the sonar would
        // place it, at (angle across the fan, range) instead of in perspective, with additive blending and no depth test,
        // so a hull's near side, deck, ribs and far side all return — the real picture of a wooden wreck (Jason: 船是半透明
        // 的整体). The strips (passes 1 and 2) still give the first and the far hit per row for the bottom and the shadows.
        vec4 vp = viewMatrix * wp;
        float zc = -vp.z;
        // a vertex at or behind the camera has no (angle, range): flag it, and the fragment discards the whole triangle
        // (one such vertex would otherwise stretch a triangle across the entire fan and flood the picture)
        vBad = zc < 0.3 ? 1.0 : 0.0;
        float zcs = max(zc, 0.3);
        vSplat = vec3((vp.x / zcs) / uSplat.x, (vp.y / zcs) / uSplat.y, length(vp.xyz));
      #ifdef FISH
        // the fish image has 256 rows over the fan's reach (SonarScreen FISH_H): at 160–230 ft a row is 0.2–0.3 m, and a far fish
        // seen side-on is only a few cm deep along the ray, so it fell on a row in one frame and between rows in the next (Jason
        // 2026-10-27: 中距离的鱼 … 会变得很闪也变小). Along the ray the body is made at least 5 rows deep about its centre (only
        // the half facing the sound returns, so ~2.5 rows show: 0.5 m at 160 ft); per fish the frame-to-frame swing fell from
        // 65 % to 34 %. It fades in from 30 to 45 m of reach (~100–150 ft), so the 80 ft default and nearer keep their picture.
        if (uSonarPass > 3.5 && uPanoLobe.x < 0.5) { // not the flat fan: Panoramic waits for Jason's pick (#176)
          #ifdef USE_INSTANCING
            mat4 mi = modelMatrix * instanceMatrix;
          #else
            mat4 mi = modelMatrix;
          #endif
          vec3 cw = (mi * vec4(0.0, 0.0, 0.0, 1.0)).xyz, ax = normalize(mat3(mi) * vec3(1.0, 0.0, 0.0));
          float rc = length((viewMatrix * vec4(cw, 1.0)).xyz);
          float along = abs(dot(ax, normalize(cw - cameraPosition)));
          float tl2 = uFishSonarScale * length(mi[0].xyz), ls2 = max(tl2 * (1.0 + 0.9 * smoothstep(0.3, 1.1, tl2)), 0.22) * uFishEchoSize;
          float ext = 1.2 * ls2 * (0.15 + 0.85 * along); // the drawn body's depth along the ray, roughly (side-on: its width; head-on: its length)
          float dMin = 5.0 * uSplat.z / 256.0 * smoothstep(30.0, 45.0, uSplat.z);
          vSplat.z = rc + (vSplat.z - rc) * max(1.0, dMin / ext);
        }
      #endif
        if (uSonarPass > 2.5) gl_Position = vec4(vSplat.x, (vSplat.z / uSplat.z) * 2.0 - 1.0, 0.0, 1.0);
        else gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec3 vWorld; varying vec3 vNormal; varying vec3 vColor; varying vec3 vSplat; varying float vBad;
      uniform vec3 uSun; uniform vec3 uFogColor; uniform float uFogDensity;
      uniform int uBeamCount;
      uniform vec3 uApex[${MAX_BEAMS}]; uniform vec3 uC[${MAX_BEAMS}]; uniform vec3 uH[${MAX_BEAMS}]; uniform vec3 uN[${MAX_BEAMS}];
      uniform vec4 uAng[${MAX_BEAMS}]; uniform vec2 uRT[${MAX_BEAMS}]; uniform vec4 uBox[${MAX_BEAMS}];
      uniform vec4 uSplatBig; uniform vec2 uPanoLobe; uniform vec3 uSplat;
      uniform float uReveal; uniform vec3 uHighlight; uniform float uSonarPass; uniform float uRevealGain; uniform float uOutGamma; uniform vec2 uClip; uniform float uBeamGain; uniform vec3 uFarFlash;
      uniform float uAirView; uniform float uTime;
      float lhash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float lnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(lhash(i), lhash(i + vec2(1, 0)), f.x), mix(lhash(i + vec2(0, 1)), lhash(i + vec2(1, 1)), f.x), f.y); }
      // light patterns on the shallows (caustics): two ridged noise layers drifting across each other draw the bright
      // net of a sunlit lake floor, cells ~2 m (from the 3D camera finer ones only shimmer)
      float caustic(vec2 p, float t) {
        float a = 1.0 - abs(2.0 * lnoise(p * 0.55 + vec2(t * 0.11, t * 0.07)) - 1.0);
        float b = 1.0 - abs(2.0 * lnoise(p * 0.47 * mat2(0.8, -0.6, 0.6, 0.8) - vec2(t * 0.06, t * 0.12)) - 1.0);
        return pow(a, 7.0) + pow(b, 7.0) + 2.0 * pow(a * b, 4.0);
      }
      #ifdef FISH
        varying float vPattern; varying vec3 vBelly; varying vec3 vSide; varying vec3 vLocal; varying vec2 vUv;
        varying float vLenF;
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
        if (uSonarPass > 2.5) { // the echo splat: structure only (the lockup has its own analytic echo)
      #if defined(STRUCTURE) && !defined(LOGO)
          if (vBad > 0.0 || abs(vSplat.x) > 1.0 || abs(vSplat.y) > 1.0) discard;
          float lobe = 0.3 + 0.7 * pow(1.0 - abs(vSplat.y), 1.6); // a floor: a branch leaving the slab's centre plane fades, it does not break off (Jason 2026-10-24: 树枝结构更完整)                       // the beam's main lobe across the slab
          float facing = abs(dot(normalize(vNormal), normalize(cameraPosition - vWorld))); // faces square to the sound return more
          // 12 cm speckle fixed to the object, the same in every direction (no bands along a trunk); smooth value noise, not
          // hashed cells: the cells' hard edges drew blocks in crowns and stripes in rocks (Jason 2026-10-24: 马赛克)
          vec3 q = vWorld * 8.0, qi = floor(q), qf = fract(q); qf = qf * qf * (3.0 - 2.0 * qf);
          #define H3(o) fract(sin(dot(qi + o, vec3(127.1, 311.7, 74.7))) * 43758.5453)
          float g = mix(mix(mix(H3(vec3(0.0)), H3(vec3(1.0, 0.0, 0.0)), qf.x), mix(H3(vec3(0.0, 1.0, 0.0)), H3(vec3(1.0, 1.0, 0.0)), qf.x), qf.y),
                        mix(mix(H3(vec3(0.0, 0.0, 1.0)), H3(vec3(1.0, 0.0, 1.0)), qf.x), mix(H3(vec3(0.0, 1.0, 1.0)), H3(vec3(1.0)), qf.x), qf.y), qf.z);
          #undef H3
          float amp = 0.14; // timber, rock
        #ifdef WOOD
          amp = 0.12;        // planking: each surface a little weaker, but there are many
        #endif
        #ifdef STEEL
          amp = 0.22;        // steel rings
        #endif
          // Large-scale light and dark over a big target (Jason 2026-10-24: 大面积的一个东西 … 中间一定是有亮的, 你不可能那么
          // 均匀的, 你的偏暗): on the recording's wreck, regions ~1–2 m across are much brighter (5–19 % of the core, large-scale
          // CoV 0.25–0.33; ours 0.13–0.15) — plates square to the sonar and overlapping parts of the hull. A ~2 m value noise
          // fixed to the object (centred, the average stays) on hulls, and for steel a stronger facing term.
          vec3 qb = vWorld * uSplatBig.w, bi = floor(qb), bf = fract(qb); bf = bf * bf * (3.0 - 2.0 * bf);
          #define HB(o) fract(sin(dot(bi + o, vec3(41.3, 289.1, 157.7))) * 24634.6345)
          float big = mix(mix(mix(HB(vec3(0.0)), HB(vec3(1.0, 0.0, 0.0)), bf.x), mix(HB(vec3(0.0, 1.0, 0.0)), HB(vec3(1.0, 1.0, 0.0)), bf.x), bf.y),
                          mix(mix(HB(vec3(0.0, 0.0, 1.0)), HB(vec3(1.0, 0.0, 1.0)), bf.x), mix(HB(vec3(0.0, 1.0, 1.0)), HB(vec3(1.0)), bf.x), bf.y), bf.z);
          #undef HB
          float bigK = 0.0, faceW = 0.22; // timber and rock: unchanged
        #ifdef WOOD
          bigK = uSplatBig.y;
        #endif
        #ifdef STEEL
          bigK = uSplatBig.x; faceW = 0.22 + 0.4 * uSplatBig.z;
        #endif
          float bigF = 1.0 + bigK * (1.3 * smoothstep(0.3, 0.75, big) - 0.6); // centred: the average stays
          float ev = amp * (1.0 - faceW + faceW * facing) * (0.55 + 0.9 * g) * lobe; // speckle floor 0.3 → 0.55: a thin branch no longer drops out cell by cell (Jason 2026-10-24: 树枝中间有断掉的点)
          float steelShare = 0.0, woodShare = 0.0;
        #ifdef STEEL
          steelShare = 1.0;
        #endif
        #ifdef WOOD
          woodShare = 1.0;
        #endif
          gl_FragColor = vec4(ev, ev * steelShare, ev * woodShare, 0.5 * ev * bigF); // g and b carry the steel and wood shares: each material has its own core level; a the large-scale factor, applied after fanEcho's knee (inside the splat a summed hull saturates and flattens it) // facing weak: a low-poly crown must not show its facets as bands (Jason 2026-10-23: 树一棱一棱有断层)
          return;
      #elif defined(FISH)
          // the fish-echo test page (#153, uSonarPass 4, SonarScreen.jsx): the fish as the transducer sees it — like a camera
          // at the apex, only the surfaces facing the sound return (Jason 2026-10-24: 远的时候能照到的就是鱼背 … 越来越近的时候
          // 照到它的身体就相对更完整). Drawn at (angle across the fan, range) with MAX blending: each cell keeps its strongest
          // surface, so the result does not depend on how finely the body is tessellated. Strongest square-on, the swim
          // bladder's part of the body brightest, fins and eyes weak, bigger fish a little stronger.
          if (uSonarPass < 3.5 || vBad > 0.0 || abs(vSplat.x) > 1.0 || abs(vSplat.y) > 1.0) discard;
          float lobeF = 0.3 + 0.7 * pow(1.0 - abs(vSplat.y), 1.6);
          if (uPanoLobe.x > 0.5) { // the flat fan (#171): 5°–25° below the horizon, a weaker sidelobe to ~60° (sonarShader panoLobe)
            float g = uPanoLobe.y - atan(vSplat.y * uSplat.y);
            lobeF = smoothstep(0.035, 0.105, g) * (1.0 - smoothstep(0.4, 0.49, g)) + 0.8 * smoothstep(0.4, 0.49, g) * (1.0 - smoothstep(0.62, 1.05, g));
          }
          float faceF = dot(normalize(vNormal), normalize(cameraPosition - vWorld));
          bool finF = vUv.x < -1.5, eyeF = vUv.x < -0.5 && vUv.x > -1.5;
          if (finF) faceF = abs(faceF); // a fin is one sheet: either side returns
          if (faceF <= 0.0) discard;   // the side turned away from the sound (the body hides it)
          float bladder = exp(-pow((vLocal.x - 0.05) / 0.2, 2.0)); // the swim bladder carries ~90 % of a fish's echo: far fish read as its compact spot (LiveScope: needles 0.1–0.15 m along the ray), near ones still show the body
          // Jason 2026-10-25 on the first preview: near fish only as a soft body — "鱼鳍、鱼尾巴都看得出来 … 不可能那么清晰"; past
          // 20–30 ft no fish shape at all. Fins are thin membranes and hardly return; the rest of the body fades out between
          // 6 and 9 m, leaving the bladder's compact spot (the beam turns it into the old marks' needle).
          float bodyF = mix(0.32, 0.05, smoothstep(6.0, 9.0, vSplat.z));
          float evF = lobeF * (0.3 + 0.7 * faceF * faceF) * (finF ? 0.04 : bodyF + 0.9 * bladder) * clamp(0.75 + 1.1 * vLenF, 0.85, 1.6); // small fish keep a visible speck (bait schools), big ones stronger
          gl_FragColor = vec4(evF, evF, evF, 1.0);
          return;
      #else
          discard;
      #endif
        }
        if (uClip.x > 0.5 && uSonarPass < 0.5 && vWorld.z > uClip.y) discard; // the section cut (the sonar still sees the whole lake)
      #ifndef STRUCTURE
        if (uSonarPass > 1.5) discard; // the far-face pass (back faces, sonarShader uDepthB): only structure has a far side
      #endif
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
        // procedural surface texture (#136: this ran after base had been taken from albedo, so it never showed): fine
        // speckle on everything but fish, and bark grooves on brown (timber) surfaces, following the trunk
      #ifndef FISH
        float tex = 0.9 + 0.2 * fract(sin(dot(floor(vWorld * 9.0), vec3(12.9898, 78.233, 37.719))) * 43758.5453);
        albedo *= tex;
      #endif
      #ifdef STRUCTURE
        // bark grooves on brown (timber) surfaces, following the trunk. Structure only: on the sandy lakebed, which is brown
        // too, they drew long curved wood-grain stripes over the whole bottom (Jason 2026-10-25: 水面 … 看着是挺奇怪的，可能跟
        // 底部的纹理有关)
        float brown = smoothstep(0.02, 0.08, vColor.r - vColor.b);
        float groove = fract(sin(dot(floor(vec2(atan(vWorld.z, vWorld.x) * 40.0 + vWorld.x * 3.0, vWorld.y * 1.2)), vec2(12.9898, 78.233))) * 43758.5453);
        albedo *= 1.0 - brown * 0.28 * groove;
      #endif
      #if !defined(FISH) && !defined(STRUCTURE)
        // the bed: soft patches a few metres across instead of the 2 m vertex-colour blotches alone
        albedo *= 0.86 + 0.28 * (0.6 * lnoise(vWorld.xz * 0.21 + 3.1) + 0.4 * lnoise(vWorld.xz * 0.63 - 1.7));
      #endif
        vec3 base = albedo * (0.28 + 0.42 * hemi + 0.6 * lambert);
        // dim everything under water a little; the beam brings it back
        float beam = 0.0, wide = 0.0;
        for (int k = 0; k < ${MAX_BEAMS}; k++) { if (k < uBeamCount) { beam = max(beam, insideBeam(k, vWorld, 0.0)); wide = max(wide, insideBeam(k, vWorld, 0.02)); } }
        beam *= uReveal;
        float edge = clamp(wide - beam, 0.0, 1.0) * uReveal; // thin bright rim where the beam footprint ends
        beam *= uBeamGain; edge *= uBeamGain; // the signal gate (1 on the summer lake): after the rim, so the rim fades too instead of widening
        // outside the beam things stay murky; inside they pop (Garmin look)
        vec3 lit = base * (0.72 + 2.3 * beam * uRevealGain) + uHighlight * 0.3 * beam * uRevealGain + uHighlight * 0.9 * edge;
        if (uFarFlash.x > 0.0) lit += (base * 2.4 + uHighlight * 0.25) * beam * uFarFlash.x * smoothstep(uFarFlash.y, uFarFlash.z, distance(vWorld, uApex[0])); // dev (ads): the far targets light up
      #ifdef LOGO
        // the brand mark keeps Accuphy blue: a gentler beam lift, no cyan wash (the ×3 lift clipped it to cyan)
        lit = base * (0.95 + 0.85 * beam) + uHighlight * 0.06 * beam + uHighlight * 0.5 * edge;
      #endif
        // underwater fog by distance from camera
        float dist = length(vWorld - cameraPosition);
        float fog = 1.0 - exp(-dist * uFogDensity);
        if (uAirView > 0.5 && cameraPosition.y > 0.0 && uSonarPass < 0.5) {
          // Seen from above (Jason 2026-10-25: 水面的效果不够逼真): what dims a point is the water above it — down from the
          // surface and back up toward the eye — not the distance to the camera, which gave the shallows and the deep basin
          // one even veil. Shallows read clear and a little green-gold, the slope darkens, the deep floor sinks into the
          // water's colour; a little haze by distance stays. The ACCUPHY LAB lockup keeps today's legibility, the wrecks an outline.
          float dep = max(-vWorld.y, 0.0);
          float cosV = clamp((cameraPosition.y - vWorld.y) / dist, 0.25, 1.0);
          float L = dep * (1.0 + 1.0 / cosV);
          fog = 1.0 - exp(-L * 0.022) * exp(-dist * uFogDensity * 0.35);
          lit *= exp(-L * vec3(0.03, 0.008, 0.004)); // red goes first
          // sunlight patterns on the shallows, fading out by ~6 m and on steep or shaded faces
          float cz = caustic(vWorld.xz, uTime) * exp(-dep / 3.2) * smoothstep(0.3, 0.9, n.y) * lambert;
          lit += albedo * cz * 0.55;
        #ifdef LOGO
          fog = min(fog, 0.55);
        #endif
        #if defined(WOOD) || defined(STEEL)
          fog = min(fog, 0.62); // the two wrecks keep a readable outline from above
        #endif
        }
        fog *= 1.0 - 0.7 * beam; // the beam also cuts through the murk
        vec3 col = mix(lit, uFogColor, clamp(fog, 0.0, 0.92));
        if (uSonarPass < 0.5 && uOutGamma != 1.0) col = pow(max(col, 0.0), vec3(uOutGamma));
        // sonar pass alpha: 1 = fish, 0.75 = steel (wrecks), 0.6 = wooden / open structure (a wooden hull: lit right through),
        // 0.5 = other structure (timber, rocks), 0 = bottom
        float isFish = 0.0;
      #ifdef STRUCTURE
        isFish = 0.5;
      #endif
      #ifdef WOOD
        isFish = 0.6;
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
