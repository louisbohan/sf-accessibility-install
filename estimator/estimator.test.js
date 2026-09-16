/**
 * estimator.test.js — Jest test suite for the Accessibility Install Estimator
 *
 * 10 services × 2 cases each = 20 core tests.
 * Verifies that computed retail ranges land inside the expected SF Bay Area
 * retail bands from Section 1 of the spec.
 */

import { estimate, estimateBundle } from './estimator.js';
import pricing from './pricing.json';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function expectRangeInside(result, minExpected, maxExpected) {
  expect(result.low).toBeGreaterThanOrEqual(minExpected);
  expect(result.high).toBeLessThanOrEqual(maxExpected);
  expect(result.low).toBeLessThanOrEqual(result.high);
}

// ---------------------------------------------------------------------------
// 1. Grab bars
// ---------------------------------------------------------------------------
describe('grab_bars', () => {
  test('basic 1-bar drywall install lands inside $250–$450', () => {
    const r = estimate(pricing, {
      serviceId: 'grab_bars',
      qty: 1,
      answers: {},
    });
    expectRangeInside(r, 250, 450);
  });

  test('3-bar package with tile + blocking lands inside $650–$1,100', () => {
    const r = estimate(pricing, {
      serviceId: 'grab_bars',
      qty: 3,
      answers: { tile_wall: true, needs_blocking: true, ada_rated_bar: true },
    });
    expectRangeInside(r, 650, 1100);
  });
});

// ---------------------------------------------------------------------------
// 2. Threshold ramp
// ---------------------------------------------------------------------------
describe('threshold_ramp', () => {
  test('basic indoor threshold ramp lands inside $200–$800', () => {
    const r = estimate(pricing, {
      serviceId: 'threshold_ramp',
      answers: {},
    });
    expectRangeInside(r, 200, 800);
  });

  test('outdoor custom-cut high-rise ramp lands inside $200–$800', () => {
    const r = estimate(pricing, {
      serviceId: 'threshold_ramp',
      answers: { rise_over_3in: true, outdoor: true, custom_cut: true },
    });
    expectRangeInside(r, 200, 800);
  });
});

// ---------------------------------------------------------------------------
// 3. Modular aluminum ramp
// ---------------------------------------------------------------------------
describe('modular_ramp', () => {
  test('small 12" rise straight run lands inside $2,000–$6,000', () => {
    const r = estimate(pricing, {
      serviceId: 'modular_ramp',
      rise_in: 12,
      answers: {},
    });
    expectRangeInside(r, 2000, 6000);
  });

  test('24" rise with turn + handrails + hillside lands inside $2,000–$6,000', () => {
    const r = estimate(pricing, {
      serviceId: 'modular_ramp',
      rise_in: 24,
      answers: { platform_turn: true, handrails_both_sides: true, hillside_footing: true },
    });
    expectRangeInside(r, 2000, 6000);
  });
});

// ---------------------------------------------------------------------------
// 4. Wood ramp (custom)
// ---------------------------------------------------------------------------
describe('wood_ramp', () => {
  test('small 12" rise straight run lands inside $1,500–$5,500', () => {
    const r = estimate(pricing, {
      serviceId: 'wood_ramp',
      rise_in: 12,
      answers: {},
    });
    expectRangeInside(r, 1500, 5500);
  });

  test('24" rise with turn + handrails lands inside $1,500–$5,500', () => {
    const r = estimate(pricing, {
      serviceId: 'wood_ramp',
      rise_in: 24,
      answers: { platform_turn: true, handrails_both_sides: true },
    });
    expectRangeInside(r, 1500, 5500);
  });
});

// ---------------------------------------------------------------------------
// 5. Portable ramp
// ---------------------------------------------------------------------------
describe('portable_ramp', () => {
  test('basic ≤6 ft ramp lands inside $300–$1,500', () => {
    const r = estimate(pricing, {
      serviceId: 'portable_ramp',
      answers: {},
    });
    expectRangeInside(r, 300, 1500);
  });

  test('heavy-duty 10+ ft ramp lands inside $300–$1,500', () => {
    const r = estimate(pricing, {
      serviceId: 'portable_ramp',
      answers: { length_over_6ft: true, length_over_10ft: true, heavy_duty_600lb: true },
    });
    expectRangeInside(r, 300, 1500);
  });
});

// ---------------------------------------------------------------------------
// 6. Handrail / stair railing
// ---------------------------------------------------------------------------
describe('handrail', () => {
  test('single interior run lands inside $400–$1,200', () => {
    const r = estimate(pricing, {
      serviceId: 'handrail',
      qty: 1,
      answers: {},
    });
    expectRangeInside(r, 400, 1200);
  });

  test('exterior both-sides masonry run lands inside $400–$1,200', () => {
    const r = estimate(pricing, {
      serviceId: 'handrail',
      qty: 1,
      answers: { both_sides: true, exterior: true, masonry_wall: true },
    });
    expectRangeInside(r, 400, 1200);
  });
});

