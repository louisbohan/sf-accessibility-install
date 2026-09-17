/**
 * est-ui.js — Client-side wizard UI for the Safely Home SF estimator
 *
 * Flow: pick service → answer ≤4 questions → see rough ballpark →
 *       enter name/phone/ZIP → confirmed range + lead logged to KV + Sheet.
 *
 * Pricing comes from the Worker at /api/estimate (wholesale NEVER in browser).
 * - Teaser call (step 2→3): no leadId, just shows the ballpark.
 * - Submit call (step 3→4): sends leadId + lead so the Worker logs the full
 *   record (incl. wholesale) to KV for the quote agent.
 * Leads also POST to a Google Apps Script that appends rows to the owner's Sheet.
 */

// ---------------------------------------------------------------------------
// Lead capture endpoint (Google Apps Script web app → Google Sheet)
// ---------------------------------------------------------------------------
const LEAD_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbzwKTo2CAYgom77Xis3RT_GPSEtnidPDW2D0S3xJ7G-wW8rwdEhD9ioRdUCIVsl9KPj8w/exec';

// ---------------------------------------------------------------------------
// Question definitions per service (maps to modifier keys in pricing.json)
// ---------------------------------------------------------------------------
const QUESTIONS = {
  grab_bars: [
    { key: 'qty', label: 'How many bars?', type: 'qty', min: 1, max: 10, default: 1 },
    { key: 'tile_wall', label: 'Tile wall?', type: 'bool' },
    { key: 'needs_blocking', label: "Unsure if there's wood blocking behind the wall?", type: 'bool' },
    { key: 'ada_rated_bar', label: 'ADA-rated bar (vs decorative)?', type: 'bool' },
  ],
  threshold_ramp: [
    { key: 'rise_over_3in', label: 'Step height over 3 inches?', type: 'bool' },
    { key: 'outdoor', label: 'Outdoor installation?', type: 'bool' },
    { key: 'custom_cut', label: 'Custom width cut needed?', type: 'bool' },
  ],
  modular_ramp: [
    { key: 'rise_in', label: 'Total rise in inches (or steps × 7)', type: 'rise', min: 1, max: 60 },
    { key: 'platform_turn', label: 'Need a platform/turn (not a straight run)?', type: 'bool' },
    { key: 'hillside_footing', label: 'Hillside or sloped yard?', type: 'bool' },
    { key: 'handrails_both_sides', label: 'Handrails on both sides?', type: 'bool' },
  ],
  wood_ramp: [
    { key: 'rise_in', label: 'Total rise in inches (or steps × 7)', type: 'rise', min: 1, max: 60 },
    { key: 'platform_turn', label: 'Need a platform/turn (not a straight run)?', type: 'bool' },
    { key: 'hillside_footing', label: 'Hillside or sloped yard?', type: 'bool' },
    { key: 'handrails_both_sides', label: 'Handrails on both sides?', type: 'bool' },
  ],
  portable_ramp: [
    { key: 'length_over_6ft', label: 'Length needed over 6 ft?', type: 'bool' },
    { key: 'length_over_10ft', label: 'Length needed over 10 ft?', type: 'bool' },
    { key: 'heavy_duty_600lb', label: 'Power chair / scooter (600 lb rating)?', type: 'bool' },
  ],
  handrail: [
    { key: 'qty', label: 'Number of runs', type: 'qty', min: 1, max: 10, default: 1 },
    { key: 'both_sides', label: 'Both sides of stairs?', type: 'bool' },
    { key: 'exterior', label: 'Exterior installation?', type: 'bool' },
    { key: 'masonry_wall', label: 'Masonry/brick wall?', type: 'bool' },
  ],
  stairlift_straight: [
    { key: 'steps_over_14', label: 'More than 14 steps?', type: 'bool' },
    { key: 'outdoor_rated', label: 'Outdoor-rated unit?', type: 'bool' },
    { key: 'new_outlet', label: 'No outlet near stairs (new circuit needed)?', type: 'bool' },
    { key: 'refurbished_discount', label: 'Open to refurbished unit?', type: 'bool' },
  ],
  stairlift_curved: [
    { key: 'each_turn', label: 'Number of turns/landings', type: 'qty', min: 0, max: 5, default: 0 },
    { key: 'outdoor_rated', label: 'Outdoor-rated unit?', type: 'bool' },
    { key: 'new_outlet', label: 'No outlet near stairs (new circuit needed)?', type: 'bool' },
  ],
  door_widening: [
    { key: 'qty', label: 'Number of doors', type: 'qty', min: 1, max: 10, default: 1 },
    { key: 'load_bearing', label: 'Exterior or load-bearing wall?', type: 'bool' },
    { key: 'electrical_in_wall', label: 'Light switch or outlet in that wall?', type: 'bool' },
    { key: 'new_door_hardware', label: 'Include new door and hardware?', type: 'bool' },
  ],
  vpl: [
    { key: 'rise_over_6ft', label: 'Rise height over 6 ft?', type: 'bool' },
    { key: 'concrete_pad', label: 'Concrete landing/pad already in place?', type: 'bool', invert: true },
    { key: 'enclosure', label: 'Want a weather enclosure?', type: 'bool' },
    { key: 'electrical_circuit', label: 'New electrical circuit needed?', type: 'bool' },
  ],
};

