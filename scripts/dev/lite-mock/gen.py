# Look mock (not the build): a dark lake lit by the PingLive Down beam, with / without a giant PINGLIVE wordmark.
import math, random
W,H,SURF=1600,900,250
AX,AY=700,296          # transducer face (beam apex)
R=540                  # range in px (sound reach)
HALF=math.radians(67.5)
random.seed(7)

def catmull(pts):
    d=f"M{pts[0][0]:.1f},{pts[0][1]:.1f}"
    for i in range(len(pts)-1):
        p0=pts[max(i-1,0)]; p1=pts[i]; p2=pts[i+1]; p3=pts[min(i+2,len(pts)-1)]
        c1=(p1[0]+(p2[0]-p0[0])/6, p1[1]+(p2[1]-p0[1])/6); c2=(p2[0]-(p3[0]-p1[0])/6, p2[1]-(p3[1]-p1[1])/6)
        d+=f" C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}"
    return d
bed=[(0,556),(110,548),(230,556),(340,546),(450,560),(540,598),(620,664),(700,720),(800,752),(920,768),(1040,764),(1120,742),(1190,700),(1250,686),(1320,698),(1420,740),(1520,758),(1600,764)]
bedline=catmull(bed)
terrain=bedline+f" L{W},{H} L0,{H} Z"
water_above=f"M0,{SURF} L{W},{SURF} L{W},{bed[-1][1]} "+catmull(bed[::-1])[1:].replace("M","L",1)+" Z"
lx,ly=AX+R*math.sin(-HALF),AY+R*math.cos(HALF); rx=AX+R*math.sin(HALF)
sector=f"M{AX},{AY} L{lx:.1f},{ly:.1f} A{R},{R} 0 0 0 {rx:.1f},{ly:.1f} Z"

def fish(x,y,L,d=1,cls="f"):
    b=f"M{-L/2:.1f},0 Q0,{-L*.30:.1f} {L/2:.1f},0 Q0,{L*.24:.1f} {-L/2:.1f},0 Z M{-L*.44:.1f},0 L{-L*.72:.1f},{-L*.19:.1f} L{-L*.68:.1f},0 L{-L*.72:.1f},{L*.19:.1f} Z"
    return f'<path class="{cls}" transform="translate({x:.1f},{y:.1f}) scale({d},1)" d="{b}"/>'
def school(cx,cy,n,L,sp,d=1):
    return [(cx+random.uniform(-sp,sp),cy+random.uniform(-sp*.45,sp*.45),L*random.uniform(.85,1.1),d) for _ in range(n)]
F=[(760,600,38,-1),(822,644,30,1),(640,566,30,1),(1300,520,72,-1),(1410,706,52,1),(420,500,26,1)]
F+=school(600,462,9,15,34,1)+school(905,420,20,9,26,-1)+school(150,420,8,16,40,1)+school(1330,380,10,11,30,-1)

def trunk(x,base,top,w0,w1,lean,br):
    pts=[(x-w0/2,base),(x+lean-w1/2,top),(x+lean+w1/2,top),(x+w0/2,base)]
    s=f'<path d="M{pts[0][0]},{pts[0][1]} L{pts[1][0]},{pts[1][1]} L{pts[2][0]},{pts[2][1]} L{pts[3][0]},{pts[3][1]} Z"/>'
    for t,dx,dy,sw in br:
        px=x+lean*t; py=base+(top-base)*t
        s+=f'<path d="M{px:.1f},{py:.1f} q{dx*.4:.1f},{dy*.6:.1f} {dx:.1f},{dy:.1f}" fill="none" stroke-width="{sw}" stroke-linecap="round"/>'
    return s
TREES=trunk(190,552,300,11,3,-6,[(.55,-38,-46,3),(.7,30,-40,2.5),(.35,24,-30,3)])+trunk(282,556,352,9,3,5,[(.6,-30,-34,2.5),(.45,26,-28,2.5)])+trunk(362,548,395,8,2.5,-4,[(.6,22,-30,2)])+trunk(806,752,520,10,3,-8,[(.5,-34,-40,3),(.65,32,-36,2.5),(.3,28,-24,2.5)])
ROCKS="".join(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}"/>' for x,y,rx,ry in [(1200,700,26,15),(1236,690,18,12),(1275,694,30,16),(1318,702,20,11),(470,566,14,8)])
WRECK='<g transform="translate(948,770) rotate(-7)"><path d="M-70,0 L-78,-18 L64,-22 L80,-6 L66,4 Z"/><rect x="-30" y="-40" width="42" height="20"/><rect x="-24" y="-35" width="8" height="7" fill="#02060a"/><rect x="-10" y="-35" width="8" height="7" fill="#02060a"/><path d="M28,-22 L40,-78" stroke-width="3" fill="none"/></g>'
DOTS=[(random.uniform(0,W),random.uniform(SURF+6,H),random.uniform(.6,1.9),random.uniform(.12,.34)) for _ in range(190)]
BIG=[(random.uniform(0,W),random.uniform(SURF+20,H-20),random.uniform(4,10),random.uniform(.06,.14)) for _ in range(14)]
STARS=[(random.uniform(0,W),random.uniform(8,170),random.uniform(.4,1.1),random.uniform(.15,.45)) for _ in range(30)]
SHAFTS=[(150,40,110,-60),(430,30,90,-30),(1010,50,140,40),(1330,36,100,70),(1500,30,80,50)]
def shafts():
    s=""
    for x,w0,w1,lean in SHAFTS:
        s+=f'<path d="M{x-w0/2},{SURF} L{x+w0/2},{SURF} L{x+lean+w1/2},{SURF+430} L{x+lean-w1/2},{SURF+430} Z"/>'
    return s
