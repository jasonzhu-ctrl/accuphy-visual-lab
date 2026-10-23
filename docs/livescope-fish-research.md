# How fish look on forward-facing live sonar (Garmin LiveScope, Lowrance ActiveTarget, Humminbird MEGA Live)

Research for the Accuphy Lab sonar simulator: why a smooth glowing ellipse looks wrong, and what to draw instead.
Compiled 2026-10-23.

> Kept for decision #120 (fish marks rebuilt). Written 2026-10-23 by a research sub-agent from search-engine excerpts
> only: the cloud container blocks YouTube and most sites, so no video was watched and no page was read in full.
> Every claim carries its source label. Where it disagrees with the Accuphy app recordings in `reference/`, the app
> wins (`docs/sonar-style.md` §7.19 says which rules the engine took).

## Method and reliability

- **WebFetch did not work in this session.** Every fetch failed with a DNS error (`getaddrinfo ENOTFOUND`),
  including garmin.com, wired2fish.com and wikipedia.org, and direct curl was refused by the proxy. All findings
  below therefore come from WebSearch, which returns a search engine's summary and excerpts of each page. Quoted
  phrases are as those excerpts gave them. I could not read full articles, transcripts or forum threads, and I
  watched no videos.
- About 45 distinct sources were used: Garmin manuals and press releases, Lowrance and Humminbird spec pages,
  In-Fisherman, Wired2Fish, Bassmaster, LureNet, Fish'n Canada, Crappie.com, BBC Boards (bass boat forum),
  BassResource, In-Depth Outdoors, Pond Boss, retailers, and fisheries-acoustics papers (target strength vs
  aspect, DIDSON/ARIS imaging sonar, echo statistics).
- **Confidence labels used below:** [M] manufacturer document; [S] peer-reviewed science or agency report;
  [J] fishing journalism or guide; [F] forum or anecdote; [D] my own derivation from specs or physics
  (not a source claim).
- Angler descriptions are mostly about LiveScope. ActiveTarget and MEGA Live work the same way (a 20° thick fan
  of formed beams at about 0.5 to 1.3 MHz), so the same rules apply, with small differences noted.
- Where this disagrees with recordings of the real Accuphy app (`reference/`, `docs/sonar-style.md`), **the app
  wins.** This report is about the competitor look that anglers know.

---

## Top 10 visual rules for the renderer

1. **The blur around a point is anisotropic, in polar coordinates. It is not a round glow.** Along the ray (range)
   a target is thin, a few cm. Across the ray (along the arc) it is smeared by the formed-beam width, about
   0.6°–1.05° on LiveScope. That gives an arc smear of about R × 0.01–0.018: roughly 5–9 cm at 5 m, 10–17 cm at
   10 m, 21–35 cm at 20 m and 31–52 cm at 30 m [D, from Garmin target-separation specs]. A distant fish is
   therefore a **short dash lying along the range arc**, tilted perpendicular to its ray. Anglers describe distant
   fish and brush as `////` slashes that "get more defined as they get closer" [F, Crappie.com].
   - Forward-view orientation: near the surface far ahead the dash is a near-vertical tick `|`; at mid-depth ahead
     it is a `/`; straight under the transducer (Down view) it is a horizontal `—` [D].
2. **Range sets the regime.**
   - **Near, under about 6–8 m:** the fish's own shape dominates, so its outline, head/tail and fins can be read
     [J/F].
   - **Middle, about 8–20 m:** an oval "dot" or blob, about as wide as the beam smear.
   - **Far, beyond about 20–30 m:** thin, flickering arc-dashes.
   - **Near the practical limit** (about 100–110 ft / 30–35 m on LVS32/34): "just flickers of returns" [F].
   - On screen, marks also shrink as the range or depth *scale* grows. A fish shown at a 140 ft depth setting
     looked about half the size it did at 70 ft [F].
3. **Aspect (body angle to the ray) is the biggest brightness control, and its swing is large.**
   - Fisheries measurements put full side aspect about **17–20 dB above head/tail-on** for salmonids, whitefish
     and pike [S]. That is 7–10× in amplitude and 50–100× in energy.
   - Anglers see the same thing: fish swimming straight toward or away from the boat are weaker and "narrower";
     when they "turn sideways … they show up brighter"; a fish can look "ghostly" and then light up when it turns
     to chase a jig [F, BassResource].
   - A head-on fish should be a **small, dim dot that sometimes drops below threshold.** A broadside fish should
     be **bright and solid**.
4. **The fan is a 2-D slice, so only the part of the body that lies in the image plane shows as length** [F, D].
   - **A fish crossing the slab** (left↔right in Forward view) is broadside to the transducer, so it is
     strongest. But its length is collapsed into the 20° thickness, so it draws as a **compact round bright
     mark**. This is the crappie "dime" [J, LureNet; F, Crappie.com].
   - **A fish swimming toward or away from the boat in the plane** shows its length along range, but it is dimmer.
     It tends to break into **separate head and tail highlights.** At oblique aspect, discrete echo peaks come
     from regions near the head and the tail [S, Burwen et al. 2007].
5. **A fish echo is a few highlights, not a uniform ellipse.**
   - The swim bladder carries **about 90–95 % of the echo energy** [S, Foote 1980]. It sits in the front-middle
     third of the body, so a fish's core is a bright, off-centre kernel.
   - Head and tail add weaker, separate peaks at oblique angles [S].
   - At close range the mark is ragged and speckled, and fins and tail are sometimes visible [J/F].
   - Near broadside the echo is "unimodal, symmetrical", like a sphere [S]. A broadside fish is the one case
     where a compact blob is right.