// ---------------------------------------------------------------------------
// UI State
// ---------------------------------------------------------------------------
let pricing = null; // Stripped service list (labels + permit flags only)
let state = { serviceId: null, qty: 1, rise_in: null, answers: {} };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const STEP_PCT = { 1: '25%', 2: '50%', 3: '75%', 4: '100%' };

function show(stepNum) {
  $$('.est-step').forEach((el) => {
    el.hidden = parseInt(el.dataset.step, 10) !== stepNum;
  });
  const bar = $('.est-progress-bar');
  if (bar) bar.style.setProperty('--pct', STEP_PCT[stepNum] || '25%');
}

function money(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function generateLeadId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function currentSelection() {
  const sel = {
    serviceId: state.serviceId,
    qty: state.qty,
    rise_in: state.rise_in,
    answers: { ...state.answers },
  };
  delete sel.answers.qty;
  delete sel.answers.rise_in;
  return sel;
}

// ---------------------------------------------------------------------------
// Step 1 — Service Grid
// ---------------------------------------------------------------------------
function renderServiceGrid() {
  const grid = $('#est-services');
  if (!grid || !pricing) return;

  grid.innerHTML = pricing.services
    .map(
      (svc) => `
      <button class="est-card" data-service="${svc.id}" type="button">
        <strong>${svc.label}</strong>
        <span class="est-hint">${svc.permitLikely ? 'Permit may be required' : 'Usually no permit'}</span>
      </button>`
    )
    .join('');

  grid.querySelectorAll('.est-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.serviceId = btn.dataset.service;
      state.qty = 1;
      state.rise_in = null;
      state.answers = {};
      renderQuestions();
      show(2);
    });
  });
}

