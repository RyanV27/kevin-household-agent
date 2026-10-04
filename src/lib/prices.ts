// Built-in grocery price catalog for cart estimates. No API: a small table of common items with typical US unit
// prices in integer cents. The LLM never prices anything; cart.addItems calls estimate() and stores estCents.

/** name (lower case, singular where it matters) -> unit price in cents */
export const CATALOG: Record<string, number> = {
  // dairy + eggs
  milk: 449,
  "oat milk": 499,
  "almond milk": 399,
  eggs: 429,
  butter: 549,
  cheese: 599,
  "cheddar cheese": 599,
  "shredded cheese": 449,
  yogurt: 129,
  "greek yogurt": 599,
  "cream cheese": 349,
  "ice cream": 599,
  // bakery + grains
  bread: 379,
  bagels: 449,
  tortillas: 349,
  rice: 699,
  pasta: 199,
  "pasta sauce": 349,
  cereal: 499,
  oatmeal: 449,
  flour: 399,
  sugar: 349,
  // produce
  bananas: 149,
  apples: 399,
  oranges: 449,
  strawberries: 499,
  blueberries: 449,
  avocados: 199,
  avocado: 199,
  tomatoes: 349,
  lettuce: 249,
  spinach: 349,
  onions: 199,
  garlic: 99,
  potatoes: 449,
  carrots: 199,
  broccoli: 249,
  lemons: 99,
  limes: 79,
  // protein
  "chicken breast": 899,
  chicken: 899,
  "ground beef": 799,
  bacon: 749,
  salmon: 1199,
  tofu: 299,
  "peanut butter": 449,
  beans: 149,
  "black beans": 149,
  // snacks
  chips: 449,
  "tortilla chips": 449,
  salsa: 399,
  hummus: 449,
  cookies: 399,
  crackers: 349,
  popcorn: 349,
  pretzels: 349,
  chocolate: 299,
  "granola bars": 549,
  // drinks
  coffee: 999,
  tea: 499,
  "orange juice": 449,
  juice: 449,
  soda: 699,
  "sparkling water": 599,
  water: 499,
  beer: 1299,
  wine: 1299,
  // frozen + pantry
  pizza: 699,
  "frozen pizza": 699,
  "frozen vegetables": 299,
  ketchup: 349,
  mustard: 249,
  mayo: 449,
  "olive oil": 999,
  "soy sauce": 349,
  "hot sauce": 399,
  salt: 199,
  pepper: 399,
  ramen: 99,
  // household
  "toilet paper": 1299,
  "paper towels": 999,
  "dish soap": 349,
  "hand soap": 299,
  "laundry detergent": 1299,
  "trash bags": 999,
  sponges: 349,
  "all-purpose cleaner": 449,
  shampoo: 699,
  toothpaste: 399,
};

export const CATALOG_SIZE = Object.keys(CATALOG).length;

/** Price for anything the catalog doesn't know. */
export const DEFAULT_UNIT_CENTS = 499;

export const normalizeName = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

/** Trivial singular form so "bagel" matches "bagels" and "eggs" matches "egg" either way. */
const singular = (s: string) => (s.length > 3 && s.endsWith("s") && !s.endsWith("ss") ? s.slice(0, -1) : s);

/**
 * Catalog lookup. Tiers, first hit wins: exact -> catalog name starts with the query (or vice versa)
 * -> one contains the other. Within a tier the shortest catalog name wins. Null when nothing matches.
 */
export function lookupPrice(name: string): { name: string; unitCents: number } | null {
  const q = normalizeName(name);
  if (!q) return null;
  const qs = singular(q);
  const keys = Object.keys(CATALOG);
  const tiers: Array<(k: string) => boolean> = [
    (k) => k === q || singular(k) === qs,
    (k) => k.startsWith(q) || q.startsWith(k) || singular(k).startsWith(qs) || qs.startsWith(singular(k)),
    (k) => k.includes(qs) || qs.includes(singular(k)),
  ];
  for (const test of tiers) {
    const hits = keys.filter(test).sort((a, b) => a.length - b.length || a.localeCompare(b));
    if (hits[0]) return { name: hits[0], unitCents: CATALOG[hits[0]] };
  }
  return null;
}

/** Leading number in a free-text quantity: "3 bags" -> 3, "2" -> 2, "1.5 lb" -> 1.5, "a dozen" -> 1. Never < 1. */
export function parseQty(qty: string | undefined | null): number {
  const m = String(qty ?? "").trim().match(/^(\d+(?:\.\d+)?)/);
  if (!m) return 1;
  const n = Number(m[1]);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

/** Estimated cents for `qty` of `name`: unit price (catalog or 499 default) x leading number in qty. */
export function estimate(name: string, qty?: string | null): number {
  const unit = lookupPrice(name)?.unitCents ?? DEFAULT_UNIT_CENTS;
  return Math.round(unit * parseQty(qty));
}