fishes="".join(fish(*f) for f in F)
RAYS="".join(f'<path d="M{AX},{AY} L{AX+R*math.sin(a):.0f},{AY+R*math.cos(a):.0f}"/>' for a in [math.radians(v) for v in (-52,-33,-18,-4,9,24,41,58)])

def page(wordmark):
    txt=f'<text x="800" y="360" text-anchor="middle" font-family="Euro" font-size="250" textLength="1440" lengthAdjust="spacingAndGlyphs" letter-spacing="0">PINGLIVE</text>'
    headline="" if wordmark else '<div class="hl"><div class="h1">See what PingLive sees.</div><div class="h2"><i>Move the transducer. Whatever the beam reaches lights up.</i></div></div>'
    svg=f'''<svg viewBox="0 0 {W} {H}" width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg">
<defs>
 <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03060a"/><stop offset=".75" stop-color="#0d1a24"/><stop offset="1" stop-color="#1a2c37"/></linearGradient>
 <linearGradient id="water" x1="0" y1="{SURF}" x2="0" y2="{H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0f3542"/><stop offset=".3" stop-color="#0a2530"/><stop offset="1" stop-color="#02070a"/></linearGradient>
 <linearGradient id="fog" x1="0" y1="{SURF}" x2="0" y2="{H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#02080c" stop-opacity="0"/><stop offset=".45" stop-color="#02080c" stop-opacity=".5"/><stop offset="1" stop-color="#010406" stop-opacity=".82"/></linearGradient>
 <linearGradient id="shaft" x1="0" y1="{SURF}" x2="0" y2="{SURF+430}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#bfe6f0" stop-opacity=".11"/><stop offset="1" stop-color="#bfe6f0" stop-opacity="0"/></linearGradient>
 <linearGradient id="txt" x1="0" y1="180" x2="0" y2="{SURF}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f1f6f8"/><stop offset="1" stop-color="#8ea8b5"/></linearGradient>
 <linearGradient id="bedg" x1="0" y1="540" x2="0" y2="{H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0e1c20"/><stop offset="1" stop-color="#03080a"/></linearGradient>
 <radialGradient id="beam" cx="{AX}" cy="{AY}" r="{R}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#bdf0ff" stop-opacity=".40"/><stop offset=".45" stop-color="#8fdcf2" stop-opacity=".17"/><stop offset="1" stop-color="#6cc9e6" stop-opacity=".09"/></radialGradient>
 <radialGradient id="falloff" cx="{AX}" cy="{AY}" r="{R}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset=".75" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity=".45"/></radialGradient>
 <radialGradient id="pool" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d9f4ff" stop-opacity=".30"/><stop offset="1" stop-color="#d9f4ff" stop-opacity="0"/></radialGradient>
 <radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
 <mask id="fall"><rect width="{W}" height="{H}" fill="url(#falloff)"/></mask>
 <clipPath id="above"><rect width="{W}" height="{SURF}"/></clipPath>
 <clipPath id="below"><rect y="{SURF}" width="{W}" height="{H-SURF}"/></clipPath>
 <clipPath id="sector"><path d="{sector}"/></clipPath>
 <clipPath id="wab"><path d="{water_above}"/></clipPath>
 <filter id="b2"><feGaussianBlur stdDeviation="2"/></filter>
 <filter id="b6"><feGaussianBlur stdDeviation="6"/></filter>
 <filter id="b12" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="12"/></filter>
 <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <filter id="refract" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.008 0.05" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="10" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1.4"/></filter>
 <filter id="tex"><feTurbulence type="fractalNoise" baseFrequency="0.035 0.09" numOctaves="3" seed="9"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .6  0 0 0 0 .6  0 0 0 .35 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
 <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0"/></filter>
</defs>
<rect width="{W}" height="{SURF}" fill="url(#sky)"/>
<ellipse cx="800" cy="{SURF}" rx="900" ry="46" fill="#2a3b45" opacity=".55" filter="url(#b12)"/>
{"".join(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.2f}" fill="#dbe8ee" opacity="{o:.2f}"/>' for x,y,r,o in STARS)}
<path d="M0,226 C120,214 210,222 320,216 C430,210 520,228 640,222 C760,216 880,204 1010,214 C1130,224 1250,208 1380,216 C1480,222 1550,214 1600,218 L1600,{SURF} L0,{SURF} Z" fill="#05090d"/>
{f'<g clip-path="url(#above)" fill="url(#txt)" opacity=".93">{txt}</g>' if wordmark else ''}
<rect y="{SURF}" width="{W}" height="{H-SURF}" fill="url(#water)"/>
{f'<g clip-path="url(#below)" fill="#2a6a7c" opacity=".42" filter="url(#refract)">{txt}</g>' if wordmark else ''}
<g fill="url(#shaft)" filter="url(#b12)" style="mix-blend-mode:screen">{shafts()}</g>
<path d="{terrain}" fill="url(#bedg)"/>
<path d="{terrain}" fill="#fff" filter="url(#tex)" opacity=".5"/>
<path d="{bedline}" fill="none" stroke="#1e3238" stroke-width="2" opacity=".8"/>
<g fill="#0a151a" stroke="#0a151a">{TREES}</g>
<g fill="#0b161a">{ROCKS}</g>
<g fill="#0a1519" stroke="#0a1519">{WRECK}</g>
<g><style>.f{{fill:#17343d;opacity:.85}} .L .f{{fill:#bcd5d8;opacity:1;stroke:#ffb04a;stroke-width:1.3}}</style>{fishes}</g>
<rect y="{SURF}" width="{W}" height="{H-SURF}" fill="url(#fog)"/>
<g fill="#cfe4ec">{"".join(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.2f}" opacity="{o:.2f}"/>' for x,y,r,o in DOTS)}</g>
<!-- the beam: a volume of light that reaches as far as the sound -->
<g clip-path="url(#wab)"><g clip-path="url(#sector)">
  <rect width="{W}" height="{H}" fill="url(#beam)"/>
  <g stroke="#dff8ff" stroke-width="10" opacity=".07" filter="url(#b6)">{RAYS}</g>
  <circle cx="{AX}" cy="{AY}" r="330" fill="none" stroke="#c9f3ff" stroke-width="2" opacity=".20" filter="url(#b2)"/>
</g></g>
<g class="L" clip-path="url(#sector)" mask="url(#fall)">
  {f'<g clip-path="url(#below)" fill="#9adbeb" opacity=".62" filter="url(#refract)">{txt}</g>' if wordmark else ''}
  <path d="{terrain}" fill="#3a4c49"/><path d="{terrain}" fill="#fff" filter="url(#tex)" opacity=".7"/>
  <path d="{bedline}" fill="none" stroke="#8aa7a0" stroke-width="30" opacity=".8" filter="url(#b6)"/>
  <ellipse cx="{AX+30}" cy="735" rx="330" ry="46" fill="url(#pool)"/>
  <g fill="#8fa29d" stroke="#8fa29d">{TREES}</g><g fill="none" stroke="#ffb04a" stroke-width="1.4" filter="url(#glow)" opacity=".9">{TREES}</g>
  <g fill="#8fa29d">{ROCKS}</g>
  <g fill="#7f938e" stroke="#7f938e">{WRECK}</g><g fill="none" stroke="#ffb04a" stroke-width="1.4" filter="url(#glow)" opacity=".85">{WRECK}</g>
  <path d="{bedline}" fill="none" stroke="#ffb347" stroke-width="2.6" filter="url(#glow)"/>
  <g filter="url(#glow)">{fishes}</g>
  <g fill="#f4fbff">{"".join(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r*1.2:.2f}" opacity="{min(1,o*2.6):.2f}"/>' for x,y,r,o in DOTS)}</g>
</g>
<g clip-path="url(#wab)"><path d="M{lx:.1f},{ly:.1f} L{AX},{AY} L{rx:.1f},{ly:.1f}" fill="none" stroke="#e6f9ff" stroke-width="1.1" opacity=".55"/>
 <path d="M{lx:.1f},{ly:.1f} L{AX},{AY} L{rx:.1f},{ly:.1f}" fill="none" stroke="#9fe6fb" stroke-width="7" opacity=".22" filter="url(#b6)"/>
 <path d="M{lx:.1f},{ly:.1f} A{R},{R} 0 0 0 {rx:.1f},{ly:.1f}" fill="none" stroke="#e6f9ff" stroke-width="1" opacity=".22" stroke-dasharray="2 6"/></g>
<g fill="#e8f3f7">{"".join(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.1f}" opacity="{o:.2f}" filter="url(#b2)"/>' for x,y,r,o in BIG)}</g>
<path d="M0,{SURF} C200,{SURF-1.5} 400,{SURF+1.5} 600,{SURF} S1000,{SURF-1.5} 1200,{SURF} S1500,{SURF+1} 1600,{SURF}" fill="none" stroke="#9fcfdc" stroke-width="1.3" opacity=".55"/>
<ellipse cx="{AX+72}" cy="{SURF}" rx="60" ry="2.4" fill="#d9f2fa" opacity=".55" filter="url(#b2)"/>
<rect x="{AX+53}" y="96" width="13" height="{AY-71.5-96+4:.1f}" fill="#15191d"/><rect x="{AX+53}" y="96" width="3" height="{AY-71.5-96+4:.1f}" fill="#4f5962"/>
<image href="pl-head.png" x="{AX-38.5:.1f}" y="{AY-71.5:.1f}" width="110" height="{110*204/260:.1f}"/>
<rect width="{W}" height="{H}" fill="url(#vig)"/>
<rect width="{W}" height="{H}" filter="url(#grain)" opacity=".07" style="mix-blend-mode:overlay"/>
</svg>'''
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:Euro;src:url(../../../public/brand/fonts/Eurostile-Heavy.otf)}}
@font-face{{font-family:Inst;src:url(../../../public/brand/fonts/InstrumentSans-Variable.ttf);font-weight:400 700}}
@font-face{{font-family:Inst;src:url(../../../public/brand/fonts/InstrumentSans-Italic-Variable.ttf);font-style:italic;font-weight:400 700}}
html,body{{margin:0;background:#000;width:{W}px;height:{H}px;overflow:hidden;font-family:Inst,system-ui,sans-serif;color:#fff}}
.st{{position:relative;width:{W}px;height:{H}px}} .st svg{{position:absolute;inset:0}}
.logo{{position:absolute;left:48px;top:40px;height:17px;opacity:.92}}
.lab{{position:absolute;right:48px;top:40px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;opacity:.7}}
.hint{{position:absolute;left:0;right:0;top:41px;text-align:center;font-size:11px;letter-spacing:.24em;text-transform:uppercase;opacity:.55}}
.plus{{position:absolute;font-size:18px;font-weight:300;opacity:.45}}
.ro{{position:absolute;left:{AX+82}px;top:104px}} .ro b{{display:block;font-size:10px;letter-spacing:.22em;font-weight:600;opacity:.6}} .ro span{{font-size:30px;font-weight:500;letter-spacing:.01em}} .ro small{{font-size:14px;opacity:.7;margin-left:4px}}
.bar{{position:absolute;left:48px;right:48px;bottom:38px;display:flex;align-items:flex-end;justify-content:space-between}}
.cap{{font-size:15px;line-height:1.35}} .cap .a{{font-weight:600;letter-spacing:.06em;text-transform:uppercase;font-size:12px;opacity:.75}} .cap i{{opacity:.85;font-size:17px}}
.seg{{display:inline-flex;gap:2px;padding:4px;border-radius:999px;background:rgba(255,255,255,.09);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:inset 0 0 0 1px rgba(255,255,255,.18),0 12px 30px rgba(0,0,0,.35)}}
.seg span{{padding:10px 18px;border-radius:999px;font-size:14px;font-weight:600;color:rgba(255,255,255,.86)}} .seg .on{{background:rgba(255,255,255,.93);color:#0b1b22}}
.hl{{position:absolute;left:48px;top:92px}} .h1{{font-size:46px;font-weight:600;letter-spacing:-.01em}} .h2{{font-size:18px;opacity:.78;margin-top:8px}}
</style></head><body><div class="st">{svg}
<img class="logo" src="../../../public/brand/logo/White Accuphy Logo.png">
<div class="hint">Move to steer</div><div class="lab">Open the full Lab ↗</div>
{headline}
<div class="ro"><b>DEPTH</b><span>47.5</span><small>ft</small></div>
<span class="plus" style="left:40px;top:{SURF-12}px">+</span><span class="plus" style="right:40px;top:{SURF-12}px">+</span>
<div class="bar"><div class="cap"><div class="a">PingLive · Down View</div><i>Straight below the boat, 135° wide.</i></div>
<div class="seg"><span class="on">Down</span><span>Forward</span><span>Panoramic</span></div>
<div class="seg"><span class="on">PingLive</span><span>PingLive Mini</span></div></div>
</div></body></html>'''
open("mock-wordmark.html","w").write(page(True)); open("mock-plain.html","w").write(page(False)); print("ok")