// ---------------------------------------------------------------------------
// Step 2 — Questions
// ---------------------------------------------------------------------------
function renderQuestions() {
  const container = $('#est-questions');
  if (!container) return;

  const qs = QUESTIONS[state.serviceId] || [];
  const svc = pricing.services.find((s) => s.id === state.serviceId);

  let html = `<h3>${svc?.label || 'Service'}</h3>`;

  qs.forEach((q) => {
    html += '<div class="est-field">';

    if (q.type === 'bool') {
      html += `
        <label class="est-toggle">
          <input type="checkbox" data-key="${q.key}" ${state.answers[q.key] ? 'checked' : ''}>
          <span>${q.label}</span>
        </label>`;
    } else if (q.type === 'qty') {
      html += `
        <label>
          ${q.label}
          <input type="number" data-key="${q.key}" min="${q.min}" max="${q.max}" value="${state.answers[q.key] ?? q.default ?? 1}">
        </label>`;
    } else if (q.type === 'rise') {
      html += `
        <label>
          ${q.label}
          <input type="number" data-key="${q.key}" min="${q.min}" max="${q.max}" value="${state.answers[q.key] ?? ''}" placeholder="e.g. 18">
        </label>`;
    }

    html += '</div>';
  });

  container.innerHTML = html;

  container.querySelectorAll('input').forEach((input) => {
    input.addEventListener('change', () => {
      const key = input.dataset.key;
      const q = qs.find((x) => x.key === key);

      if (q.type === 'bool') {
        state.answers[key] = input.checked;
      } else if (q.type === 'qty' || q.type === 'rise') {
        const val = parseInt(input.value, 10);
        if (key === 'qty') state.qty = isNaN(val) ? 1 : val;
        else if (key === 'rise_in') state.rise_in = isNaN(val) ? null : val;
        else state.answers[key] = isNaN(val) ? 0 : val;
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Step 2 → 3 — Fetch ballpark BEFORE lead capture (no leadId, no logging)
// ---------------------------------------------------------------------------
async function fetchAndShowTeaser() {
  const nextBtn = $('#est-next');
  if (nextBtn) { nextBtn.disabled = true; nextBtn.textContent = 'Calculating…'; }

  try {
    const res = await fetch('/api/estimate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ selections: [currentSelection()] }),
    });

    if (!res.ok) throw new Error(`Estimate API error: ${res.status}`);

    const r = await res.json();

    $('#est-teaser-low').textContent = money(r.low);
    $('#est-teaser-high').textContent = money(r.high);

    show(3);
  } catch (err) {
    console.error('Estimate error:', err);
    const container = $('#est-questions');
    if (container) {
      const errEl = document.createElement('p');
      errEl.className = 'est-error';
      errEl.textContent = 'Sorry, we could not calculate your estimate right now. Please call (650) 713-6162.';
      container.appendChild(errEl);
    }
  } finally {
    if (nextBtn) { nextBtn.disabled = false; nextBtn.textContent = 'See my range'; }
  }
}

// ---------------------------------------------------------------------------
// Step 3 — Lead Capture (reveals confirmed range + logs lead to KV + Sheet)
// ---------------------------------------------------------------------------
function initLeadForm() {
  const form = $('#est-lead');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const lead = {
      name: fd.get('name')?.toString().trim(),
      phone: fd.get('phone')?.toString().trim(),
      zip: fd.get('zip')?.toString().trim(),
    };

    if (!lead.name || !lead.phone || !lead.zip) {
      alert('Please fill in all fields.');
      return;
    }

    const sel = currentSelection();
    const leadId = generateLeadId();

    try {
      // Always call /api/estimate WITH leadId so the Worker logs the full
      // record (incl. wholesale) to KV for the quote agent.
      const res = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ selections: [sel], leadId, lead }),
      });

      if (!res.ok) throw new Error(`Estimate API error: ${res.status}`);

      const r = await res.json();

      $('#est-low').textContent = money(r.low);
      $('#est-high').textContent = money(r.high);

      const permitEl = $('#est-permit');
      if (permitEl) permitEl.hidden = !r.items?.some((i) => i.permitLikely);

      show(4);

      fireLeadWebhook({ lead, sel, estimate: r, leadId });
    } catch (err) {
      console.error('Estimate error:', err);
      alert('Something went wrong. Please call (650) 713-6162.');
    }
  });
}

async function fireLeadWebhook(payload) {
  try {
    // Fire-and-forget to Google Apps Script (no-cors + text/plain avoids preflight)
    await fetch(LEAD_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'content-type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({
        name: payload.lead?.name,
        phone: payload.lead?.phone,
        zip: payload.lead?.zip,
        serviceId: payload.sel?.serviceId,
        answers: payload.sel?.answers || {},
        est: { low: payload.estimate?.low, high: payload.estimate?.high },
        leadId: payload.leadId,
      }),
    });
  } catch (e) {
    // Non-blocking: lead capture failure should never break the UX
    console.warn('Lead webhook failed:', e);
  }
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------
function initNavigation() {
  const nextBtn = $('#est-next');
  if (nextBtn) nextBtn.addEventListener('click', fetchAndShowTeaser);

  $$('[data-back]').forEach((btn) => {
    btn.addEventListener('click', () => show(parseInt(btn.dataset.back, 10)));
  });
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
export async function initEstimator(pricingUrl = './pricing-public.json') {
  try {
    const res = await fetch(pricingUrl);
    pricing = await res.json();
  } catch (e) {
    console.error('Failed to load services:', e);
    const grid = $('#est-services');
    if (grid) grid.innerHTML = '<p class="est-error">Unable to load services. Please refresh or call (650) 713-6162.</p>';
    return;
  }

  renderServiceGrid();
  initLeadForm();
  initNavigation();
  show(1);
}