6. **The beam is 20° thick, so fish fade in and out.**
   - The slab is 0.35 × R wide: 1.8 m at 5 m, 3.5 m at 10 m, 7 m at 20 m [D].
   - Fish "fade as they move out of the center of the beam", and "if they swim right or left they disappear"
     [F, BassResource, BBC Boards].
   - A crossing fish should ramp up, peak and ramp down over **seconds**: about 1–2 s at 3–5 m for a cruising bass,
     and about 10 s at 30 m [D].
   - Fish entering at the bottom edge of the depth window seem to "come in from the bottom of the screen" [F].
7. **Frame-to-frame variation depends on activity.**
   - Echoes from a **calm fish have a narrow, stable amplitude distribution.** An **active fish whose orientation
     changes has a broad, Rayleigh-like one**, with big ping-to-ping swings [S, Stanton et al. 2004, via Acoustics
     Today].
   - So: a hovering crappie is a steady dime. A swimming or turning bass flickers, swells and partly breaks up.
   - Shad "look like a constant flashing or static because they are constantly flipping" [J, LureNet guide].
8. **There is no built-in comet tail.** On Garmin, motion history is an *optional* overlay called **Trails**,
   controlled from Sonar Setup → Appearance. It shows "the movement of the target" for an adjustable time [M].
   - Trails are described as a fading "ghost image" left behind [J, FishfinderCoach], and by one guide as
     "pink lines behind moving objects" that clutter the screen [J].
   - With Trails off, the live mark is the fish's body now.
   - If ping blending is kept (the Accuphy app may blend pings), make history **decay with age**: the newest
     position brightest, older copies dimmer. Not a symmetric capsule that peaks in the middle.
9. **Near the bottom:**
   - Forward view misses roughly "the last two feet" above the bottom [J, Wired2Fish].
   - A fish on the bottom shows as "a brighter glow or a little small hump" on the bottom line, found mainly
     because it moves [F, Crappie.com and BBC Boards].
   - Bottom Fill can hide such fish [J, Livingston Lures].
   - **Acoustic shadows of fish are a Perspective (plan-view) feature.** There, users describe "real time side
     imaging" with "shadows", and Wired2Fish describes "shadows and little dots swimming around the screen" [F/J].
     No source describes fish shadows in Forward view [D: the 20° slab is far wider than a fish, so the shadow is
     tiny].
10. **Groups and species have distinct looks.**
    - **Bait school:** a cloud of tiny specks that sparkle and flicker, with crisp, hard edges when predators herd
      it. Predators show as larger, brighter marks at its edges or under it [J/F].
    - **Crappie school:** "a grapevine of dots", stationary [J].
    - **Bass:** "a bright dense dot"; tail and heading can often be told apart [J, Wired2Fish].
    - **Carp and catfish:** "fuzzy … a large blob" [J, Wired2Fish].
    - **Musky and pike:** "large and elongated" [J, In-Fisherman], "like torpedoes" [J, Star Tribune].
    - **Walleye:** "longer with a slight hump in the middle" [J, In-Fisherman].

---

## Quantitative specs and what they imply for the picture

### Published specs

| Unit | Fan (forward) | Frequency | Target separation | Max range | Source |
|---|---|---|---|---|---|
| Garmin LVS32 (original LiveScope) | 20° × 135° | 530–1100 kHz | 22 in @ 100 ft | 200 ft | retailer comparison tables [M via retail] |
| Garmin LVS34 (LiveScope Plus) | 20° × 135° | 530–1100 kHz, 500 W | **14 in (35.6 cm) @ 100 ft**, "35 % better" | 200 ft (61 m) | Garmin press release; sealutions.co.uk; gpscentral.ca |
| Garmin LVS62 (LiveScope XR) | 20° × 135° | 265–550 kHz (one listing: 282–522) | 22 in @ 100 ft | 500 ft fresh / 350 ft salt | adorama.com; boatingmag.com ("slightly less resolution") |
| Garmin LVS44 (LiveScope 2, 2026) | 20° × 165° (Down/Perspective 20° × 180°) | 600–1050 kHz | 5.7 in @ 30 ft; 12.6 in @ 100 ft | 250 ft | FishfinderCoach / FishUSA comparison tables |
| Garmin LVS42HD (LiveScope 2 HD) | same as LVS44 | 850–1600 kHz | **3.8 in @ 30 ft**; 12.6 in @ 100 ft; "50 % more detail at closer ranges" | 125 ft | Garmin LiveScope 2 release; FishfinderCoach |
| Lowrance ActiveTarget 2 XL | 20° × 180° | 650–1300 kHz | not published | 200 ft | lowrance.com spec page |
| Lowrance ActiveTarget (gen 1) | "20°" thick | 500/550–1100 kHz | n/a | 135 ft forward, 80 ft down | West Marine listing |
| Humminbird MEGA Live 2 | 20° × 120° | ≈ 1050 kHz | "2.5 in" on a bundle page (uncertain) | 150–200 ft (sources differ) | humminbird.johnsonoutdoors.com; fishfinderlab.com |

Garmin's frequency-steered sonar patents describe a fan made of beams, each leaving at an angle that depends on
its frequency, "spaced from less than 1 degree to about 5 degrees apart" (US20180100922A1; US20230074053A1). That
fits LiveScope's wide 530–1100 kHz band, but no source confirms that LiveScope uses frequency steering. [M/D]

**Refresh rate:** there is no official number for any brand. One electronics blog claims LiveScope often exceeds
"20–30 FPS" [J, unverified]. Reviews call LiveScope the refresh leader and report a slight lag on ActiveTarget
and gen-1 MEGA Live [J/F].

