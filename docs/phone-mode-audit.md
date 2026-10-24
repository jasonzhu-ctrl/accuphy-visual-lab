# Phone "real device mode": Jason's rules vs the code (audit 2026-10-24, decision #138)

Jason's rules (2026-10-24): on a phone the Lab behaves like the real app. **PingLive:** a Home page where the visitor
picks a view, enters it, and can go back. **PingLive Mini:** only a few modes are offered (as on the ice page); the other
tiles are blurred, not hidden. Inside a view the **⋯ settings page cannot be entered**. **Range** is changed with the
phone's own −/+, not the desktop slider. "If I missed anything, look it up."

## What the code does today (lake page, portrait)

| Rule | Done? | Where | Gap |
|---|---|---|---|
| Home → pick a view → back to Home | yes | `index.jsx:87–89, 147, 331–332`; `home/AppHome.jsx`; `SonarChrome.jsx:133–135` (#107, #110, #122) | the ice page does not open on Home; Home cannot be closed without a pick; the Setting · Home · Map tab bar does nothing; broken sideways |
| Mini: a few modes open, the rest frosted | yes: Live Forward / Live Down / Live Combo / Live Ice Fishing open; Live Panoramic, Down Scan, Chirp Sonar, Ice Fishing (2D) frosted, tap → toast "Available with Accuphy PingLive Mini" | `AppHome.jsx:33–42, 82–89`; `index.css:94`; `devices.js:40` (#121) | the 2D **Ice Fishing** tile is frosted — Jason named "Ice Fishing" among the Mini's views, confirm; the **Live Ice Fishing link is broken in public builds** (`AppHome.jsx:84` writes the full URL into the hash) |
| ⋯ cannot be entered | yes on the lake page: greyed, a tap does nothing (#118) | `SonarChrome.jsx:157–158`; `index.jsx:225` | ice page on phones: `app` is undefined, so a tap opens the sign-up gate / the toast |
| Range on the phone's −/+ | yes on every phone page; AUTO greys them in Down and Live Ice; none in Combo (as the app) | `SonarChrome.jsx:136–145`; `index.jsx:226–230, 258, 277, 331` (#78, #125) | sideways phones (≥ 640 px wide) get the desktop slider and lock the phone buttons |
| Gain, pause, depth on the phone | lake page only | `index.jsx:225`; `SonarChrome.jsx:118–128, 146–156` (#114) | ice page: locked |
| Sideways phone = real device mode | **not built** | plan Phase 4; #119; backlog | all phones are > 640 px wide sideways → desktop layout, panel and cards over the picture |
| App details | partly | `docs/app-chrome.md:71–72` | no Live Forward zoom `1.0x ˄˅`; Live Down range forced to AUTO (#65); phone hint text out of date (`index.jsx:350`) |

`isPhoneLayout = window.innerWidth < 640` (`SonarScreen.jsx:16`) decides everything: width only, no orientation.

## Embed events (#134) in the phone flow

- `view` fires on load with `forward / PL` while Home is still open (nobody picked it); picking PingLive Forward first
  sends nothing (already the default state); opening Home sends nothing.
- `first_drag` never fires on the ice page (`IcePick` has no event); `signup` never fires in public builds
  (`VITE_NO_GATE`); `shop_click` and `found_sign` are not built; `isEmbedded()` is unused; `100dvh` not applied.

## What the sideways mode would have to respect (from #133/#134 and `docs/embed-options.md`)

- The Lab's screen is the host page's viewport (iframe or mounted div), never the device: "full-screen" = fill the
  visible viewport (`dvh`/`svh`, `viewport-fit=cover`); the browser's own bars stay. No Fullscreen API on iPhone or in
  the Facebook / Instagram in-app browsers.
- No orientation lock on the web: react to rotation, at most a dismissible "turn your phone" line; no rotate wall.
- The host page must not scroll (one scroller), or the boat drag fights it.
- Sign-up and shop entries must stay reachable in the full-screen sonar layout; the events must keep firing.

## Proposed (not built — Jason's go needed)

Trigger: viewport wider than tall and under 500 px tall. Layout: the sonar with the app's chrome fills the viewport;
the lake becomes a corner inset (~28 %) that taps to enlarge; the desktop panel and step cards are hidden; a small
top-right entry to sign-up / shop. Portrait stays as it is. Also to fix while there: the ice page's Home-first, gain /
pause / ⋯ on phones, the Live Ice Fishing link, the `view` event, the hint text.
