# Accessibility Install Landing Page — Research + Build Spec for Hermes

**Deploy:** Cloudflare Pages, single `index.html` (same pattern as Heronsync). Estimator from `01-estimator-tool.md` embeds in the `#estimate` section.

---

## 1. What converts for this audience (research synthesis)

Sources: Direction.com senior-care landing page guide (May 2026), Kaleidico assisted-living design 2026, Cardinal home-care CRO, Branded Agency CRO 2025–26, WCAG 2.2 / NIA "Making Your Website Senior Friendly."

**Who's actually on the page:** 70%+ of clicks are the **adult child** (45–65, on a phone, at a hospital or at work, stressed, time-boxed). The senior is the secondary visitor and reads on a tablet/desktop with larger text. Design for both: mobile-first, but big type.

**The five things that move conversion here, in order:**
1. **Phone number as the primary CTA, above the fold, tap-to-call.** This audience calls. Forms are secondary. Repeat `tel:` at every scroll point.
2. **Speed + locality claims in the hero.** "Installed in days" and "San Francisco / East Bay" beat any feature list. City/neighborhood specificity raises trust and Quality Score.
3. **Licensed-contractor proof.** CSLB license number, insured, bonded — visible near the hero. Photo of the actual contractor, not stock. This is the single biggest trust gap for a new brand.
4. **One concrete emotional line** (discharge/fall context) followed immediately by a practical next step. Empathy without a next step reads as a brochure.
5. **Short form.** Name + mobile + ZIP + service. Nothing else. The estimator is the "form" — it feels like getting something, not giving something.

**Accessibility as conversion (not compliance):** the audience literally has vision/motor limits.
- Body ≥ 18px, headings ≥ 32px mobile; line length ≤ 70ch; line-height 1.6
- Contrast ≥ 7:1 for body text; never gray-on-gray
- Tap targets ≥ 48px; buttons full-width on mobile
- No carousels, no autoplay, no parallax; `prefers-reduced-motion` respected
- Real `<label>`s, visible focus rings, logical heading order
- Page weight < 300 KB, no web-font blocking (use `font-display: swap`)

**Palette research:** Senior/health pages that convert use warm, high-contrast, non-clinical schemes. Avoid hospital teal and the AI-default cream/terracotta. Avoid pure black backgrounds (hard for aging eyes). Deep, saturated blue-greens and warm off-whites test well; a single warm accent for the CTA only.

**Typography research:** Humanist sans with open apertures and distinguishable `I/l/1` (Atkinson Hyperlegible was designed for low vision and is free; Source Sans 3 and Public Sans also test well). Avoid thin weights. Avoid all-caps labels.

**Trust blocks that matter for THIS niche:** CSLB #, insured, "we prioritize hospital discharge cases," VA/HISA grant familiarity, before/after photos with the contractor in frame, Google review count once you have 3+.

**Google Ads landing-page rules (protects Quality Score on a $10/day budget):** headline must echo the ad ("Wheelchair Ramp Installation in San Francisco"), one page per ad group eventually, phone in header, load < 2s mobile, no popups.

---

## 2. Design plan

**Subject:** a licensed local team that makes a home safe fast after a mobility change.

**Palette**
- `--ink` #1B2A33 (deep blue-slate — text, header)
- `--paper` #FBF7F0 (warm off-white background — not cream/terracotta)
- `--field` #E8EEF0 (cool pale panel for the estimator)
- `--pine` #22503F (deep green — trust/licensed blocks)
- `--cta` #C8500A (burnt orange — CTA only; nowhere else)
- `--rule` #C9D1D5 (borders)

**Type:** Atkinson Hyperlegible (display + body). One family; hierarchy by size/weight only. Body 19px, h1 40/48px, h2 30px. Weight 700 for headings, 400 body.

**Layout concept (mobile-first, left-aligned):**

```
┌──────────────────────────────┐
│ Logo [Call 415-…] │ sticky, call button always visible
├──────────────────────────────┤
│ H1: Wheelchair ramps, stair │
│ lifts & grab bars — installed│
│ in San Francisco in days. │
│ sub: Licensed · insured · │
│ discharge cases first. │
│ [Call now] [Get a ballpark] │
│ photo: contractor + ramp │
├──────────────────────────────┤
│ Three proof tiles (license, │
│ speed, coverage area) │
├──────────────────────────────┤
│ Services (6, plain rows w/ │
│ "from $" and typical time) │
├──────────────────────────────┤
│ ESTIMATOR (field panel) │
├──────────────────────────────┤
│ How it works (3 steps — │
│ genuinely sequential) │
├──────────────────────────────┤
│ For families / discharge │
│ planners / VA + grants │
├──────────────────────────────┤
│ FAQ (permits, timing, pay) │
├──────────────────────────────┤
│ Footer: CSLB #, areas, call │
└──────────────────────────────┘
```

