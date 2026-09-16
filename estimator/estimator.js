/**
 * estimator.js — Pure pricing engine for Accessibility Install Estimator
 *
 * This module contains NO side effects and NO DOM code.
 * It can be imported in the browser, in a Node/Jest test suite,
 * or in a Cloudflare Worker.
 *
 * NEVER returns a single fixed price — always a {low, high} range.
 */

/**
 * Round a number to the nearest multiple of `to`.
 * @param {number} n
 * @param {number} [to=1]
 * @returns {number}
 */
function round(n, to = 1) {
  return Math.round(n / to) * to;
}

/**
 * Estimate a single service selection.
 *
 * @param {Object} pricing — Full pricing matrix (from pricing.json)
 * @param {Object} sel — Selection object:
 *   - serviceId {string}
 *   - qty       {number}   (default 1)
 *   - rise_in   {number}   (inches of rise, for ramp derivations)
 *   - answers   {Object}   { modifierKey: true|false }
 *
 * @returns {Object} Estimate result:
 *   - serviceId    {string}
 *   - label        {string}
 *   - units        {number}
 *   - wholesale    {number}  ⚠️ NEVER render this in the browser
 *   - retail       {number}
 *   - low          {number}  Display range low
 *   - high         {number}  Display range high
 *   - permitLikely {boolean}
 */
export function estimate(pricing, sel) {
  const svc = pricing.services.find((s) => s.id === sel.serviceId);
  if (!svc) {
    throw new Error(`unknown service ${sel.serviceId}`);
  }

  // Determine unit count
  let units = sel.qty ?? 1;
  if (svc.derive?.linear_ft && sel.rise_in != null) {
    // 1:12 slope → 1 ft of ramp per inch of rise
    units = Math.max(svc.derive.min_ft, Math.ceil(sel.rise_in * 1.0));
  }

  // Base wholesale cost
  let wholesale = svc.wholesale.base + svc.wholesale.perUnit * units;

  // Apply modifiers based on answers
  for (const [k, on] of Object.entries(sel.answers || {})) {
    if (on && k in svc.modifiers) {
      wholesale += svc.modifiers[k];
    }
  }

  // Apply regional labor multiplier
  wholesale *= pricing.sfLaborMultiplier ?? 1.0;

  // Calculate retail from markup
  const retail = wholesale * (1 + pricing.markupPct);

  // Apply display range padding (±pad% around retail)
  const pad = pricing.displayRangePadPct ?? 0.10;

  return {
    serviceId: svc.id,
    label: svc.label,
    units,
    wholesale: round(wholesale),       // internal only — strip before sending to client
    retail: round(retail),
    low: round(retail * (1 - pad), 50),
    high: round(retail * (1 + pad), 50),
    permitLikely: svc.permitLikely,
  };
}

/**
 * Estimate a bundle of multiple service selections.
 * Applies a 5% discount to the low end when 2+ items are selected
 * (trip-efficiency discount).
 *
 * @param {Object} pricing — Full pricing matrix
 * @param {Array<Object>} selections — Array of sel objects (same shape as estimate())
 *
 * @returns {Object} Bundle result:
 *   - items {Array<Object>} Individual estimates
 *   - low   {number} Bundle low (with discount if applicable)
 *   - high  {number} Bundle high
 */
export function estimateBundle(pricing, selections) {
  const items = selections.map((s) => estimate(pricing, s));

  const low = items.reduce((a, i) => a + i.low, 0);
  const high = items.reduce((a, i) => a + i.high, 0);

  // Multi-item trip discount: 5% off low end for 2+ items
  const disc = items.length > 1 ? 0.05 : 0;

  return {
    items,
    low: round(low * (1 - disc), 50),
    high: round(high, 50),
  };
}
