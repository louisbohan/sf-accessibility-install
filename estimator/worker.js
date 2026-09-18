/**
 * worker.js — Cloudflare Worker for Accessibility Install Estimator
 *
 * Endpoints:
 *   POST /api/estimate   → Returns ONLY safe {low, high, items} range. No wholesale.
 *   PUT  /api/pricing    → Owner-only markup update via X-Owner-Key header.
 *
 * Environment bindings expected:
 *   - PRICING   (KV namespace)  Key "current" holds the pricing JSON.
 *   - OWNER_KEY (secret string) Header value required for /api/pricing.
 */

import { estimateBundle } from './estimator.js';

// CORS headers for browser requests
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Owner-Key',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...CORS },
  });
}

function text(body, status = 200) {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/plain', ...CORS },
  });
}

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);

    // -----------------------------------------------------------------------
    // POST /api/estimate
    // Body: { selections: [...], leadId?, lead? }
    // Returns: { low, high, items: [{ label, low, high, permitLikely }] }
    // -----------------------------------------------------------------------
    if (url.pathname === '/api/estimate' && request.method === 'POST') {
      let pricing;
      try {
        const raw = await env.PRICING.get('current');
        if (!raw) throw new Error('pricing not found in KV');
        pricing = JSON.parse(raw);
      } catch (e) {
        return json({ error: 'Pricing unavailable' }, 500);
      }

      let body;
      try {
        body = await request.json();
      } catch (e) {
        return json({ error: 'Invalid JSON body' }, 400);
      }

      const { selections, leadId, lead } = body || {};
      if (!Array.isArray(selections) || selections.length === 0) {
        return json({ error: 'selections array required' }, 400);
      }

      let result;
      try {
        result = estimateBundle(pricing, selections);
      } catch (e) {
        return json({ error: e.message }, 400);
      }

      // Strip wholesale/retail — only safe range goes to the browser
      const safe = {
        low: result.low,
        high: result.high,
        items: result.items.map(({ label, low, high, permitLikely }) => ({
          label,
          low,
          high,
          permitLikely,
        })),
      };

      // Log full record (incl. wholesale) to KV for quote-agent retrieval
      if (leadId) {
        const record = {
          leadId,
          lead,
          selections,
          estimate: result,
          ts: new Date().toISOString(),
        };
        ctx.waitUntil(
          env.PRICING.put(`est:${leadId}`, JSON.stringify(record))
        );
      }

      return json(safe);
    }

    // -----------------------------------------------------------------------
    // PUT /api/pricing
    // Header: X-Owner-Key: <secret>
    // Body:   Full pricing JSON (or partial patch — full replacement for now)
    // -----------------------------------------------------------------------
    if (url.pathname === '/api/pricing' && request.method === 'PUT') {
      const ownerKey = request.headers.get('X-Owner-Key');
      if (!ownerKey || ownerKey !== env.OWNER_KEY) {
        return text('nope', 401);
      }

      let bodyText;
      try {
        bodyText = await request.text();
        // Validate it's parseable JSON
        JSON.parse(bodyText);
      } catch (e) {
        return json({ error: 'Invalid JSON body' }, 400);
      }

      await env.PRICING.put('current', bodyText);
      return text('ok');
    }

    // -----------------------------------------------------------------------
    // GET /api/pricing  (owner-only read-back)
    // -----------------------------------------------------------------------
    if (url.pathname === '/api/pricing' && request.method === 'GET') {
      const ownerKey = request.headers.get('X-Owner-Key');
      if (!ownerKey || ownerKey !== env.OWNER_KEY) {
        return text('nope', 401);
      }

      const raw = await env.PRICING.get('current');
      if (!raw) return json({ error: 'not found' }, 404);
      return new Response(raw, {
        headers: { 'content-type': 'application/json', ...CORS },
      });
    }

    // -----------------------------------------------------------------------
    // POST /api/lead — forwards lead to Google Apps Script (Google Sheet).
    // Server-side so the browser never hits Google's bot-protection directly.
    // -----------------------------------------------------------------------
    if (url.pathname === '/api/lead' && request.method === 'POST') {
      const LEAD_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzwKTo2CAYgom77Xis3RT_GPSEtnidPDW2D0S3xJ7G-wW8rwdEhD9ioRdUCIVsl9KPj8w/exec';
      const bodyText = await request.text();
      try {
        const res = await fetch(LEAD_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (compatible; GoogleAppsScript-Proxy/1.0)',
          },
          body: bodyText,
        });
        const forwarded = await res.text();
        return json({ ok: true, upstream: res.status, body: forwarded.slice(0, 200) });
      } catch (e) {
        return json({ ok: false, error: String(e) }, 502);
      }
    }

    // -----------------------------------------------------------------------
    // GET /api/leads  (owner-only) — list all captured leads from KV
    // -----------------------------------------------------------------------
    if (url.pathname === '/api/leads' && request.method === 'GET') {
      const ownerKey = request.headers.get('X-Owner-Key');
      if (!ownerKey || ownerKey !== env.OWNER_KEY) {
        return text('nope', 401);
      }
      const list = await env.PRICING.list({ prefix: 'est:' });
      const leads = [];
      for (const k of list.keys) {
        const raw = await env.PRICING.get(k.name);
        if (raw) {
          try { leads.push(JSON.parse(raw)); } catch (_) { /* skip malformed */ }
        }
      }
      leads.sort((a, b) => (b.ts || 0) - (a.ts || 0));
      return json({ count: leads.length, leads });
    }

    return text('not found', 404);
  },
};
