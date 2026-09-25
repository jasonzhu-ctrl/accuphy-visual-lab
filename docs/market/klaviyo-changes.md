# Klaviyo changes

A log of every change to live Klaviyo content (flows, flow emails, templates, forms, lists). Each
entry records what changed, why, who approved it, the exact text before and after, and how the
change was checked. Take a backup of each template into `klaviyo-backups/` **before** any change.
Entries are numbered and never rewritten; later news goes into a dated update line under the entry.

## How changes are made (learned 2026-09-25)

- **The Klaviyo connector reads everything but cannot save a flow email.** Reading works:
  `get_flow` with `additional_fields_flow: ["definition"]` lists each email's template ID, and
  `get_email_template` returns a template's html + definition. Saving does not work.
  `update_dnd_email_template` returns 404 "Template with id '…' does not exist" for a template
  that belongs to a flow, even though the same ID reads fine. No API call can change a flow
  email or swap its template.
  - So Jason edits flow emails in the Klaviyo editor.
  - A chat prepares the exact wording beforehand. Afterwards it re-reads the template and diffs
    it against the backup.
- **A drag-and-drop template with a cropped image cannot be sent back unchanged.** The update
  rejects `cropping_properties`.
- **The `text` field is empty for drag-and-drop templates.** Klaviyo builds the plain-text part
  from the design, so there is no second copy of the words to edit.
- **Template names do not match positions in the flow.** The Abandoned Cart flow's Email #1
  uses a template named "… Email #2", and the other way round. Identify an email by flow +
  message, and by template ID.
- **Text drawn inside images cannot be searched.** Check images by eye in the editor.
- **Big templates overflow the tool output.** Requesting html + definition together makes the
  result too large, so it is saved to a file. That file is the exact backup: copy it into
  `klaviyo-backups/`.

## 1. 2026-09-25 — "Simulator Mode" → "Playback Mode" in the Abandoned Cart emails · ⬜ waiting for Jason

**Asked:** Jason, 2026-09-25: "我记得我们的klaviyo里有个邮件内容在自动跑的 "Simulator mode"
但是现在已经叫Play Back了你研究清楚怎么修改不要乱动 规划一下再动手去fix".

**The app's words** (Accuphy Sonar app v2.0.0_beta.14; `reference/app-study/settings-main.jpg`,
`settings-playback.jpg`):
- Path: bottom tab **Setting** → Sonar Settings → row **Playback** → a **Playback** switch.
- The note under the switch: "When **Playback Mode** is enabled, the app will play back
  pre-recorded data…".

The app writes it as one word, "Playback", not "Play Back".

**Where the old name is.** On 2026-09-25 all 7 flows were read (5 live, 2 draft), with all 15
email templates in them: live, draft and A/B-variant emails, plus the B2B internal alert.
Only two emails contain "Simulator". Both are live, in *Abandoned Cart Reminder (Email)*
(flow `WWs4V8`).

| Email (flow message) | Subject | Template | Where in the email | Now | Change to |
|---|---|---|---|---|---|
| Email #1 (`Whq29Y`), 1 h after a checkout starts | Download Accuphy Sonar app and Try It Free | `WPMNrd` | step list under the phone picture (text block `01KMKQTFW13RRD8V9S9MT8Z4ZA`) | Step 3: Turn on **Simulator Mode**. | Step 3: Turn on **Playback Mode**. |
| Email #2 (`UuY8Dv`), 2 days later, with the 10 % coupon | The discount is expiring soon. | `S5xcwp` | heading above the app-download buttons (text block `01K5HSS3SQCTGVMGN5X39B5NKQ`) | **Try "Simulator Mode" now!** | **Try "Playback Mode" now!** |

**The change is one word in each place: "Simulator" → "Playback".**
- "Playback Mode" is the app's own phrase (from its Playback note).
- "Playback" is the switch the reader will look for.
- Nothing else changes: subject lines, preview texts, the other steps, buttons, links, images,
  coupon, timing and audience all stay as they are.
- The subject lines and preview texts do not contain the old name.

**Why it was not changed from here.** The plan was: take a backup, send the same template back
with only that word changed, then diff. All three attempts on Email #1 were refused, and
nothing changed:
1. The first attempt was refused because of the cropped picture.
2. The second attempt sent the picture as its already-cropped file (the one the email shows
   today). Klaviyo answered 404.
3. The third attempt was an identical retry, also 404.

The template's `updated` time is still 2026-03-26T00:21:58Z. The reason is in "How changes are
made".

