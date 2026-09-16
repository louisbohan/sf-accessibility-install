# Accessibility Install Landing Page

A single-page landing site for an accessibility installation business (wheelchair ramps, stair lifts, grab bars, etc.) in San Francisco and the East Bay.

## Files

- **index.html** — full landing page (header, hero, proof tiles, services, estimator placeholder, how it works, audiences, FAQ, footer)
- **styles.css** — extracted stylesheet with the exact palette and typography from the spec
- **hero.jpg** — placeholder for the contractor photo (replace with real image)
- **est-ui.js** — estimator UI module (mounts into `#estimate`; built separately per `01-estimator-tool.md`)

## Placeholders to Customize

Before deploying, replace these placeholders throughout `index.html`:

| Placeholder | Example | Where it appears |
|-------------|---------|------------------|
| `[BRAND]` | `Bay Access Install` | Logo, footer, contractor disclaimer |
| `[PHONE]` | `4155550199` | `tel:` links (digits only, no dashes) |
| `[PHONE-DISPLAY]` | `(415) 555-0199` | Visible button text and footer |
| `[CSLB]` | `1234567` | Proof tile, footer legal line |
| `[CONTRACTOR NAME]` | `Jake Morales` | Hero image alt text, footer |
| `[domain]` | `bayaccessinstall.com` | Footer email link |

### Quick sed commands

```bash
# Run from the landing-page/ directory
sed -i '' 's/\[BRAND\]/Bay Access Install/g' index.html
sed -i '' 's/\[PHONE\]/4155550199/g' index.html
sed -i '' 's/\[PHONE-DISPLAY\]/(415) 555-0199/g' index.html
sed -i '' 's/\[CSLB\]/1234567/g' index.html
sed -i '' 's/\[CONTRACTOR NAME\]/Jake Morales/g' index.html
sed -i '' 's/\[domain\]/bayaccessinstall.com/g' index.html
```

## Design Specs

- **Palette:** `--ink` #1B2A33, `--paper` #FBF7F0, `--field` #E8EEF0, `--pine` #22503F, `--cta` #C8500A, `--rule` #C9D1D5
- **Font:** Atkinson Hyperlegible (Google Fonts, `font-display: swap`)
- **Body:** 19px, line-height 1.6, max-width 68ch
- **Mobile-first**, left-aligned layout
- **Sticky header** with tap-to-call button
- **No carousels, no autoplay, no parallax**
- **Respects `prefers-reduced-motion`**
- **Target page weight:** < 300KB

## Accessibility Features

- Proper heading hierarchy (h1 → h2 → h3)
- Visible focus rings (`outline: 3px solid var(--cta)`)
- Real `<label>` elements for form controls
- Tap targets ≥ 48px (buttons min 52px, header button min 44px)
- High contrast palette (avoids gray-on-gray)
- Semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`, `<details>`/`<summary>` for FAQ)
- Alt text on hero image
- `lang="en"` on `<html>`

## Estimator Integration

The estimator UI mounts into:

```html
<div id="estimate" class="est"></div>
```

Ensure `est-ui.js` is present and exports a mount function, or inline the estimator markup directly into that div if not using a module.

## Deployment

This is a static site. Deploy to Cloudflare Pages (or any static host):

```bash
npx wrangler pages deploy . --project-name=accessibility-landing
```

## Legal Note

The footer includes the required CSLB disclaimer: "[BRAND] handles scheduling, quoting and your questions; the contractor holds the license and insurance." Keep this line to avoid holding out as a licensed contractor.
