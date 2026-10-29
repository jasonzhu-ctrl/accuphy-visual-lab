# Blue Hour Lake — code and private preview

Delivery scope selected by the user on 2026-10-29: code and private HTTPS preview first. Shopify is not uploaded.

- Preview: https://accuphy-blue-hour-lake-20261029.accuphy-1012.chatgpt.site
- Access: owner-private; sign in with the owning ChatGPT account. No external viewers or public audience were added.
- Authoritative source: https://github.com/accuphy-marketing/accuphy-visual-lab/tree/codex/blue-hour-lake
- Draft review: https://github.com/accuphy-marketing/accuphy-visual-lab/pull/31 (not merged).
- BASE_SHA: `48f15ccc990fdb69f9edd1a04d14257d100da610`.
- Built source commit: `697605583698a1659d371be4a8ed9b0b07a1896c`; clean working tree at build.
- Sites compiled-artifact commit: `61947792059b561a7cc9eeb3f1f2bc29d37f2209`.
- Local release: `D:/shopify/output/blue-hour/release-final/`.
- Local distributable: `D:/shopify/output/blue-hour/accuphy-blue-hour-delivery.zip`.
- The manifest records the build hashes, protected source hashes, brand Logo hash and reference hash. Later documentation commits do not change this artifact.

## Scope and limits

The original sonar pipeline, original fish/world data and original Mini views are reused. Step 1 moves the real boat to the existing shelf and selects Forward; Step 2 moves to the existing hump and selects Down. Mini has no approved Panoramic in this baseline, so Step 3 explains its unavailability and does not fabricate a capability. Original PingLive Panoramic is retained on the original route.

This is a review build, not final Shopify acceptance. The environment uses the existing low-poly boat/terrain with a distant dusk backdrop; final visual approval is outstanding. The complete latest brand manual was not in the supplied Logo folder. True touchscreen, Safari, pinch zoom, real theme editor, real-mobile performance and post-upload market previews are NOT TESTED. Initial interactivity was about 18 seconds on the local test host and needs improvement. Strict hardware-GPU pixel equality is not claimed: 31/36 all-device cases matched three-way, with baseline-repeat differences preserved; the controlled Mini software-rendered fixture passed 18/18 exactly.

## Evidence

Required contracts and reports are alongside this document: reference-contract.md, sonar-source-of-truth.md, baseline-and-regression.md, product-capability-matrix.md, integration-and-deployment.md and final-qa.md. Machine-readable summaries, online screenshots and recordings are under evidence/. Full raw baseline images and intermediate diagnostics remain in `D:/shopify/output/blue-hour/`.

Online QA: **PASS for the tested Chrome viewport fixtures**. All six required viewport sizes loaded and refreshed successfully, with no page errors, no failed network requests, no broken images and no horizontal overflow. Wheel input over canvas, steps, sonar and controls produced native scroll. On narrow pages, a control already at the document bottom was tested by scrolling upward, rather than treating the absence of further downward travel as a scroll defect. These tests do not substitute for physical touchscreen testing.

All three deployed JS/CSS/loader assets returned HTTP 200 in the authenticated browser and matched the release SHA-256. Owner-only access is verified from the Sites policy; the unauthenticated HTTP probe returned 403. An earlier Node fetch with the service header also returned 403 while the browser succeeded; that transport diagnostic is retained in `evidence/online-initial-diagnostic.json`, not reported as a successful asset check. Final authenticated browser hashes and image checks are in `evidence/online/results.json`. Service access uses the documented Sites header; it does not test owner browser sign-in.

No local server is required by the HTTPS deployment. Owned local servers were stopped, ports 5180–5184 were checked with no listeners, then the HTTPS page was loaded, operated and refreshed again at 1440×900: PASS, HTTP 200, all asset hashes still matched, no broken images/errors. Evidence: `evidence/online-after-shutdown.json`. Source review remains a draft until the listed acceptance gates are resolved.