**Principles:** the memorable element is the **hero photo of the actual contractor on an actual SF stoop** — everything else is quiet. No decorative gradients, no cards-with-shadows kit. Numbering only on "How it works" (it's a real sequence). One warm CTA color, reused nowhere else.

**Self-check against defaults:** dropped cream+terracotta; dropped all-caps eyebrows; no `→` on buttons; no monospace labels; no per-section fade-ins. Kept one photo, one accent.

---

## 3. Code

Replace `[BRAND]`, `[PHONE]`, `[CSLB]`, `[CONTRACTOR NAME]`, and the hero image. Estimator scripts from `01-estimator-tool.md`.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Wheelchair Ramp, Stair Lift & Grab Bar Installation in San Francisco | [BRAND]</title>
<meta name="description" content="Licensed, insured accessibility installation in San Francisco and the East Bay. Ramps, stair lifts, grab bars and door widening — installed in days. Hospital discharge cases prioritized.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap" rel="stylesheet">
<style>
:root{
 --ink:#1B2A33; --paper:#FBF7F0; --field:#E8EEF0; --pine:#22503F;
 --cta:#C8500A; --cta-dark:#9F3F07; --rule:#C9D1D5;
 --fs:19px; --lh:1.6; --max:68ch;
}
*{box-sizing:border-box}
html{font-size:var(--fs)}
body{margin:0;font-family:"Atkinson Hyperlegible",system-ui,sans-serif;color:var(--ink);background:var(--paper);line-height:var(--lh)}
img{max-width:100%;height:auto;display:block}
h1,h2,h3{line-height:1.15;margin:0 0 .5em;font-weight:700}
h1{font-size:2.1rem}
h2{font-size:1.6rem}
h3{font-size:1.15rem}
p{margin:0 0 1em;max-width:var(--max)}
a{color:var(--pine)}
.wrap{padding:0 1.25rem;max-width:64rem;margin:0 auto}
section{padding:2.5rem 0;border-top:1px solid var(--rule)}
section:first-of-type{border-top:0}

/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:.75rem 1.25rem;border:2px solid var(--ink);border-radius:8px;font:inherit;font-weight:700;text-decoration:none;color:var(--ink);background:transparent;cursor:pointer}
.btn-primary{background:var(--cta);border-color:var(--cta);color:#fff}
.btn-primary:hover{background:var(--cta-dark);border-color:var(--cta-dark)}
.btn:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid var(--cta);outline-offset:3px}
@media (max-width:640px){.btn{width:100%}}

/* header */
header{position:sticky;top:0;background:var(--paper);border-bottom:1px solid var(--rule);z-index:5}
header .wrap{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding-top:.6rem;padding-bottom:.6rem}
.logo{font-weight:700;font-size:1.1rem;text-decoration:none;color:var(--ink)}
header .btn{min-height:44px;padding:.5rem 1rem;width:auto}

/* hero */
.hero{display:grid;gap:1.5rem}
.hero .sub{font-size:1.15rem;color:var(--pine);font-weight:700}
.hero .actions{display:flex;flex-wrap:wrap;gap:.75rem;margin:1rem 0 1.5rem}
.hero img{border-radius:12px;border:1px solid var(--rule)}
@media (min-width:800px){.hero{grid-template-columns:1.1fr 1fr;align-items:center}}

