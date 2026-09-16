# Accessibility Install Estimator — Build Spec for Hermes

**Purpose:** Instant "ballpark range" estimator on the landing page (lead capture bait), plus a backend pricing matrix with an owner-only markup % setting. Customer sees a range, never a fixed price. Final quote is confirmed by the licensed contractor.

**Stack assumption:** Static landing page on Cloudflare Pages; estimator logic runs client-side from a `pricing.json` that Hermes/OpenClaw can regenerate. Optional Cloudflare Worker for server-side markup so the wholesale numbers never ship to the browser (recommended — see Section 4).

---

## 1. SF Bay Area Pricing Research (Sept 2026)

Sources: California Mobility (SF), HomeBlue SF, CostToRenovate 2026, AgeProofPros 2026, HomeAdvisor/Angi 2025–26, Contractor+ SF. SF labor runs ~1.3–1.6× national. Numbers below are **retail installed** ranges observed in the Bay Area; wholesale (your friend's cost) is typically 55–70% of retail.

| # | Service | SF Retail Installed | Key Variables |
|---|---|---|---|
| 1 | Grab bars (per bar / 3-bar bathroom package) | $250–$450 / $650–$1,100 | Tile vs drywall, stud/blocking needed, ADA vs decorative bar, count |
| 2 | Threshold ramps (rubber/aluminum, ≤ 6") | $200–$800 | Rise height, width, indoor/outdoor, custom cut |
| 3 | Modular aluminum ramp (permanent, exterior) | $2,000–$6,000 (~$150–$250/lin ft) | Rise (1:12 slope → 12" of ramp per 1" rise), platforms/turns, handrails, hillside footing, permit |
| 4 | Wood ramp (custom built) | $1,500–$5,500 (~$100–$200/lin ft) | Same as above; lower material, higher labor; maintenance disclosure |
| 5 | Portable/folding ramp (supply + setup) | $300–$1,500 | Length, weight rating, single/multi-fold |
| 6 | Interior handrails / stair railings | $400–$1,200 per run | Length, one vs both sides, wall type, exterior finish |
| 7 | Stair lift — straight rail | $3,500–$7,100 | Rail length (steps), new vs refurb, outdoor-rated, power at top/bottom, fold-away |
| 8 | Stair lift — curved rail | $9,000–$17,000 | Custom rail fabrication (most of cost), landings, turns |
| 9 | Door widening (to 32"–36" clear) | $1,200–$3,500 | Load-bearing wall (header), electrical in wall, finish matching, new door/hardware |
| 10 | Vertical platform lift (VPL) | $8,000–$18,000 | Rise height (to 14'), pad/footing, electrical, enclosure, permit; strong fit for SF small hillside lots |

Bonus low-ticket add-ons (upsells): lever handles $100–$250/door, comfort-height toilet $400–$1,000, hand-held shower + bench $500–$1,500, motion pathway lighting $300–$800.

**SF permit notes (for quoting):** Grab bars, threshold ramps, portable ramps, handrails on existing stairs — generally no permit. Permanent exterior ramps over ~30" rise, platform lifts, door widening in bearing walls, and stair lifts with new electrical circuits — DBI permit likely (budget $300–$900 + 1–3 weeks). Hillside/front-setback ramps in SF may trigger Planning review. Always route permit question to the contractor.

---

## 2. Pricing Matrix (`pricing.json`)

Wholesale = your friend's number. Fill these in with him; placeholders below are retail × 0.62. `markupPct` is the **single owner setting** applied on top of wholesale. Retail display range = wholesale range × (1 + markupPct).

```json
{
 "version": "2026-09-15",
 "markupPct": 0.40,
 "displayRangePadPct": 0.10,
 "sfLaborMultiplier": 1.0,
 "services": [
 {
 "id": "grab_bars",
 "label": "Grab bars",
 "unit": "bar",
 "wholesale": { "base": 155, "perUnit": 120 },
 "modifiers": {
 "tile_wall": 45,
 "needs_blocking": 90,
 "ada_rated_bar": 25
 },
 "permitLikely": false
 },
 {
 "id": "threshold_ramp",
 "label": "Threshold ramp",
 "unit": "each",
 "wholesale": { "base": 125, "perUnit": 0 },
 "modifiers": {
 "rise_over_3in": 150,
 "outdoor": 60,
 "custom_cut": 120
 },
 "permitLikely": false
 },
 {
 "id": "modular_ramp",
 "label": "Modular aluminum ramp",
 "unit": "linear_ft",
 "wholesale": { "base": 600, "perUnit": 110 },
 "modifiers": {
 "platform_turn": 700,
 "handrails_both_sides": 55,
 "hillside_footing": 500,
 "permit": 450
 },
 "derive": { "linear_ft": "rise_in * 1.0", "min_ft": 4 },
 "permitLikely": true
 },
 {
 "id": "wood_ramp",
 "label": "Wood ramp (custom)",
 "unit": "linear_ft",
 "wholesale": { "base": 500, "perUnit": 85 },
 "modifiers": { "platform_turn": 550, "handrails_both_sides": 40, "hillside_footing": 450, "permit": 450 },
 "derive": { "linear_ft": "rise_in * 1.0", "min_ft": 4 },
 "permitLikely": true
 },
 {
 "id": "portable_ramp",
 "label": "Portable ramp",
 "unit": "each",
 "wholesale": { "base": 200, "perUnit": 0 },
 "modifiers": { "length_over_6ft": 250, "length_over_10ft": 450, "heavy_duty_600lb": 150 },
 "permitLikely": false
 },
 {
 "id": "handrail",
 "label": "Handrail / stair railing",
 "unit": "run",
 "wholesale": { "base": 250, "perUnit": 300 },
 "modifiers": { "both_sides": 300, "exterior": 120, "masonry_wall": 150 },
 "permitLikely": false
 },
 {
 "id": "stairlift_straight",
 "label": "Stair lift (straight)",
 "unit": "each",
 "wholesale": { "base": 2200, "perUnit": 0 },
 "modifiers": { "steps_over_14": 600, "outdoor_rated": 900, "new_outlet": 350, "refurbished_discount": -800, "permit": 350 },
 "permitLikely": true
 },
 {
 "id": "stairlift_curved",
 "label": "Stair lift (curved)",
 "unit": "each",
 "wholesale": { "base": 5800, "perUnit": 0 },
 "modifiers": { "each_turn": 1200, "outdoor_rated": 1200, "new_outlet": 350, "permit": 350 },
 "permitLikely": true
 },
 {
 "id": "door_widening",
 "label": "Door widening",
 "unit": "door",
 "wholesale": { "base": 750, "perUnit": 0 },
 "modifiers": { "load_bearing": 900, "electrical_in_wall": 400, "new_door_hardware": 350, "finish_match": 250, "permit": 500 },
 "permitLikely": true
 },
 {
 "id": "vpl",
 "label": "Vertical platform lift",
 "unit": "each",
 "wholesale": { "base": 5200, "perUnit": 0 },
 "modifiers": { "rise_over_6ft": 1800, "concrete_pad": 900, "enclosure": 2000, "electrical_circuit": 600, "permit": 600 },
 "permitLikely": true
 }
 ]
}
```

---

## 3. Estimator Logic (`estimator.js`) — client side

Pure function so Hermes can unit-test it. Never outputs a single number; outputs `{low, high}`.

```js
// estimator.js — pure pricing engine. Import in page or Worker.
export function estimate(pricing, sel) {
 // sel = { serviceId, qty, rise_in, answers: { modifierKey: true|false } }
 const svc = pricing.services.find(s => s.id === sel.serviceId);
 if (!svc) throw new Error(`unknown service ${sel.serviceId}`);

 let units = sel.qty ?? 1;
 if (svc.derive?.linear_ft && sel.rise_in != null) {
 // 1:12 slope → 1 ft of ramp per inch of rise
 units = Math.max(svc.derive.min_ft, Math.ceil(sel.rise_in * 1.0));
 }

 let wholesale = svc.wholesale.base + svc.wholesale.perUnit * units;
 for (const [k, on] of Object.entries(sel.answers || {})) {
 if (on && k in svc.modifiers) wholesale += svc.modifiers[k];
 }
 wholesale *= pricing.sfLaborMultiplier;

 const retail = wholesale * (1 + pricing.markupPct);
 const pad = pricing.displayRangePadPct;
 return {
 serviceId: svc.id,
 label: svc.label,
 units,
 wholesale: round(wholesale), // NEVER render this in the browser
 retail: round(retail),
 low: round(retail * (1 - pad), 50),
 high: round(retail * (1 + pad), 50),
 permitLikely: svc.permitLikely,
 };
}

export function estimateBundle(pricing, selections) {
 const items = selections.map(s => estimate(pricing, s));
 const low = items.reduce((a, i) => a + i.low, 0);
 const high = items.reduce((a, i) => a + i.high, 0);
 // multi-item trip discount: 5% off low end of 2+ items
 const disc = items.length > 1 ? 0.05 : 0;
 return { items, low: round(low * (1 - disc), 50), high: round(high, 50) };
}

function round(n, to = 1) { return Math.round(n / to) * to; }
```

### Question flow per service (drives `answers`)

Keep to ≤ 4 questions per service; each maps to a modifier key.

- **grab_bars:** How many bars? (qty) · Tile wall? · Do you know if there's wood behind the wall? (No/Unsure → `needs_blocking`)
- **threshold_ramp:** Step height? (<3" / 3–6") · Indoor or outdoor? · Standard width?
- **modular_ramp / wood_ramp:** Total rise in inches (or # of steps × 7) · Straight run possible, or need a turn? · Hillside/sloped yard? · Handrails both sides?
- **portable_ramp:** Length needed (≤6 / 6–10 / >10) · Power chair / scooter (→ `heavy_duty_600lb`)?
- **handrail:** Number of runs · Both sides? · Interior/exterior? · Wall type
- **stairlift_straight:** Number of steps · Indoor/outdoor · Outlet near stairs? · Open to refurbished?
- **stairlift_curved:** Number of turns/landings · Indoor/outdoor · Outlet near stairs?
- **door_widening:** Number of doors · Is it an exterior/bearing wall? (Unsure → assume yes) · Light switch/outlet in that wall?
- **vpl:** Rise height (<6ft / >6ft) · Concrete landing already there? · Want weather enclosure?

---

## 4. Markup Setting & Wholesale Protection

**Option A (fast):** `pricing.json` ships to the browser. Wholesale is visible in devtools. Fine for week 1.

**Option B (recommended by week 3):** Cloudflare Worker `/api/estimate`:
- Worker holds `pricing.json` in KV (`PRICING`), key `current`.
- `POST /api/estimate` body `{selections}` → returns only `{low, high, items:[{label, low, high, permitLikely}]}`. Strip `wholesale`/`retail`.
- `PUT /api/pricing` with header `X-Owner-Key: <secret>` → update JSON (this is your markup dial). Hermes can call this from Telegram: `/markup 0.45`.
- Log every estimate request to KV/D1 with `leadId` so the quote agent can pull it.

```js
// worker.js (sketch)
import { estimateBundle } from './estimator.js';
export default {
 async fetch(req, env) {
 const url = new URL(req.url);
 if (url.pathname === '/api/estimate' && req.method === 'POST') {
 const pricing = JSON.parse(await env.PRICING.get('current'));
 const { selections, leadId } = await req.json();
 const r = estimateBundle(pricing, selections);
 const safe = { low: r.low, high: r.high,
 items: r.items.map(({label, low, high, permitLikely}) => ({label, low, high, permitLikely})) };
 if (leadId) await env.PRICING.put(`est:${leadId}`, JSON.stringify(r)); // full record incl. wholesale
 return Response.json(safe);
 }
 if (url.pathname === '/api/pricing' && req.method === 'PUT') {
 if (req.headers.get('X-Owner-Key') !== env.OWNER_KEY) return new Response('nope', {status: 401});
 await env.PRICING.put('current', await req.text());
 return new Response('ok');
 }
 return new Response('not found', {status: 404});
 }
};
```

---

## 5. Estimator UI Component (embed in landing page)

Three-step wizard: pick service → answer ≤4 questions → see range + capture name/phone/zip to "lock in a free on-site assessment." **The range shows only after phone number is entered** (gate the reveal — this is the lead magnet).

```html
<section id="estimate" class="est">
 <h2>Get a ballpark in 60 seconds</h2>
 <p class="est-sub">Not a quote — a real range from local install pricing. A licensed contractor confirms on site.</p>
 <div class="est-step" data-step="1">
 <div class="est-grid" id="est-services"></div>
 </div>
 <div class="est-step" data-step="2" hidden><div id="est-questions"></div>
 <button class="btn" id="est-next">See my range</button></div>
 <div class="est-step" data-step="3" hidden>
 <form id="est-lead">
 <label>Your name <input name="name" required autocomplete="name"></label>
 <label>Mobile number <input name="phone" type="tel" required autocomplete="tel"></label>
 <label>ZIP of the home <input name="zip" inputmode="numeric" pattern="9[0-9]{4}" required></label>
 <button class="btn btn-primary" type="submit">Show my estimate</button>
 <p class="fine">We'll text your range and a link to book a free assessment. Reply STOP anytime.</p>
 </form>
 </div>
 <div class="est-step" data-step="4" hidden>
 <p class="est-range">Typical installed range: <strong id="est-low"></strong> – <strong id="est-high"></strong></p>
 <p id="est-permit" hidden>This job may need a San Francisco permit; we handle it.</p>
 <a class="btn btn-primary" href="tel:+14155550123">Call now</a>
 <a class="btn" href="#book">Book a free assessment</a>
 </div>
</section>
```

```js
// est-ui.js
import { estimateBundle } from './estimator.js';
const QUESTIONS = { /* map serviceId -> [{key, label, type:'bool'|'qty'|'rise'|'select', opts}] per Section 3 */ };
let state = { serviceId: null, qty: 1, rise_in: null, answers: {} };

async function reveal(lead) {
 const res = await fetch('/api/estimate', { method:'POST',
 headers:{'content-type':'application/json'},
 body: JSON.stringify({ selections:[state], leadId: crypto.randomUUID(), lead }) });
 const r = await res.json();
 document.getElementById('est-low').textContent = money(r.low);
 document.getElementById('est-high').textContent = money(r.high);
 document.getElementById('est-permit').hidden = !r.items.some(i => i.permitLikely);
 show(4);
 // also POST lead to Web3Forms / OpenClaw webhook here
}
const money = n => n.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
```

---

## 6. Hermes Build Checklist

- [ ] Sit with contractor, replace every `wholesale` value; export `pricing.json`
- [ ] Implement `estimator.js` + Jest tests (10 services × 2 cases; check ranges land inside Section 1 table)
- [ ] Worker + KV + `OWNER_KEY` secret; wire `/markup` Telegram command → `PUT /api/pricing`
- [ ] Embed wizard in landing page; gate range behind phone
- [ ] On submit: POST lead → OpenClaw intake webhook (`{name, phone, zip, serviceId, answers, est:{low,high}}`)
- [ ] Log every estimate to KV `est:<leadId>` for the quote agent
