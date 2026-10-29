# Product capability and US mapping

Source: devices.js, approved decision history through BASE_SHA `48f15cc`, especially decisions 5, 176 and 178. This is a mapping of the repository's approved simulation configuration, not new marketing certification.

| Device | Lake modes in current configuration | Limit in configuration | US Hero |
|---|---|---|---|
| PingLive (PL) | Down, Forward, Panoramic | 240 ft range / depth | Preserved in original routes; not selected by Mini steps |
| PingLive Mini (PLM) | Down, Forward, Combo | 200 ft range / depth | Original Mini selected; all three views accessible via View selector |
| Mini ice scene | Live Ice, Forward, Down, Combo | Original ice configuration | Separate existing route, not newly marketed by lake Hero |

Mini Panoramic is **not in DEVICES.PLM.modes**. Step 3 remains a visible explanatory action as requested; it changes neither device nor view and does not substitute Combo. The notice is not a new hardware limitation inferred from external pages.

| Teaching step | Device mode | Original world target | Status |
|---|---|---|---|
| Step 1 / Beam | PLM forward | shelf (-40, -5) metres | Implemented; uses original target control |
| Step 2 / Down View | PLM down | rock hump (22, 8) metres | Implemented; uses original target control |
| Step 3 / Panoramic View | unchanged | unchanged target | Explanatory only; Mini unavailable |

Current teaching step and current device mode are separate UI state. Manual view selection and boat control clear the teaching selection. New steps begin from the actual current boat coordinates, keep existing fish, and replace the previous target. Manual controls take over from actual boat position. Camera reset changes zoom only.

Audit distinction: Mini's physical beam value is 39 degrees in devices.js while displayBeamDeg is 43 degrees, an existing documented visualization compensation. The thickness is 18 degrees; PL is 135 by 20 degrees. These were not changed or replaced by the reference's cone. Their presence in source is not permission to broaden external advertising claims. Unverified latest brand guidance remains BLOCKED.