/* proof tiles */
.proof{display:grid;gap:1rem}
.proof div{padding:1rem 1.25rem;border-left:5px solid var(--pine);background:#fff}
.proof strong{display:block;font-size:1.2rem}
@media (min-width:720px){.proof{grid-template-columns:repeat(3,1fr)}}

/* services */
.services{list-style:none;padding:0;margin:0}
.services li{display:grid;grid-template-columns:1fr auto;gap:.5rem 1rem;padding:1rem 0;border-bottom:1px solid var(--rule);align-items:baseline}
.services li span{color:var(--pine);font-weight:700;white-space:nowrap}
.services li small{grid-column:1/-1;font-size:.95rem}

/* estimator */
.est{background:var(--field);border-radius:16px;padding:1.75rem 1.25rem;margin-top:1rem}
.est-sub{font-size:1rem}
.est-grid{display:grid;gap:.6rem}
@media (min-width:640px){.est-grid{grid-template-columns:repeat(2,1fr)}}
.est-grid button{text-align:left;font-size:1.05rem;background:#fff;border:2px solid var(--rule);border-radius:10px;min-height:56px;padding:.75rem 1rem;font-family:inherit;cursor:pointer}
.est-grid button[aria-pressed="true"]{border-color:var(--pine);background:#fff}
.est label{display:block;margin:.9rem 0;font-weight:700}
.est input,.est select{display:block;width:100%;margin-top:.35rem;font:inherit;font-size:1.05rem;padding:.7rem .8rem;border:2px solid var(--ink);border-radius:8px;background:#fff;font-weight:400}
.est fieldset{border:0;padding:0;margin:.9rem 0}
.est fieldset legend{font-weight:700}
.est fieldset label{font-weight:400;display:flex;gap:.6rem;align-items:center;margin:.4rem 0}
.est input[type=radio],.est input[type=checkbox]{width:24px;height:24px;margin:0}
.est-range{font-size:1.4rem;font-weight:700}
.fine{font-size:.9rem}

/* how it works — real sequence */
.steps{counter-reset:s;list-style:none;padding:0;margin:0;display:grid;gap:1.25rem}
.steps li{padding-left:3.25rem;position:relative}
.steps li::before{counter-increment:s;content:counter(s);position:absolute;left:0;top:0;width:2.5rem;height:2.5rem;border-radius:50%;background:var(--pine);color:#fff;display:grid;place-items:center;font-weight:700}

/* audiences */
.aud{display:grid;gap:1.25rem}
@media (min-width:720px){.aud{grid-template-columns:repeat(3,1fr)}}

/* faq */
details{border-bottom:1px solid var(--rule);padding:.75rem 0}
summary{font-weight:700;cursor:pointer;font-size:1.05rem;padding:.35rem 0}

footer{padding:2rem 0 3rem;border-top:1px solid var(--rule);font-size:.95rem}
footer p{margin-bottom:.4rem}

@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
</style>
</head>
<body>

<header>
 <div class="wrap">
 <a class="logo" href="#top">[BRAND]</a>
 <a class="btn btn-primary" href="tel:+1[PHONE]">Call [PHONE-DISPLAY]</a>
 </div>
</header>

<main id="top">

<section class="wrap hero">
 <div>
 <h1>Wheelchair ramps, stair lifts and grab bars — installed in San Francisco in days, not weeks.</h1>
 <p class="sub">Licensed and insured. Hospital discharge cases scheduled first.</p>
 <p>If a parent is coming home and the front steps, the stairs or the bathroom aren't ready, we can usually be on site within 48 hours and installed within the week.</p>
 <div class="actions">
 <a class="btn btn-primary" href="tel:+1[PHONE]">Call [PHONE-DISPLAY]</a>
 <a class="btn" href="#estimate">Get a 60-second ballpark</a>
 </div>
 <p class="fine">Serving San Francisco, Daly City, Oakland, Berkeley, Alameda and San Leandro.</p>
 </div>
 <img src="hero.jpg" width="960" height="720" alt="[CONTRACTOR NAME] fitting a modular aluminum ramp to the front steps of a San Francisco home">
</section>

<section class="wrap">
 <div class="proof">
 <div><strong>CSLB #[CSLB]</strong>Licensed, bonded and insured contractor does every install.</div>
 <div><strong>On site in 48 hours</strong>Free in-home safety assessment, written quote the same day.</div>
 <div><strong>Grants and VA welcome</strong>We know HISA, Medi-Cal waiver and long-term-care paperwork.</div>
 </div>
</section>

<section class="wrap">
 <h2>What we install</h2>
 <ul class="services">
 <li>Modular aluminum wheelchair ramps <span>from $2,000</span><small>Permanent, ADA-slope, removable if you sell. 1–2 days.</small></li>
 <li>Stair lifts (straight and curved) <span>from $3,500</span><small>Bruno, Harmar, Acorn. Straight rails install in one day.</small></li>
 <li>Grab bars and bathroom safety <span>from $250</span><small>Anchored into studs or blocking, not drywall. Same-day.</small></li>
 <li>Handrails and stair railings <span>from $400</span><small>Interior and exterior, both sides if needed.</small></li>
 <li>Door widening <span>from $1,200</span><small>To a 32–36" clear opening. Bearing walls handled.</small></li>
 <li>Vertical platform lifts <span>from $8,000</span><small>For SF hillside lots where a ramp won't fit.</small></li>
 </ul>
</section>

<section class="wrap">
 <!-- ESTIMATOR: paste the #estimate block from 01-estimator-tool.md §5 here -->
 <div id="estimate" class="est"></div>
</section>

<section class="wrap">
 <h2>How it works</h2>
 <ol class="steps">
 <li><strong>Call or text us.</strong> Tell us what changed and when they're coming home.</li>
 <li><strong>Free in-home assessment.</strong> Our licensed contractor measures, checks walls and slopes, and leaves a written quote.</li>
 <li><strong>Installed within days.</strong> Most grab bars and ramps in one visit. We handle any San Francisco permit.</li>
 </ol>
</section>

<section class="wrap">
 <h2>Who we work with</h2>
 <div class="aud">
 <div><h3>Families</h3><p>You're often arranging this from a hospital hallway. Send us a photo of the steps or bathroom and we'll tell you what's realistic before you commit to anything.</p></div>
 <div><h3>Discharge planners and OT/PTs</h3><p>We prioritize discharge cases and build to your home-safety assessment. One number to call, a written confirmation within hours.</p></div>
 <div><h3>Veterans and grant recipients</h3><p>Familiar with VA HISA grants, Medi-Cal HCBS and long-term-care insurance reimbursement. We'll give you the paperwork you need.</p></div>
 </div>
</section>

<section class="wrap">
 <h2>Questions families ask</h2>
 <details><summary>Do we need a permit in San Francisco?</summary><p>Grab bars, handrails on existing stairs and threshold ramps usually don't. Permanent exterior ramps, platform lifts and door widening in bearing walls usually do. We pull it and include it in the quote.</p></details>
 <details><summary>How fast can you really install?</summary><p>Grab bars and portable or threshold ramps: often within 48 hours. Modular ramps and straight stair lifts: typically within a week. Curved stair lifts need a custom rail and take 2–4 weeks.</p></details>
 <details><summary>Will a ramp fit on a San Francisco stoop?</summary><p>Often yes with a switchback platform. When the rise is too high for the lot, a vertical platform lift takes about a 5×5 ft footprint.</p></details>
 <details><summary>Who does the work?</summary><p>[CONTRACTOR NAME], CSLB #[CSLB], and his crew. [BRAND] handles scheduling, quoting and your questions; the contractor holds the license and insurance.</p></details>
 <details><summary>How do we pay?</summary><p>Deposit on signing, balance on completion. We accept card, check and most long-term-care and VA reimbursement paperwork.</p></details>
</section>

</main>

<footer class="wrap">
 <p><strong>[BRAND]</strong> — accessibility installation scheduling for San Francisco and the East Bay.</p>
 <p>Installation performed by [CONTRACTOR NAME], CSLB license #[CSLB], bonded and insured.</p>
 <p><a href="tel:+1[PHONE]">[PHONE-DISPLAY]</a> · <a href="mailto:hello@[domain]">hello@[domain]</a></p>
 <p class="fine">Estimates on this site are ranges based on local installed pricing and are not a contract offer. Final pricing is provided in writing after an in-home assessment.</p>
</footer>

<script type="module" src="est-ui.js"></script>
<!-- Meta Pixel + Google Ads conversion tag go here; fire "Lead" on estimator submit and on tel: click -->
</body>
</html>
```

**Legal footer matters:** the "[BRAND] handles scheduling… contractor holds the license" line is what keeps you clear of holding yourself out as a contractor under CSLB rules. Keep it.

---

## 4. Hermes Build Checklist

- [ ] Get contractor's CSLB #, headshot, and 3 real job photos (phone photos are fine — authenticity beats polish)
- [ ] Build `index.html` above; embed estimator; test Lighthouse ≥ 95 accessibility, LCP < 2s on mobile
- [ ] Add Google Ads conversion tag: fire on `tel:` click and estimator submit
- [ ] Add Meta Pixel (reuse Heronsync ID pattern) — Lead event
- [ ] Deploy to Cloudflare Pages; point brand domain
- [ ] Create Google Business Profile with same NAP (name/address/phone) as footer
- [ ] Later: clone page as `/stair-lifts` and `/ramps` with swapped H1 for per-ad-group Quality Score
