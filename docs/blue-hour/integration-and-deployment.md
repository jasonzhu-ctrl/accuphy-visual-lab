# Integration and deployment

This branch is a reviewable implementation with an owner-private HTTPS preview. Shopify upload remains **BLOCKED / deferred at the user's request** (2026-10-29: deliver code and private preview first). No theme, market settings, product data or shared navigation was changed.

## Source and artifacts

BASE_SHA `48f15ccc990fdb69f9edd1a04d14257d100da610`; branch `codex/blue-hour-lake`. Existing `D:/shopify/accuphy-visual-lab` checkout was preserved. Work is isolated in `D:/shopify/blue-hour-lake`; baseline checkout is `D:/shopify/blue-hour-baseline`. No force push, merge, organization-setting change or other deployment.

One source pipeline: `share/blue-hour.jsx` mounts the original lake wrapper with Blue Hour presentation. `node scripts/build-blue-hour.mjs <empty output directory>` produces standalone index + hashed JS/CSS, loader, a theme Section package and manifest. Both targets use identical JS/CSS assets. Do not deploy an artifact whose manifest has `dirty:true`.

The manifest includes the source commit, baseline core version, source asset hashes, protected module hashes and build asset hashes. Fonts are inlined after Vite compilation; the early Vite `/brand/fonts/` warnings are resolved by the build's inlining pass. No GitHub or Shopify credentials enter the frontend.

`node scripts/prepare-blue-hour-theme.mjs <fresh backup directory> <build directory>` produces a US-context template patch and `theme-change-manifest.json`. It asserts exact store/theme/role/context, replaces only `us_mini_interactive_20261028`, and deep-compares every other section and order entry. It does not upload.

## Shopify read-only audit

Verified via authenticated Admin API on 2026-10-29:

- Store: `bhuekt-nw.myshopify.com`.
- Theme ID: `189488890029`; name: `Copy of New site rollout- Oct15`; role: `UNPUBLISHED`.
- US: `templates/index.context.us.json`, parent `index.json`, market `us`. Current first section is `us_mini_interactive_20261028` (custom-liquid iframe Hero).
- `config/markets.json`: US and CA each inherit `@default`. US does not parent CA or other markets.
- No CA-specific index template was present in the enumerated index range. Default index remains unchanged. Other contextual index files were EU Europe, Luxembourg, Paraguay and Romania.
- Baseline MD5 US: `8b80c6be77fd541ea6c4e4bb01146241`; default: `1707114fe16d89b4123853aa5b7823af`; markets config: `ddc60876bc7843cbf42aa7ac56d6ebed`.
- Local remote-content backups: `D:/shopify/output/blue-hour/theme-backup/`. Backups are not committed as an unrelated full theme.

The new Section also checks homepage + country US. It is referenced only by the US contextual template. CSS selectors are scoped under `[data-accuphy-blue-hour]`; no global overflow lock. Header, announcement bar and downstream sections are untouched. The original demo iframe is not used by this package.

Theme-editor lifecycle: loader mounts one instance per host, handles section load/unload, unmounts React and disconnects owned observers/listeners. React owns its WebGL canvas and resources. Repeated loader execution is de-duplicated by browser ES modules. Synthetic lifecycle was tested locally; real theme-editor reload and shared-page CSS interactions remain NOT TESTED until upload gates pass.

## Safe upload procedure after gates pass

Re-read store, theme role, current file content/checksums and market context immediately before upload. If role is live, or any expected checksum differs, STOP and review the new remote changes. Rebuild from a clean committed tree and produce a fresh whitelist. Inspect environment variable names for implicit Shopify CLI targets/publish flags; do not print tokens.

Use `shopify theme push --store bhuekt-nw.myshopify.com --theme 189488890029 --nodelete` with explicit `--only` arguments for the generated manifest's five files: hashed JS, hashed CSS, loader JS, `sections/accuphy-blue-hour.liquid`, `templates/index.context.us.json`. Never push the directory without the whitelist. No `--unpublished` (creates a new theme), no `--live`, `--allow-live`, `--publish` or theme publish.

After upload: verify HTTPS asset paths, refresh, models, modes, all scroll surfaces, theme-editor reload, US rendering, CA/default/international hashes and previews, and role still UNPUBLISHED. Actual theme integration is not certified by local `theme check` or the synthetic host tests.

Rollback: restore only the backed-up US context file after another concurrency check; old assets remain because nodelete was used. Do not delete unrelated remote files or restore the entire theme.

## Owner-private HTTPS preview

Published on Sites: https://accuphy-blue-hour-lake-20261029.accuphy-1012.chatgpt.site . Access remains owner-only: one owner, zero external visitors, no groups. This is an independent technical review environment; it is not the Shopify storefront. Source remains private. Browser QA uses the platform's documented service-access header, retained in memory only and sent only to this Site. Owner sign-in UX is NOT TESTED by that service-access test.

Source commit `697605583698a1659d371be4a8ed9b0b07a1896c`; clean build manifest in `release-final`. Sites artifact repository commit `61947792059b561a7cc9eeb3f1f2bc29d37f2209` contains only compiled output plus hosting metadata, not a second maintainable sonar engine. Project `appgprj_6ae2e5e17cec819194571a920a66df17`; deployment `appgdep_6ae2ec8d5394819199f460e9c61e1617` succeeded; version `appgprj_6ae2e5e17cec819194571a920a66df17~appgver_804ac80472288191b62ff4043329414d`. Rebuild from the authoritative branch for future updates; do not edit compiled output. Existing standalone/source links are not replaced.

GitHub REST confirmed this repository is private and current access has push/pull, not admin/maintain. Pages returned 404 and no Actions workflows/deployments were configured. Pages is not used. [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) and Shopify production hosting remain separate concerns.

Shopify CLI returned `Authorization is required`. No attempt was made to upload via another API to evade the requested CLI workflow. Future upload requires login, a fresh role/concurrency/market check and completion of the remaining acceptance gates; the prepared backup is not assumed current indefinitely.

CLI semantics checked against [Shopify theme push documentation](https://shopify.dev/docs/api/shopify-cli/theme/theme-push). User's explicit scoped request governs this branch's work; older repo handoff-only guidance is documented, not used to broaden authorization or touch other themes.
