# Handoff draft: the Lab on the store page, mounted in the page (no iframe) — revises 2026-10-23-lab-store-page

**Status:** draft written in the Lab repo (decision #142). This cloud chat cannot reach `accuphy-website`; a chat on
Jason's Mac copies this file to `accuphy-website/handoffs/` (in that project's handoff format) and it revises
`2026-10-23-lab-store-page.md` (#134). Nothing here is live: the Lab is not deployed to Vercel yet, and no theme changes.

## Why the change
Jason (2026-10-24): "iframe 啊，乱七八糟这些东西，能不能找别的 option … 落地性更好的", then on the choice: "你按照最适合的".
Research `docs/embed-options.md` (Lab repo) ranks a theme-mounted Lab first: one document instead of a page inside a page —
no postMessage, one scroller on phones, Meta and Klaviyo first-party, Shopify's customer events called directly.

## What stays from #134
- The address `shop.accuphy.com/pages/lab` (Canada first, then `/en-us/pages/lab`), its JSON template and the
  header-less layout `layouts/lab.liquid`.
- The tracking design: the Shopify customer event `accuphy_lab`; a Custom Pixel forwards it to Meta (`signup` → `Lead`,
  the rest `trackCustom`); no personal data in events.
- The Lab is built and released on its own (Vercel, #102); the theme is published only when the section changes.

## What changes
1. **The section body** is a `<div>` and a module script instead of an `<iframe>`:
   ```liquid
   <div id="accuphy-lab" data-market="{{ localization.country.iso_code }}">
     <p class="lab-fallback">Loading the Accuphy Lab…</p>
   </div>
   <script type="module" src="{{ section.settings.lab_host }}/embed/lab.js"></script>
   ```
   `lab_host`: the Vercel address at first, `https://lab.accuphy.com` once the CNAME exists. `embed/lab.js` is a stable
   URL (cached 5 minutes) that loads the current build; a Lab release never touches the theme.
2. **The layout** `layouts/lab.liquid`: keep `{{ content_for_header }}` (Shopify analytics, the pixels, Klaviyo onsite)
   and the section; **leave out the theme's stylesheet and scripts** (the "lean layout") so nothing of the theme collides
   with the Lab's styles. Lock the page: `html,body{height:100%;margin:0;overflow:hidden;overscroll-behavior:none}`.
   Hide any app embed that would sit on top (chat bubble, pop-ups) with a few CSS rules — list them while testing.
3. **Events:** the Lab calls `Shopify.analytics.publish('accuphy_lab', { event, ...data })` itself. The section no longer
   listens for `postMessage`. Events: `ready`, `first_drag`, `view` (`{ view, device, source }`, only on a real pick),
   `signup` (only if a sign-up form is switched on — that funnel is the Klaviyo chat's decision, #139). The Custom
   Pixel reads `event.customData.event`.
4. **Gone:** the iframe, the postMessage listener, `window.top` shop links, the `frame-ancestors` dependency, UTMs
   passed into an iframe URL (they are simply in the page URL now).

## Lab side (done in the Lab repo, #142)
`node scripts/build-share.mjs && node scripts/build-embed.mjs` → `dist-share/pages/` (one Vercel deploy):
`index.html` (the standalone page), `embed/lab.js` (loader), `embed/lab-<hash>.js` (the build, CSS and fonts inside),
`embed/test.html` (a stand-in store page), `vercel.json` (CORS `*` and caching on `/embed/`, `noindex`).
Checked from a second origin at 1440×900, 390×844 and 844×390: mounts, fonts and logo load, `ready` and `view` reach
`Shopify.analytics.publish`, no console errors.

## Test plan on the theme copy (before publishing anything)
1. Duplicate the live theme; add the template, layout and section there; open `?preview_theme_id=…`.
2. Desktop, iPhone Safari, Android Chrome, Instagram and Facebook in-app browsers: the Lab fills the screen, no page
   scroll, the boat drags, phones open on the app's Home, sideways phones show the app full-screen (#141).
3. Shopify Customer events → the Custom Pixel's test view shows `accuphy_lab` events; Meta Events Manager test events.
4. App embeds: note anything drawn over the Lab and hide it in the layout.
5. Fallback if the theme copy shows a conflict that cannot be fixed: the iframe of #134 still works (the Lab keeps its
   postMessage path when it runs inside a frame).
