// Pure-function tests for the cart. No DB: price estimates, the weighted split, and cartTotal.
// Run: npx tsx --test src/services/cart.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { CATALOG, CATALOG_SIZE, DEFAULT_UNIT_CENTS, estimate, lookupPrice, parseQty } from "../lib/prices";
import { createShoppingList } from "../lib/instacart";
import { cartTotal, computeCartSplits, type SplitItem } from "./cart";

const sum = (rows: { cents: number }[]) => rows.reduce((s, r) => s + r.cents, 0);
const by = (rows: { memberId: string; cents: number }[]) => Object.fromEntries(rows.map((r) => [r.memberId, r.cents]));

/* ---------- prices ---------- */

test("catalog has ~60+ items with positive integer prices", () => {
  assert.ok(CATALOG_SIZE >= 60, `only ${CATALOG_SIZE} items`);
  for (const [k, v] of Object.entries(CATALOG)) {
    assert.ok(Number.isInteger(v) && v > 0, `${k} has a bad price ${v}`);
    assert.equal(k, k.trim().toLowerCase(), `${k} should be normalized`);
  }
});

test("lookupPrice: exact, then startsWith, then includes; case and spacing don't matter", () => {
  assert.equal(lookupPrice("milk")?.name, "milk");
  assert.equal(lookupPrice("  MILK ")?.name, "milk");
  assert.equal(lookupPrice("oat milk")?.name, "oat milk");
  assert.equal(lookupPrice("sparkling")?.name, "sparkling water", "startsWith");
  assert.equal(lookupPrice("oat")?.name, "oatmeal", "startsWith: shortest catalog name wins");
  assert.equal(lookupPrice("toilet")?.name, "toilet paper", "startsWith");
  assert.equal(lookupPrice("whole milk")?.name, "milk", "includes");
  assert.equal(lookupPrice("bag of chips")?.name, "chips", "includes");
  assert.equal(lookupPrice("egg")?.name, "eggs", "plural-insensitive");
  assert.equal(lookupPrice("caviar"), null);
  assert.equal(lookupPrice(""), null);
});

test("parseQty: leading number, default 1", () => {
  assert.equal(parseQty("3 bags"), 3);
  assert.equal(parseQty("2"), 2);
  assert.equal(parseQty("1 gallon"), 1);
  assert.equal(parseQty("1.5 lb"), 1.5);
  assert.equal(parseQty("a dozen"), 1);
  assert.equal(parseQty(undefined), 1);
  assert.equal(parseQty("0"), 1, "never below 1");
});

test("estimate: unit price x qty; unknown items default to 499", () => {
  assert.equal(estimate("chips", "3 bags"), 3 * CATALOG.chips);
  assert.equal(estimate("milk"), CATALOG.milk);
  assert.equal(estimate("Dish Soap", "2"), 2 * CATALOG["dish soap"]);
  assert.equal(estimate("caviar"), DEFAULT_UNIT_CENTS);
  assert.equal(estimate("caviar", "4 tins"), 4 * DEFAULT_UNIT_CENTS);
  assert.ok(Number.isInteger(estimate("milk", "1.5")));
});

test("createShoppingList points at our simulated checkout page", () => {
  const saved = process.env.APP_URL;
  try {
    process.env.APP_URL = "https://kevin.example/";
    assert.equal(createShoppingList([{ name: "milk", qty: "1" }], "x"), "https://kevin.example/cart/checkout");
    delete process.env.APP_URL;
    assert.equal(createShoppingList([], "x"), "/cart/checkout");
  } finally {
    if (saved === undefined) delete process.env.APP_URL;
    else process.env.APP_URL = saved;
  }
});

/* ---------- cartTotal ---------- */

test("cartTotal sums estimates, treating unknown as 0", () => {
  assert.equal(cartTotal([]), 0);
  assert.equal(cartTotal([{ estCents: 100 }, { estCents: null }, { estCents: 250 }]), 350);
});

/* ---------- computeCartSplits ---------- */

const item = (addedBy: string, estCents: number | null, shared = false): SplitItem => ({ addedBy, estCents, shared });
const ACTIVE = ["a", "b", "c"];

test("splits: each person pays for their own items, scaled to the real total", () => {
  // a: 1000, b: 3000 estimated; the receipt says 8000 -> a 2000, b 6000, c omitted.
  const rows = computeCartSplits([item("a", 1000), item("b", 3000)], ACTIVE, 8000, "a");
  assert.deepEqual(by(rows), { a: 2000, b: 6000 });
  assert.equal(sum(rows), 8000);
});

test("splits: shared items split evenly across active members", () => {
  const rows = computeCartSplits([item("a", 900, true)], ACTIVE, 900, "a");
  assert.deepEqual(by(rows), { a: 300, b: 300, c: 300 });
  const mixed = computeCartSplits([item("a", 600), item("b", 300, true)], ACTIVE, 900, "b");
  assert.deepEqual(by(mixed), { a: 700, b: 100, c: 100 });
});

test("splits: sums exactly to total; remainder cents go to the payer first", () => {
  // 1000 split three even ways via a shared item: 334/333/333 with the extra cent on the payer.
  const rows = computeCartSplits([item("a", 500, true)], ACTIVE, 1000, "c");
  assert.equal(sum(rows), 1000);
  assert.equal(by(rows).c, 334);
  assert.equal(by(rows).a, 333);
  assert.equal(by(rows).b, 333);
  // payer isn't a participant -> the cent still lands somewhere, still exact.
  const rows2 = computeCartSplits([item("a", 1), item("b", 1)], ACTIVE, 1001, "c");
  assert.equal(sum(rows2), 1001);
  assert.deepEqual(Object.keys(by(rows2)).sort(), ["a", "b"]);
});

test("splits: always exact for awkward totals and weights", () => {
  const items = [item("a", 333), item("b", 777), item("c", 1), item("a", 199, true), item("b", 5, true)];
  for (const total of [1, 2, 3, 7, 99, 101, 1337, 12345, 99999]) {
    for (const payer of ACTIVE) {
      const rows = computeCartSplits(items, ACTIVE, total, payer);
      assert.equal(sum(rows), total, `total ${total} payer ${payer}`);
      assert.ok(rows.every((r) => Number.isInteger(r.cents) && r.cents >= 0));
      assert.equal(new Set(rows.map((r) => r.memberId)).size, rows.length, "no duplicate members");
    }
  }
});

test("splits: zero-weight members are omitted; items from inactive adders count as shared", () => {
  const rows = computeCartSplits([item("a", 500), item("gone", 300)], ACTIVE, 800, "a");
  // 'gone' isn't active: their 300 is shared across a, b, c (100 each). a: 600, b: 100, c: 100.
  assert.deepEqual(by(rows), { a: 600, b: 100, c: 100 });
  assert.ok(!("gone" in by(rows)));
});

test("splits: no estimates at all -> split by item count", () => {
  const rows = computeCartSplits([item("a", null), item("a", null), item("b", 0)], ACTIVE, 300, "b");
  assert.deepEqual(by(rows), { a: 200, b: 100 });
});

test("splits: empty cart or no active members -> no rows", () => {
  assert.deepEqual(computeCartSplits([], ACTIVE, 100, "a"), []);
  assert.deepEqual(computeCartSplits([item("a", 100)], [], 100, "a"), []);
});