**Steps for Jason (in the Klaviyo editor, about 5 minutes):**
1. Open Klaviyo → Flows → *Abandoned Cart Reminder (Email)*:
   https://www.klaviyo.com/flow/WWs4V8/edit
2. Click **Email #1** and edit its content.
   - Direct editor link: https://www.klaviyo.com/email-editor/WPMNrd/edit
   - In the step list, click into "Step 3: Turn on Simulator Mode.".
   - Replace only the word *Simulator* with *Playback*.
   - Save.
3. While there, look at the phone picture above the steps. If it still shows an old
   "Simulator" screen, say so; the chat cannot open that image from here.
4. Back in the flow, click **Email #2** and edit its content.
   - Direct editor link: https://www.klaviyo.com/email-editor/S5xcwp/edit
   - Find the heading 'Try "Simulator Mode" now!'.
   - Replace *Simulator* with *Playback*.
   - Save.
5. Tell the chat it is done.

Edits to a live flow email apply to the next sends, and the flow stays live.

**Check after the edit** (for the chat that does it):
1. Fetch both templates with `fields_template: ["name","editor_type","updated","html","text","definition"]`
   and `additional_fields_template: ["definition"]`.
2. Diff the `definition` against the backups.
3. The only allowed differences are that one word in that one text block, plus Klaviyo's own
   `updated` time.
4. Write the result under this entry.

**Backups.** Each is the full template JSON (html + definition) as read on 2026-09-25:
- `klaviyo-backups/WPMNrd-abandoned-cart-email1-before-2026-09-25.json` (template `updated`
  2026-03-26T00:21:58Z)
- `klaviyo-backups/S5xcwp-abandoned-cart-email2-before-2026-09-25.json` (template `updated`
  2026-03-25T23:18:05Z)

They contain no customer data. The only address in them is support@accuphy.ca. The coupon
appears only as Klaviyo's per-recipient `{% coupon_code %}` tag.

### Found on the way (not changed; Jason decides)

1. **Email #2 has not been sent since the flow was edited on 2026-04-14.**
   - **Before the edit:** it reached 438 people between late September 2025 and mid-April
     2026, with 10 orders and CAD 13.9k.
   - **From 2026-04-15 to 2026-09-25:** Email #1 reached 182 people (13 orders, CAD 18.6k).
     Email #2 reached **0**.
   - **Why:** after the 2-day wait, a Yes/No split asks "Placed Order zero times since
     starting this flow?".
     - Its **Yes** path (has not ordered) is empty, so it ends the flow.
     - Its **No** path (has ordered) leads to the tag, the list and the coupon email.
     - The flow filter already removes anyone who has ordered, so nobody reaches that email.
     - The two paths look swapped.
   - **Rough cost:** at Email #2's old rate of CAD 32 per recipient, about 170 people would
     have received it, which is on the order of CAD 5k in attributed orders since April.
     Some of those buyers would have ordered anyway.
   - **Fix, Jason's call:** in the flow editor, move the chain that is now on the No path
     (tag → list → 20 min → Email #2) to the Yes path.
   - Until that is fixed, the wording fix in Email #2 changes nothing anyone sees.
2. **The "Quick Setup Guide" link is dead.**
   - Several emails link to `accuphy.ca/blogs/news/setup-guide-for-pinglive-sonar`, which the
     store audit found to be a 404 (problem 3 of `docs/site-audit.md` in the repo
     `jasonzhu-ctrl/accuphy-website`; this repo's `docs/site-audit.md` points there).
   - The link sits in a shared header block (Klaviyo *universal content*
     `4c481f92a5df46789ecf90129b8eabc8`). That block is used by Abandoned Cart Email #1, the
     Welcome email (variant B) and both 30-day emails. Changing the block once would fix all of
     them.
   - The PingLive thank-you email (`Vabeq6`) has its own link to the same page.
   - Not checked from here: the sandbox cannot open store pages.
3. **Two blog posts on the store still say "Simulator Mode":**
   - "Android Compatibility List" (about 623 sessions in round 1's data)
   - "Full List of Android Processors Compatible with the Accuphy Sonar App (2026 Update)"

   The Shopify connector could change them, but only after Jason says go.
4. **Optional wording, not part of this fix.** Step 2 says "Go to Settings", but the app's tab
   is "Setting" and the switch is under Sonar Settings → Playback. A more exact Step 2 would be
   "Tap Setting → Playback".