### Derived numbers [D]

- **Angular (across-ray) resolution**, from target separation divided by range:
  - LVS34: 0.356 m / 30.5 m ≈ **0.67°**
  - LVS32 and LVS62: ≈ **1.05°**
  - LVS42HD: ≈ **0.6°**
  - LVS44: ≈ 0.6–0.9° (Garmin's two figures disagree)
- **Range (along-ray) resolution:** not published. With a MHz carrier and short pulses it is very likely a few cm,
  so a fish mark is radially thin. Its radial extent is mostly the body's own projection onto the ray, plus about
  a pixel.

| Range | Arc smear at 0.6° | Arc smear at 1.0° | 20° slab width | Time to cross slab at 0.3 m/s (crappie drifting) | at 1 m/s (bass cruising) |
|---|---|---|---|---|---|
| 3 m | 3 cm | 5 cm | 1.1 m | 3.5 s | 1.1 s |
| 5 m | 5 cm | 9 cm | 1.8 m | 5.9 s | 1.8 s |
| 10 m | 10 cm | 17 cm | 3.5 m | 12 s | 3.5 s |
| 20 m | 21 cm | 35 cm | 7.1 m | 24 s | 7.1 s |
| 30 m | 31 cm | 52 cm | 10.6 m | 35 s | 10.6 s |

- **Crossover:** for a 30 cm panfish or bass the arc smear equals the body size at about 17–30 m. Inside that range
  the body shape is resolvable; beyond it every fish is a beam-sized dash. This matches the angler reports that
  shapes are only readable within about 35 ft for judging size [F, Crappie.com, Josh Jones] and are `////` at
  40–60 ft [F].
- **Pixel example:** a 375 px wide phone view showing 20 m is about 19 px/m.
  - Fish at 15 m: a slash about 3–5 px long and 1–2 px thick.
  - 30 cm fish at 5 m: about 6 px long.
  - On a 10 m view (37 px/m), a 30 cm crappie at 4 m is about 11 × 3–4 px, which is large enough to show a
    bright kernel plus a weaker tail.
- **Aspect contrast:** 17–20 dB between broadside and head-on is a big step on a log display. If the display spans
  about 40–50 dB from background to saturation, a head-on fish sits **35–50 % lower on the colour ramp** than the
  same fish broadside. For a high-frequency, many-wavelength body the broadside peak is **narrow**: a strong
  "flash" over a few tens of degrees around broadside [S/D]. DIDSON lengths are only accurate near perpendicular,
  and "only the largest fish remain detectable when they are aligned head- or tail-on" [S, ScienceDirect DIDSON
  bias study].

---

## Detailed findings by question

### 1. A single fish at mid/far range in Forward mode

- **Shape:** "more or less large dots or small areas", identified as fish by movement
  [J, the-fishfinders.com LVS32 field test]. "Fish appear as dots or … with a much more realistic silhouette"
  depending on system and conditions [J, Mercury Marine]. At 40–60 ft, schools or brush show as `////` or `""`
  marks that "get more defined as they get closer" [F, Crappie.com].
- **Orientation:** the slashes are the beam smear along the range arc, so they lie **perpendicular to the ray, not
  along the fish's body** [D]. The fish's own length only appears when it is close, or when it lies in the plane.
- **With range:** marks get smaller on screen as the scale grows. "Once you run the scale out there the targets
  (fish) just keep getting smaller and smaller" [F, BBC Boards "Livescope distance?" thread]. Real useful range is
  about 100–110 ft, where "you're getting just flickers of returns" [F]. At long range everything looks "washed
  out" [J, Tackle Shack AU]. The beam is like a "pizza slice", widening with distance [J, thefishinhole.com].
- **Brightness:** bass give "crisp, bright" returns and trash fish "faded" (Cory Johnston via Bass Pro) [J].
  Larger fish are "more solid and defined" (Tackle Shack) [J].

### 2. A fish close to the transducer (3–6 m)

- **Detail visible:** "you can see the outline of the fish, the size of the fish and even the fins as the fish swims
  towards or away from your bait" (ice-angler forum post, likely In-Depth Outdoors) [F]. "You can actually see fish
  fins and tails, moving!" [F, 2coolfishing.com]. LiveScope 2 is "detailed enough to show fish tails"
  [J, BoatUS 2026]. The LiveScope 2 HD claims "50 % more detail at closer ranges" [M].
- **Head direction:** a guide uses the image to tell a crappie's head from its tail, so he can keep the lure in
  front of the fish [J, LureNet "What Do I See?"]. Wired2Fish: for bass, "the tail and heading can often be told
  apart" depending on size [J].
- **Shape cues:** crappie look like "a football with its tail rounded off" with no tail movement, while a
  torpedo-shaped fish with a constantly moving tail is another species [F]. Crappie echoes are "shaped like
  footballs" [J, CrappieNow].
- **Broadside, head-on, tail-on:**
  - Broadside: strongest and most compact [S, F].
  - Head-on: smaller and dimmer [F, BassResource].
  - Tail-on (swimming away): "hit tail-first", with weaker returns [F, BassResource].
  - Crappie.com's "Deep Thinkers" thread argues whether the bright crappie "dimes" are broadside or facing; it is
    not settled there [F].
  - Fisheries data: side aspect gives the strongest echo for most species (trout was the exception, dorsal
    strongest) [S, European species TS study].
- **Swim bladder:** no angler source mentions it, but physics says it is the dominant reflector (90–95 %)
  [S, Foote 1980]. Draw a bright kernel in the front half of the body, with weaker head and tail.

### 3. Turning, swimming fast, hovering

- **Turning:** brightness changes far more than shape. A fish "turning sideways" brightens; it looks "ghostly" from
  one angle and brightens when it turns to chase [F, BassResource]. Imaging-sonar science: near broadside the echo
  is one symmetric peak; as the fish turns oblique the echo "becomes less symmetrical", "discrete peaks develop
  … close to the head and tail", and duration and amplitude become more variable [S, Burwen et al. 2007, ICES JMS].
- **What the turn looks like** [D, from the above]:
  - A head-on dot swells into a bright compact mark at broadside.
  - Through oblique angles it may briefly show as **two blobs** (head and tail) along range.
  - Then it shrinks back to a dim dot.
  - A fish turning across the slab also fades if it swims out of the 20° thickness.
- **Hovering versus moving:**
  - Crappie "hold nearly still"; bass, carp and gar "keep swimming" [J, LureNet].
  - Crappie appear as round "dimes" that barely move; "visible tail motion or fast swimming suggests … white bass,
    shad" [J, LureNet guide].
  - Crappie "hold in place, then flick their tails and glide, while sand bass always swim" [J, johninthewild.com].
  - Echoes from calm fish are steady and those from active fish fluctuate widely [S, Stanton 2004].
  - **So a still fish is steadier, rounder and more uniform. A moving fish flickers and changes shape.**
- **Fast fish:** bass feeding "move at a high rate of speed" and keep a few feet apart, so each is distinct [J].
  No source says a fast fish smears without Trails.

### 4. Swimming motion, tails, trails and settings

- **Tail motion is visible at close range** [F, 2coolfishing; J, BoatUS], and anglers use it as a species cue
  [J, LureNet]. Science: tail beats show in DIDSON (1.1–1.8 MHz) images "once the fish's range extent changes
  enough" [S, Mueller et al. 2010]. Tail-beat frequency for salmon is about 2.3–3.1 beats/s [S, AFS 2011 abstract];
  smaller fish beat faster.
  - **Suggestion:** modulate the tail highlight's brightness and position at about 2–5 Hz for fish within about 6 m.
- **Trails (Garmin's motion history):**
  - Garmin manual: Trails "controls how long the trails appear on the screen. The trails show the movement of the
    target" [M]. Path: Menu → Sonar Setup → Appearance → Trails (Wired2Fish 10 best settings) [J].
  - It leaves "a temporary 'ghost' image of where fish, lures, or other objects have been … fade[s] over time,
    depending on the speed setting" (slow, medium or fast) [J, FishfinderCoach].
  - Pros: helps find your lure [J]. Cons: "pink lines behind moving objects can create excessive clutter" [J].
    Several pros keep it off [F].
  - On the older LiveSight, trail colour shading showed direction, e.g. light to dark blue meaning "moving away"
    [J, Western Bass].
- **Garmin has no "persistence" setting**; none of the manuals found name one. Humminbird and Lowrance documents
  for a persistence or trails setting were not found.
- **Noise Reject** (Forward only on gen-1 transducers, all modes on LiveScope 2) "reduces noise and interference
  and attempts to remove returns that are not actually targets" [M]. Too much "can also hide weaker returns like
  small fish" [J]. One troubleshooting guide says High can add display lag [J].
- **TVG** suppresses near-surface clutter. Set too high, it makes a lure "fade out as it sinks" [M, J].
- **Ghost Reject** removes "ghost" images from strong returns such as a hard bottom in shallow water [M]. Set to
  High, it can remove small fish and bait, and it leaves a blind spot where the ghost tree was [J].

### 5. Frame-to-frame behaviour

- **Ping-to-ping variation:** echo amplitudes "fluctuate from ping to ping due to various interference phenomena".
  Individual calm fish give narrow, Gaussian-like amplitude distributions; active fish give broad, Rayleigh-like
  ones [S, Lee and Stanton / Stanton 2004 via Acoustics Today 2021].
- **Fading in and out:** fish fade at the beam edges and come back when they re-enter [F, BassResource]. "The beam
  is quite narrow so you are not actually looking at that much water … if they swim right or left they disappear"
  [F, BBC Boards].
- **Break-up:** at oblique aspect the echo splits into head and tail peaks [S, Burwen 2007]. At long range a mark is
  "flickers" [F].
- **Baitfish:** "constant flashing or static" [J, LureNet]. Spring pollen gives "snow-like clutter, especially in the
  upper portion of the display" [J, FishfinderCoach pollen article], a useful distractor layer.
- **Whole-image instability:** without AHRS stabilisation the view gets "exaggerated", and a mis-set tilt showed
  "nothing but small vertical lines" [F, BBC Boards 1273776]. LiveScope 2 adds "integrated image stabilization"
  [M].

### 6. Schools, crappie in brush, bass on bottom, separating from the bottom

- **Bait:** a "dense cloud of specks"; predators are "larger individual marks at the edges or beneath the cloud"
  [J, PartsVu guide]. Bait balls with "hard, crisp edges" mean bass are herding them (pro Jose Soukup, in a
  search excerpt whose exact page was not pinned) [J].
- **Crappie in brush:** "a grapevine of dots" that stay stationary [J, LureNet]. Older units can merge fish stacked
  tightly in cover, while the LVS42HD separates "two crappie sitting four inches apart" [J, FishfinderCoach].
  Crappie may sink into the branches when the boat comes within about 15 ft [J, Arkansas Game & Fish].
- **Single gamefish:** bass are "oval-shaped blobs" [J, In-Fisherman] and "a bright dense dot" [J, Wired2Fish].
  Hard-scaled carp read brighter than catfish, and gar can be made out "by the profile" [F, Pond Boss].
- **Bass on bottom:** "they do blend into the bottom a lot of times but I can see where they are sitting because of
  a brighter glow or a little small hump" [F]. On firm bottom they can be "nearly impossible to separate" [F].
  Forward view is "really not getting the last two feet" [J, Wired2Fish]. Bottom Fill "can mask fish close to the
  bottom" [J, Livingston Lures].
  - [D] Why: across the 20° slab the bottom is hit over a band of ranges for each beam angle, so a thick bottom
    return swallows anything within about 0.3–0.6 m of the bottom at range. Near the boat this band is thinner.

### 7. Shadows

- **Forward view:** no source mentions fish shadows. [D] The slab is metres wide and a fish blocks only a
  sliver, so there is no visible shadow. Draw none, or at most a barely visible one for a big fish right on the
  bottom near the boat.
- **Perspective (plan) view:** users call it "real time side imaging" with "shadows on the objects on the bottom",
  and say "like side scan, [it] shows what the sonar hits and also shows the shadows" [F, BBC Boards Perspective
  thread; Crappie.com]. Wired2Fish: "you can see the shadows and little dots swimming around the screen" [J].
  Imaging-sonar science uses the "fish's acoustic shadow" as a classification cue [S, arXiv 2109.10664].
  - **The lake's current Panoramic fish-shadow blotch matches this.**

### 8. Down mode and Perspective mode

- **Down:**
  - It looks like a 2D screen but live, with "physical profiles of swimming fish and your jig below" [J]. Fish are
    not arches. One guide says they are "bright dots, dashes, or small blobs" [J].
  - It is the best view for reading a fish's mood and response to the bait, and for ice fishing
    [J, Wired2Fish ice article; J, Fish'n Canada].
  - [D] Fish directly below are seen at dorsal aspect, which is strong. If the body lies along the fan it shows
    nearly full length as a horizontal shape. If it lies across the fan it is a short blob. Directly below, arc
    smear is horizontal.
- **Perspective:**
  - The transducer is turned so the 135° fan is horizontal and 20° thick. It gives a top-down view [J/M], best in
    water under about 15–25 ft [J/F], and Garmin says ≤ 50 ft (15 m) [M].
  - Fish are "small, concentrated dots moving across the wide field of view", "shadows and little dots"; clusters
    of schooled fish show up [J].
  - "Shows you the backs of fish" (Fish'n Canada ice article) [J]. In shallow water, contrast between fish and the
    ground return is hard to resolve [F].
  - Lowrance calls the equivalent "Scout" (about 135–160°) and Humminbird calls it "Landscape" [M].

### 9. Artifacts

- **Ghost tree:** a "semi-circle or V-shaped image that looks like a tree but isn't really there" [F, Crappie.com].
  It is caused by strong returns, especially from a hard bottom in shallow water [M], appears only in Forward, and
  "stays in more or less the same location on your screen as you move" [J, Sportfishing Buddy]. Garmin TechTip
  video: "Ghost Tree / Blind Spot with LiveScope" (youtube.com/watch?v=bYS3QvODZwk).
- **Second bottom** at about twice the depth over a hard bottom in shallow water [J].
- **Beam seams:** a viewer comment on a side-by-side video says MEGA Live 2 "stitches beams more smoothly, while the
  Garmin shows hard edges at individual beam boundaries" [F, YouTube eU26U8PvAhY]. Radial striations or fine
  "spokes" in the far field are plausible on LiveScope.
- **Side lobes:** strong reflectors produce weaker false copies beside them [S, ultrasound side-lobe artifact]. In a
  fan this means **faint copies along the same range arc** next to a very strong target such as a big fish or
  timber [D].
- **Arc curving at long range:** this is the arc smear in rule 1. Distant point targets become short curved
  segments of the range circle [D]. It matches the `////` reports [F].
- **Radial thinness:** marks are thin in range and fat across the arc [D]. DIDSON science splits "cross-range" and
  "down-range" resolution, and "because the beam widths grow wider with range, fish at close range are better
  resolved than fish at far range" [S, ADF&G aiming protocol]. Length accuracy is "inversely proportional to the
  beamwidth" [S, Parnum 2024].
- **Double images:** no source describes duplicated *fish*. Ghosts are tied to the bottom and other strong
  returns [M].
- **Panoptix (the older Garmin) fish** were "blobs" without much detail [J, Sportfishing Buddy]. This is the look
  to avoid for a modern LiveScope-class picture.

### 10. Specs mapped to the look

See the tables above. In short:

- 0.6–1° of angular resolution gives arc dashes beyond about 20 m and body shapes within about 6 m.
- The 20° thickness gives seconds-long fade-in and fade-out and collapses the length of crossing fish.
- A radially thin pulse gives thin marks, with radial extent set by the body.
- A narrow broadside echo lobe makes turning fish flash.

---

## Videos to watch (picked from titles and descriptions; not viewed)

Close fish and identifying them:
- "How To Identify Fish On LiveScope" (Cory Johnston, bass vs gar/carp/catfish): https://www.youtube.com/watch?v=ewTzIiD98Yo
- "Identify Fish with Garmin LiveScope": https://www.youtube.com/watch?v=u8ttW1kMkh0
- "HOW TO IDENTIFY CRAPPIE USING LIVESCOPE, EP 23" (crappie vs catfish vs shad on one screen): https://www.youtube.com/watch?v=WBiyVjAhE5Q
- "What do Big Crappie look like on Livescope": https://www.youtube.com/watch?v=rkAxYYbFzwM
- "What A Big Crappie Looks Like On Livescope": https://www.youtube.com/watch?v=qraBtBxTrSA
- "What Big Crappie Look Like on Livescope" (Dale Hollow): https://www.youtube.com/watch?v=v6OUdzv3CTk
- "Mastering LiveScope #1 - A Complete Guide to Reading FFS": https://www.youtube.com/watch?v=XLOlbsSFxY0

Full-screen footage (best for timing, flicker and turning):
- "Crappie Fishing with LiveScope!! Fullscreen 'Video Fishing'": https://www.youtube.com/watch?v=rGur997frlc
- "Crappie Fishing with LiveScope Plus! Full-Screen … Lake Darbonne": https://www.youtube.com/watch?v=pDbtTydCq7w
- "Bass Fishing with LiveScope Plus!! Full-Screen LiveScope Footage!!! Lake Claiborne": https://www.youtube.com/watch?v=DsiXHkYXPfs
- "Winter LIVESCOPE Jerkbait Fishing in STANDING TIMBER (Livescope Screen Footage)" (bass turning on a bait): https://www.youtube.com/watch?v=Jvs-2EIQGcg
- "Watch these Double Digit Bass go into a FEEDING FRENZY!! (Livescope Recording)": https://www.youtube.com/watch?v=OO2ksx41fFM
- "Crushing Fish with GARMIN LIVESCOPE - EPIC Footage" (hybrids hitting bait): https://www.youtube.com/watch?v=kAK4NRfve6Y

Schools:
- "HUGE SCHOOL of CRAPPIE": https://www.youtube.com/watch?v=LGSnb6_nz_w
- "Catching fish with Livescope (Striped Bass)": https://www.youtube.com/watch?v=hv2fm2_1cLs

Big elongated fish:
- "LiveScope Musky Jigging (Garmin Panoptix)": https://www.youtube.com/watch?v=BnWyBi6e5Ls
- "LiveScoping Muskies in Minnesota": https://www.youtube.com/watch?v=zp-UDslnQsM

Perspective mode and shadows:
- "Perspective Mode for Shallow Water Bass Fishing (Episode 19)": https://www.youtube.com/watch?v=8I5fA8eYsy4
- "Garmin Livescope forward vs Perspective mode: on the water comparison": https://www.youtube.com/watch?v=xkEOrwd0x9w
- "Garmin Panoptix Livescope Perspective Mode Test": https://www.youtube.com/watch?v=xsAkbAFtm6A

Ice:
- "How to use Garmin Panoptix Livescope Ice Fishing - Forward and Down View (Suspended Crappie)": https://www.youtube.com/watch?v=CtfvsNsezK4
- "Ice Fishing Walleyes with a Garmin LiveScope": https://www.youtube.com/watch?v=6qYV4y97qE8
- "Ice Fishing River Walleye & Sauger With Livescope Plus": https://www.youtube.com/watch?v=shJcU1qL-7k
- "Jigging Walleye on the Detroit River with Garmin Livescope in Down View": https://www.youtube.com/watch?v=H5bF31PwuOQ

Brand comparisons (beam seams, smoothness):
- "Side by Side Comparison - Garmin Livescope Plus vs Humminbird Mega Live 2": https://www.youtube.com/watch?v=eU26U8PvAhY
- "The Forward Facing Sonar Battle Rages On - LiveScope+ VS ActiveTarget 2": https://www.youtube.com/watch?v=Ix10CEtZuQM
- "Livescope VS Active Target / IN-DEPTH On Ice Comparison": https://www.youtube.com/watch?v=HHdmpWEIRZk

Artifacts:
- "TechTip - Ghost Tree / Blind Spot with LiveScope": https://www.youtube.com/watch?v=bYS3QvODZwk

---

## How the current lake code compares (from a quick read of `sonarMarks.js` and `fishEcho()` in `sonarShader.js`)

Already right:
- Polar anisotropy: radial width comes from pulse length and tangential width from R × beam half-angle.
- In Forward and Down, the body is projected into the plane, so a crossing fish becomes a dot.
- The 20° slab has a flat-topped beam pattern.
- There is an aspect term.
- Panoramic draws fish shadows.

Likely causes of the "elliptical ball" look:
1. Every mark is a single smooth Gaussian capsule with a symmetric `sin(πh)` taper, so all fish have the same
   shape. Instead, use an off-centre swim-bladder kernel plus separate weaker head and tail highlights, which split
   apart at oblique aspect.
2. Aspect only scales strength by 0.5 to 1.0 (Forward) or 0.72 to 1.0 (Panoramic). The real swing is 17–20 dB,
   with a narrow broadside flash.
3. `wink` flickers only head-on fish, on a sine wave. Real fluctuation should be random, per ping, and scale with
   how fast the fish's orientation is changing: hovering fish steady, turning or swimming fish strongly
   fluctuating, bait flipping.
4. The 0.7 s swept trail makes moving fish into long capsules that peak in the middle. A Garmin-like look is the
   current body only, or a trail that decays with age (newest end brightest), drawn fainter or in a trail colour.
5. Far fish should become arc-dashes tilted perpendicular to the ray (`/`), not ellipses. Check that the tangential
   term dominates beyond about 15–20 m, and add slight ragged break-up and dropout there.

---

## Source list

Manufacturer
- Garmin manual, LiveScope and Perspective Sonar Setup (Noise Reject, Ghost Reject, TVG): https://www8.garmin.com/manuals/webhelp/echomapuhd/EN-US/GUID-270044DA-F6EA-4F62-9912-D9B788C84280.html ; https://www8.garmin.com/manuals/webhelp/gpsmap_touch/EN-US/GUID-270044DA-F6EA-4F62-9912-D9B788C84280.html
- Garmin manual, LiveScope and Perspective Appearance Settings (Trails): https://www8.garmin.com/manuals/webhelp/echomapuhd/EN-US/GUID-76DE263E-F57D-4C08-B53A-AD0900E06B30.html
- Garmin manual, Perspective View (≤ 50 ft): https://www8.garmin.com/manuals/webhelp/gpsmap7400-7600/EN-US/GUID-E18615BE-921E-4D26-A518-47DB0F4F53DB.html
- Garmin LiveScope Plus release (14 in @ 100 ft, 35 %): https://www.garmin.com/en-US/newsroom/?p=3428
- Garmin LiveScope 2 release: https://www.garmin.com/en-US/newsroom/press-release/marine/garmin-launches-livescope-2-its-clearest-live-sonar-yet/ ; reprint https://boatingindustry.ca/products/garmin-launches-livescope-2-its-clearest-live-sonar-yet/
- Garmin patents: https://patents.google.com/patent/US20180100922A1/en ; https://patents.google.com/patent/US20230074053A1/en
- Lowrance ActiveTarget 2 XL specs: https://www.lowrance.com/activetarget-2-xl/specifications/ ; ActiveTarget (gen 1): https://www.westmarine.com/lowrance-activetarget-live-sonar-20157871.html ; Lowrance ActiveTarget 2 modes: https://www.lowrance.com/activetarget-2/
- Humminbird MEGA Live 2: https://humminbird.johnsonoutdoors.com/us/shop/accessories/mega-live/mega-live-2-forward-facing-sonar ; modes: https://humminbird-help.johnsonoutdoors.com/hc/en-us/articles/15211885303063-MEGA-Live-Modes-and-Viewing-Angles

Specs and retail
- LVS34: https://sealutions.co.uk/garmin-lvs34-transducer-for-panoptix-livescope-plus ; https://www.gpscentral.ca/product/garmin-panoptix-livescope-plus-lvs34-transducer
- LVS62 XR: https://www.adorama.com/garmin-livescope-xr-system-gls10-sonar-lvs62-transducer/p/gp0100271900 ; https://boatingmag.com/gear/garmin-livescope-xr/
- LiveScope 2 vs LVS34: https://fishfindercoach.com/blogs/fishfinder-coach/garmin-livescope-2-is-here-lvs42hd-and-lvs44-vs-lvs34-which-one-should-you-buy ; https://www.fishusa.com/learn/garmin-livescope-lvs34-vs-livescope-2-lvs42-lvs44/
- MEGA Live 2 vs LiveScope Plus: https://fishfinderlab.com/head-to-head/garmin-livescope-plus-vs-humminbird-mega-live-2/
- Refresh claim (unverified): https://www.bassboatelectronics.com/post/inside-garmin-livescope-how-real-time-sonar-is-changing-fishing-forever

Journalism and guides
- In-Fisherman, Screen Scene: Fast Forward with FFS: https://www.in-fisherman.com/editorial/fast-forward-forward-facing-sonar/519820
- Wired2Fish, How to Identify Size and Species of Fish on FFS: https://www.wired2fish.com/electronic-tips/how-to-identify-size-and-species-of-fish-on-ffs
- Wired2Fish, Garmin LiveScope what it is (last two feet): https://www.wired2fish.com/electronic-tips/garmin-livescope-what-it-is-how-it-works-and-more
- Wired2Fish, Perspective pros and cons: https://www.wired2fish.com/electronic-tips/the-pros-and-cons-of-using-perspective-mode-on-forward-facing-sonar ; Forward vs Perspective: https://www.wired2fish.com/opinions-philosophies/forward-and-perspective-facing-sonar-differences
- Wired2Fish, 10 best LiveScope settings: https://www.wired2fish.com/electronic-tips/the-10-best-garmin-livescope-settings-to-get-the-best-picture
- Wired2Fish, ice: forward vs down: https://www.wired2fish.com/ice-fishing/real-time-sonar-orientation-when-to-use-forward-versus-down-view
- LureNet, What Do I See? Interpreting Live Sonar: https://www.lurenet.com/blog/what-do-i-see-your-guide-to-interpreting-live-sonar/ ; A Crappie Guide's LiveScope Observations: https://www.lurenet.com/blog/a-crappie-guide-livescope-observations-for-crappie-catching-success/
- Fish'n Canada, LiveScope Lessons: https://fishncanada.com/livescope-lessons-forward-view-vs-down-view-vs-perspective-view/ ; High-Tech Hardwater (ice): https://fishncanada.com/high-tech-hardwater-how-to-use-livescope-for-ice-fishing/
- BoatUS, LiveScope 2 review: https://boatus.geico.com/expert-advice/expert-advice-archive/2026/august/garmin-livescope-2/
- The Fish Finders, LVS32 field test: https://the-fishfinders.com/fish-finders-sonar/fish-finder-reviews/garmin-panoptix-livescope-review/
- Sportfishing Buddy: https://sportfishingbuddy.com/panoptix-vs-livescope/ ; https://sportfishingbuddy.com/garmin-livescope-problems/
- Tackle Shack AU: https://tackleshack.com.au/blogs/fishing-articles/getting-started-with-garmin-live-scope
- FishfinderCoach: Trails https://fishfindercoach.com/blogs/fishfinder-coach/understanding-trails-on-garmin-livescope-lvs32-and-lvs34 ; Ghost Reject https://fishfindercoach.com/blogs/fishfinder-coach/understanding-ghost-reject-on-garmin-livescope-lvs32-and-lvs34 ; Pollen https://fishfindercoach.com/blogs/fishfinder-coach/how-spring-pollen-affects-livescope-and-other-forward-facing-sonar
- Livingston Lures settings: https://www.livingstonlures.com/blogs/news/how-to-set-livescope-for-bass-fishing-forward-facing-sonar-settings-for-a-clear-screen-and-seeing-bass
- Mercury Marine, crappie FFS basics: https://www.mercurymarine.com/lam/en/lifestyle/dockline/the-basics-of-crappie-fishing-with-forward-facing-sonar
- CrappieNow (football echoes): https://crappienow.com/MAG/?p=24177
- John in the Wild (crappie flick and glide): https://johninthewild.com/?p=23505
- PartsVu, reading a fish finder (specks, clouds): https://partsvu.com/blogs/boating-resources/how-to-read-a-fish-finder-screen-a-complete-guide
- Outdoor Life, how to read a fish finder: https://www.outdoorlife.com/fishing/how-to-read-a-fish-finder/
- Arkansas Game & Fish, crappie and scope: https://www.agfc.com/news/sighting-in-on-crappie-with-a-scope/
- Star Tribune (muskies "like torpedoes"): https://www.startribune.com/minnesota-fishing-enthusiasts-bash-technology-that-allows-anglers-to-sharp-shoot/601309171
- Western Bass (LiveSight trail colours): https://storage.westernbass.com/mag_wb/wb_mag_winter_2020/page77/index.html

Forums
- BassResource, Garmin LiveScope help (fade, aspect): https://www.bassresource.com/bass-fishing-forums/topic/265192-garmin-livescope-help/
- Crappie.com, Deep Thinkers (crappie returns): https://forum.crappie.com/t/livescope-questions-for-deep-thinkers-crappie-display-returns/437700
- Crappie.com, LiveScope question (`////` at 40–60 ft; one of several matching threads): https://forum.crappie.com/t/livescope-question/423022
- Crappie.com, cone angle (beam width ≈ 0.35 × distance): https://www.crappie.com/crappie/side-down-imaging/396619-livescope-cone-angle/
- Crappie.com, Using the Garmin LiveScope (Josh Jones, grid, 35 ft): https://fishing.crappie.com/using-the-garmin-livescope-from-the-horses-mouth-josh-jones-by-bernard-william/
- Crappie.com, jigheads (orientation and reflection): https://forum.crappie.com/t/jigheads-that-show-up-better-on-livescope/424573
- Crappie.com, ghost tree: https://www.crappie.com/crappie/fishing-electronics-and-photography/419750-ghost-tree/
- Crappie.com, seeing fish on the bottom: https://forum.crappie.com/t/livescope-seeing-fish-on-the-bottom/401348
- BBC Boards: distance https://www.bbcboards.net/showthread.php?t=961816 ; deep water https://www.bbcboards.net/showthread.php?t=992296 ; bass on bottom https://www.bbcboards.net/showthread.php?t=1083184 ; Perspective https://www.bbcboards.net/showthread.php?t=1036832&page=2 ; settings and vertical lines https://www.bbcboards.net/showthread.php?t=1273776
- In-Depth Outdoors (fish from the bottom of the screen): https://www.in-depthoutdoors.com/community/forums/topic/have-you-ever-seen-fish-come-from-the-bottom-portion-of-your-livescope-screen/
- Pond Boss (carp brighter than catfish, gar profile): https://forums.pondboss.com/ubbthreads.php?ubb=showflat&Number=556519
- 2coolfishing (fins and tails moving): https://www.2coolfishing.com/threads/garmin-livescope-panoptics-forward-facing-sonar.2653871/

Science
- Love 1971, Measurements of fish target strength: a review: https://spo.nmfs.noaa.gov/sites/default/files/pdf-content/1971/694/love.pdf
- Target strength vs aspect, simple high-frequency model: https://www.researchgate.net/publication/229621309_Simple_model_on_the_relationship_between_fish_acoustical_target_strength_and_aspect_for_high-frequency_sonar_in_shallow_waters
- TS of European fish species (side aspect strongest): https://www.researchgate.net/publication/223899615_Target_strength_of_some_European_fish_species_and_its_dependence_on_fish_body_parameters
- Foote 1980, importance of the swimbladder: https://darchive.mblwhoilibrary.org/bitstream/1912/5660/1/JAS002084.pdf
- Burwen et al. 2007, complexity of echo envelopes vs side-aspect angle: https://www.acoustics.washington.edu/hornefac/pubs/2007%20burwen%20et%20al%20-%20complexity%20of%20echoes.pdf
- Mueller et al. 2010, tail-beat patterns in DIDSON echograms: https://courses.washington.edu/fish538/resources/Mueller%20et%20al%20Tail-beat%20patterns.pdf
- AFS 2011, DIDSON tail-beat frequencies: https://afs.confex.com/afs/2011/webprogram/Paper3584.html
- DIDSON observation bias (aspect, edges, range): https://www.sciencedirect.com/science/article/abs/pii/S0165783614000770
- Parnum 2024, length accuracy inversely proportional to beamwidth: https://besjournals.onlinelibrary.wiley.com/doi/full/10.1111/2041-210X.14319
- ADF&G aiming protocol (cross-range vs down-range): https://www.adfg.alaska.gov/fedaidpdfs/fms09-03.pdf
- Echo statistics, Acoustics Today 2021: https://acousticstoday.org/issues/2021AT/Summer2021/files/basic-html/page64.html
- Acoustic cameras, multi-species detection (shadow and caudal-fin cues): https://arxiv.org/pdf/2109.10664
- Side-lobe artifact (ultrasound): https://globalultrasoundinstitute.com/pocuspedia/side-lobe-artifact/
