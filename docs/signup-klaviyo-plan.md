# Sign-up gate + Klaviyo — plan (decision #38)

Jason 2026-09-24: the buttons drawn on the phone inset are the real app's
controls, but on this page they are display-only. They look disabled, and a tap
opens a sign-up form. The form cannot be closed without signing up, and the
lake and the sonar picture stay frozen while it is open. The form says we
respect the visitor's inbox. Later the form feeds a Klaviyo list.

## 1. What is built (2026-09-24)

| Piece | Where | Behaviour |
|---|---|---|
| Display-only app buttons | `SonarChrome.jsx` (`LockedCtl`), `.ph-ctl` in `src/index.css` | Back, range −/+, pause, gain −/+, ⋯ and the depth −/+ are drawn at 42 % opacity (the iOS / Material "disabled" treatment: same colour, lower opacity, no hover or press state, default cursor). The values between them (`80ft`, `57%`, `AUTO 180ft`) stay full white, because they are live readouts. |
| Gate | `SignupGate.jsx` | Frosted-glass card over a dimmed, blurred page. No close button; Escape and clicks outside do nothing; the page behind is `inert`. Email field focused on open; the page's own validation message (no browser bubble). |
| Freeze | `Scene.jsx` `LakeScene paused` → `<Canvas frameloop="never">` | The last frame stays on screen; everything resumes on sign-up. |
| Remember | `signup.js` (`localStorage` flag `accuphy_sonar_signup_v1`) | After sign-up the gate never shows again in that browser; a tap on an app button then shows a short hint above the phone instead. Private windows may ask again next visit. |
| Klaviyo call | `signup.js` `submitSignup` | **Off until the two keys are filled in.** Today nothing leaves the browser. |

Copy on the card (English source, `SignupGate.jsx`):
- Title: *These are the real app controls.*
- Body: *Sign up to keep exploring — we'll send you PingLive tips, product news and early offers from Accuphy.*
- Button: *Sign up & continue*
- Small print: *We respect your inbox: no spam and no sharing — just a few emails from Accuphy. Unsubscribe anytime.* + link to the privacy policy (`https://accuphy.ca/policies/privacy-policy`, which redirects to the Shopify store's policy page).

## 2. Turning Klaviyo on (Jason, ~15 minutes, when the page goes public)

1. **Create the list** in Klaviyo: *Audience → Lists & segments → Create → List*, name **"Website — Sonar Beam Explorer"**.
2. **Choose the opt-in** in the list's settings. **Double opt-in** is recommended (Klaviyo emails a confirm link; best proof of consent for CASL/GDPR). Klaviyo applies the list's setting to this form automatically.
3. **Copy two values**:
   - the **public API key / Site ID** (6 characters): *Settings → Account → API keys → Public API key*. It is safe in a web page.
   - the **list ID**: open the list; the ID is in the URL (`.../list/AbC123/...`) or under *Settings*.
   Never use a **private** key (`pk_…`) in this page.
4. **Paste them** into `KLAVIYO` in `src/experiments/2026-09-23-sonar-lake-3d/signup.js` (Claude can do it).
5. **Test** with a real address: the profile appears on the list with source *Sonar Beam Explorer* and property `signup_page = sonar-beam-explorer`. With double opt-in the confirm email arrives first.
6. **Optional:** a welcome flow triggered by the list (first email = what PingLive is + a link back to the page).

What the page sends (Klaviyo "Create Client Subscription", revision `2026-07-15`):

```
POST https://a.klaviyo.com/client/subscriptions?company_id=<public key>
headers: content-type: application/vnd.api+json · revision: 2026-07-15
body: subscription → profile { email, properties.signup_page, subscriptions.email.marketing = SUBSCRIBED }
      + custom_source "Sonar Beam Explorer" + list relationship
```

Only the email address is collected. No name, no phone, no tracking script.

## 3. Our own form vs Klaviyo's embedded form

| | **A. Our glass form → Klaviyo API** (built, recommended) | B. Klaviyo form builder + embed code |
|---|---|---|
| Look | Matches the page exactly | Klaviyo's styling; the frosted glass is hard to match |
| Extra script | None | Loads Klaviyo's onsite JS (sets cookies → needs the cookie banner in the EU) |
| Editing copy | Claude edits the file | Marketing edits it in Klaviyo |
| "Can't close + frozen picture" | Built in | Still needs our overlay around it |

If the Shopify store already runs Klaviyo's onsite script and marketing wants to
edit the copy themselves, B is a reasonable switch later. The gate, freeze and
"remember" logic stay the same either way.

## 4. Consent and law — decide before the page is public

- **Canada (CASL)** applies because Accuphy is Canadian. It needs *express consent*: say what they sign up for (done in the body copy), identify Accuphy (logo + name on the card; the emails need Accuphy's mailing address in the footer, which Klaviyo adds), and give a working unsubscribe link (Klaviyo adds it). Double opt-in gives the strongest record.
- **EU / UK (GDPR)**: consent must be *freely given*. A form that blocks the page until the visitor signs up ("consent wall") is generally **not** freely given for marketing email. For EU/UK visitors, add a small "continue without signing up" link, or skip the gate for them.
- **US (CAN-SPAM)** is opt-out based; the gate is fine there.
- **Recommendation:** keep the hard gate for the internal/local trial. Before public launch, add a quiet *"No thanks, just exploring"* text link under the button. It keeps most sign-ups and removes the legal risk. This is Jason's call; it is a one-line change.

## 5. Open items

- ⬜ Jason: create the list, pick single/double opt-in, send the public key + list ID.
- ⬜ Jason: decide on the "no thanks" link before public launch (§4).
- ⬜ Chinese or other languages for the card: translate from the English above (English is the source).