// ---------------------------------------------------------------------------
// 7. Stair lift (straight)
// ---------------------------------------------------------------------------
describe('stairlift_straight', () => {
  test('basic straight indoor lift lands inside $3,500–$7,100', () => {
    const r = estimate(pricing, {
      serviceId: 'stairlift_straight',
      answers: {},
    });
    expectRangeInside(r, 3500, 7100);
  });

  test('outdoor 16-step with new outlet lands inside $3,500–$7,100', () => {
    const r = estimate(pricing, {
      serviceId: 'stairlift_straight',
      answers: { steps_over_14: true, outdoor_rated: true, new_outlet: true },
    });
    expectRangeInside(r, 3500, 7100);
  });
});

// ---------------------------------------------------------------------------
// 8. Stair lift (curved)
// ---------------------------------------------------------------------------
describe('stairlift_curved', () => {
  test('basic curved indoor lift lands inside $9,000–$17,000', () => {
    const r = estimate(pricing, {
      serviceId: 'stairlift_curved',
      answers: {},
    });
    expectRangeInside(r, 9000, 17000);
  });

  test('outdoor with 2 turns + new outlet lands inside $9,000–$17,000', () => {
    const r = estimate(pricing, {
      serviceId: 'stairlift_curved',
      answers: { each_turn: 2, outdoor_rated: true, new_outlet: true },
    });
    expectRangeInside(r, 9000, 17000);
  });
});

// ---------------------------------------------------------------------------
// 9. Door widening
// ---------------------------------------------------------------------------
describe('door_widening', () => {
  test('single non-bearing door lands inside $1,200–$3,500', () => {
    const r = estimate(pricing, {
      serviceId: 'door_widening',
      qty: 1,
      answers: {},
    });
    expectRangeInside(r, 1200, 3500);
  });

  test('load-bearing with electrical + finish match lands inside $1,200–$3,500', () => {
    const r = estimate(pricing, {
      serviceId: 'door_widening',
      qty: 1,
      answers: { load_bearing: true, electrical_in_wall: true, finish_match: true },
    });
    expectRangeInside(r, 1200, 3500);
  });
});

// ---------------------------------------------------------------------------
// 10. Vertical platform lift (VPL)
// ---------------------------------------------------------------------------
describe('vpl', () => {
  test('basic <6 ft rise lands inside $8,000–$18,000', () => {
    const r = estimate(pricing, {
      serviceId: 'vpl',
      answers: {},
    });
    expectRangeInside(r, 8000, 18000);
  });

  test('>6 ft rise with pad + enclosure + electrical lands inside $8,000–$18,000', () => {
    const r = estimate(pricing, {
      serviceId: 'vpl',
      answers: {
        rise_over_6ft: true,
        concrete_pad: true,
        enclosure: true,
        electrical_circuit: true,
      },
    });
    expectRangeInside(r, 8000, 18000);
  });
});

// ---------------------------------------------------------------------------
// Bundle discount logic
// ---------------------------------------------------------------------------
describe('estimateBundle', () => {
  test('single item has no discount', () => {
    const b = estimateBundle(pricing, [
      { serviceId: 'grab_bars', qty: 1, answers: {} },
    ]);
    expect(b.items).toHaveLength(1);
    expect(b.low).toBe(b.items[0].low);
    expect(b.high).toBe(b.items[0].high);
  });

  test('2+ items get 5% off low end', () => {
    const b = estimateBundle(pricing, [
      { serviceId: 'grab_bars', qty: 1, answers: {} },
      { serviceId: 'threshold_ramp', answers: {} },
    ]);
    expect(b.items).toHaveLength(2);
    const rawLow = b.items.reduce((a, i) => a + i.low, 0);
    expect(b.low).toBe(Math.round((rawLow * 0.95) / 50) * 50);
    expect(b.high).toBe(b.items.reduce((a, i) => a + i.high, 0));
  });
});

// ---------------------------------------------------------------------------
// Edge cases & error handling
// ---------------------------------------------------------------------------
describe('edge cases', () => {
  test('unknown service throws', () => {
    expect(() => estimate(pricing, { serviceId: 'nope' })).toThrow('unknown service nope');
  });

  test('ramp derivation respects min_ft', () => {
    const r = estimate(pricing, {
      serviceId: 'modular_ramp',
      rise_in: 1, // would be 1 ft, but min_ft is 4
      answers: {},
    });
    expect(r.units).toBe(4);
  });

  test('negative modifier (refurbished discount) reduces price', () => {
    const withDisc = estimate(pricing, {
      serviceId: 'stairlift_straight',
      answers: { refurbished_discount: true },
    });
    const without = estimate(pricing, {
      serviceId: 'stairlift_straight',
      answers: {},
    });
    expect(withDisc.retail).toBeLessThan(without.retail);
  });
});
