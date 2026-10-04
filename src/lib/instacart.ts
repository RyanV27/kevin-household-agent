// P2 · Sudhersan. Simulated store: the "Instacart" checkout is our own page at /cart/checkout ("Kevin's Market").
// No external API. This builds the link the Checkout button opens. Items and title are accepted so the signature
// stays the same if a real shopping-list API is wired in later.
export function createShoppingList(items: { name: string; qty: string }[], title = "Kevin's cart"): string {
  void items;
  void title;
  const base = (process.env.APP_URL ?? "").trim().replace(/\/+$/, "");
  return `${base}/cart/checkout`;
}

/** True when the link is absolute (APP_URL set), i.e. usable as a Telegram button. */
export const isAbsoluteUrl = (url: string | null | undefined) => /^https?:\/\//i.test(url ?? "");
