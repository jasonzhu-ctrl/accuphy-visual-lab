---
name: lab-test-link
description: Rebuild and update the public Accuphy Lab test link (https://jasonzhu-ctrl.github.io/accuphy-lab-test/) after the sonar lake page changes — use when Jason wants friends to see the latest version or says the shared link is out of date or broken.
---

# Updating the shared test link

1. Run the `sonar-qa` skill first (at least the build, the Safari texture grep and a view check).
2. `node scripts/build-share.mjs <scratchpad>/lab-share` → `accuphy-lab.html` (Artifact form) and `pages/`
   (full page with `noindex`, `robots.txt`, `.nojekyll`). The share build has no sign-up gate (#71). The script
   fails if any file reference is left un-inlined — fix the replacement, never skip the check.
3. Test the single file locally: wrap `accuphy-lab.html` in a doctype/head/body copy, serve it with
   `python3 -m http.server` from the scratchpad (the Browser pane cannot open /private/tmp files), check fonts
   (`document.fonts`), no network requests for `brand/`, views render, no console errors. Stop the server after.
4. GitHub Pages: clone or reuse `jasonzhu-ctrl/accuphy-lab-test`, copy `pages/*`, commit, `git push` (the keychain
   login works; `gh` is not installed). Poll the live URL until its md5 matches the build.
5. No private claude.ai preview any more: Jason had the four old ones deleted on 2026-10-27 ("留一个就行了" — the test
   link does the job). Rebuild every page from one commit (#176) and log it in `docs/versions.md`.
6. Never create a new public surface (new repo, Pages site, public share) without Jason's explicit yes in chat; the
   safety check may still require him to click it himself — give him the exact clicks once.
7. Tell Jason what changed and ask a friend on an iPad/iPhone to confirm when Safari matters.
