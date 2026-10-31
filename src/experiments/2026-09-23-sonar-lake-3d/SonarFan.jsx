// The selected view's fan: a small live sonar picture (Jason 2026-10-31: "可以"; approved trial /fx/). Black inside the fan, a bottom band of fine
// fibres, thin beam rays near the transducer, sparse fish marks, tiny specks; the grain refreshes 8 times a second and a soft brightness wave
// travels out from the transducer. The texture is ours, generated here. Garmin was a style reference only, none of its pixels are used.
// Colours are the app's accuphy_mid map. This is plain WebGL with one fragment shader, separate from the sonar shader.
// One context, only on the selected tile, released when the selection changes. Reduced motion: one still frame. No WebGL: a plain fan.
// Phones have no panel, so `live` is false and no context is made.
import { useEffect, useMemo, useRef, useState } from 'react'
import { COLORMAPS } from './colormaps'
import { fan } from './ViewIcon'

const FS = `precision highp float;uniform float t;uniform vec4 f[2];uniform float n;uniform float d;uniform float cssH;uniform vec2 ha;uniform float q;uniform sampler2D lut;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),q=fract(p);q=q*q*(3.-2.*q);return mix(mix(h(i),h(i+vec2(1,0)),q.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),q.x),q.y);}
void main(){vec2 c=vec2(gl_FragCoord.x,cssH*d-gl_FragCoord.y)/d;vec3 o=vec3(0.);float al=0.;
for(int i=0;i<2;i++){if(float(i)>=n)break;vec2 a=f[i].xy;float R=f[i].z,ang=f[i].w;vec2 p=c-a;float r=length(p);float th=atan(p.y,p.x)-ang;
float hw=(i==0?ha.x:ha.y);if(abs(th)>hw||r>R)continue;float u=r/R;
float pg=floor(t*8.);float e=smoothstep(hw,hw-.04,abs(th));
float wv=sin(pow(r/(50.*q),1.7)*7.-6.*t)*.5+.5;
float fib=vn(vec2(th*22.*q+pg*.03,u*150.*q));float fib2=vn(vec2(th*60.*q,u*60.*q+3.));
float bedR=.68+.05*sin(th*4.+1.)+.05*vn(vec2(th*7.,2.));
float bed=smoothstep(bedR-.02,bedR+.02,u)*(1.-smoothstep(bedR+.1,bedR+.26,u));
float bedV=bed*(.2+.6*fib*fib2+.28*fib);
float rays=exp(-u*11.)*pow(vn(vec2(th*38.*q,1.)),2.)*.9;
vec2 cl=vec2(th*9.,u*11.);vec2 ci=floor(cl);float hit=step(.8,h(ci+7.))*step(u,bedR-.1)*step(.12,u);vec2 cf=fract(cl)-.5-(vec2(h(ci),h(ci+3.))-.5)*.4;float blob=hit*exp(-(cf.x*cf.x*18.+cf.y*cf.y*70.))*.72;
float speck=pow(h(floor(c*d*.8)+pg*.011),60.)*.5;
float v=max(max(bedV,rays),blob)+speck;v*=(.72+.38*wv)*e;v=min(v*1.2,.86);
vec3 col=texture2D(lut,vec2(clamp(v,0.,.995),.5)).rgb;o=max(o,col);al=1.;}
gl_FragColor=vec4(o,al);}`
const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'
const FPS_MS = 1000 / 30 // half the display rate: the wave stays smooth and the lake keeps the GPU
const TRIAL_R = 74 // the approved trial's fan radius: the texture is scaled by this so it stays fine, not noisy, on a smaller fan
const rad = (a) => (a * Math.PI) / 180

const lutBytes = () => {
  const src = COLORMAPS.accuphy_mid, out = new Uint8Array(1024)
  for (let i = 0; i < 256; i++) out.set([src[i * 3] * 255, src[i * 3 + 1] * 255, src[i * 3 + 2] * 255, 255], i * 4)
  return out
}

function start(canvas, beams, unit) {
  const d = Math.min(2, window.devicePixelRatio || 1), cssW = canvas.clientWidth, cssH = canvas.clientHeight
  canvas.width = Math.round(cssW * d); canvas.height = Math.round(cssH * d)
  const g = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true, antialias: false, depth: false, stencil: false })
  if (!g) return null
  const sh = (type, src) => { const s = g.createShader(type); g.shaderSource(s, src); g.compileShader(s); return s }
  const pr = g.createProgram(); g.attachShader(pr, sh(g.VERTEX_SHADER, VS)); g.attachShader(pr, sh(g.FRAGMENT_SHADER, FS)); g.linkProgram(pr)
  if (!g.getProgramParameter(pr, g.LINK_STATUS)) return null
  g.useProgram(pr)
  g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer()); g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW)
  const loc = g.getAttribLocation(pr, 'p'); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0)
  g.bindTexture(g.TEXTURE_2D, g.createTexture()); g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, 256, 1, 0, g.RGBA, g.UNSIGNED_BYTE, lutBytes())
  g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR)
  g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE)
  const fans = []; beams.forEach((b) => fans.push(b.x * unit, b.y * unit, b.R * unit, rad(b.aim))); while (fans.length < 8) fans.push(0)
  const u = (n) => g.getUniformLocation(pr, n)
  g.uniform4fv(u('f'), new Float32Array(fans)); g.uniform1f(u('n'), beams.length); g.uniform1f(u('d'), d); g.uniform1f(u('cssH'), cssH)
  g.uniform2f(u('ha'), rad(beams[0].deg / 2), rad((beams[1] || beams[0]).deg / 2))
  g.uniform1f(u('q'), Math.min(1, (Math.max(...beams.map((b) => b.R)) * unit) / TRIAL_R))
  g.viewport(0, 0, canvas.width, canvas.height)
  const ut = u('t'), still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const paint = (ms) => { g.clearColor(0, 0, 0, 0); g.clear(g.COLOR_BUFFER_BIT); g.uniform1f(ut, ms / 1000); g.drawArrays(g.TRIANGLES, 0, 3) }
  let raf = 0, last = -FPS_MS
  const loop = (ms) => { raf = requestAnimationFrame(loop); if (ms - last >= FPS_MS) { last = ms; paint(ms) } }
  if (still) paint(4000); else raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); g.getExtension('WEBGL_lose_context')?.loseContext() }
}

export default function SonarFan({ beams, live, width, height }) {
  const canvas = useRef(null)
  const [plain, setPlain] = useState(false)
  const mask = useMemo(() => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${beams.map((b) => `<path d="${fan(b.x, b.y, b.aim, b.deg, b.R)}"/>`).join('')}</svg>`)}")`, [beams, width, height])
  useEffect(() => {
    if (!live) return
    let stop = null
    try { stop = start(canvas.current, beams, canvas.current.clientWidth / width) } catch { stop = null }
    setPlain(!stop)
    return () => stop?.()
  }, [live, mask]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!live) return null
  return (<>
    <canvas key={mask} ref={canvas} className="ac-fan-live" aria-hidden="true" /> {/* a new canvas per fan: a released context cannot be used again */}
    {plain && <span className="ac-fan-plain" aria-hidden="true" style={{ WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }} />}
  </>)
}
