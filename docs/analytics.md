# Click analytics

The Link Performance page offers 7/30/90-day presets, custom UTC dates, daily or weekly timelines, CSV export, browser percentages, and device/referrer/operating-system breakdowns. The original dashboard layout and visual style are retained.

- Total clicks in a date range count persisted Click events. Lifetime counters remain independent best-effort writes and may differ after failures.
- Estimated unique visitors count distinct per-link HMAC-SHA256 hashes of the request IP and user-agent. The JWT secret keys the HMAC; rotating it starts a new identification namespace. Shared networks can undercount, IP/browser changes can overcount, and bots are not excluded. These are estimates, not identified people. No raw IP, raw user-agent or visitor user ID is stored. Configure `TRUST_PROXY` to match the actual proxy topology so Express derives the correct IP; do not blindly trust forwarded headers.
- `visitorTrackedClicks` gives coverage: historical events without a hash count towards total clicks but not visitor estimates. Hashes are hidden by default in the model and never returned by the analytics API.
- Average link age at click is the mean elapsed time from link creation to each recorded click, in milliseconds. It does **not** measure how long someone viewed a link before clicking. `linkAgeSamples` reports coverage; no samples yields `null` rather than a fabricated duration. Existing events are not backfilled.
- Previous-period comparison uses the immediately preceding equal number of UTC dates. Percentage change is undefined (`null`) with a zero baseline; the UI shows new/no activity. The current day can be incomplete.
- Weeks begin on Monday in UTC. First/last buckets include only the selected dates, though their labels show the Monday week start. Empty days/weeks are zero-filled. CSV uses the same range and interval.
- Metadata parsing happens in the redirect process; database persistence is not awaited. There is no durable background queue or automatic replay of failed writes. Paused, expired and failed-password requests do not count; successful password unlock does.

For Dev Log #04, use “estimated unique visitors” and “average link age at click”. The picture's raw-IP example and “average time to click” interpretation still do not describe this implementation.
