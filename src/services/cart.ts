// P2 · Ryan. Stubs return fake data so the agent tools work today.
import type { Ctx } from "./types";
import type { Expense } from "./money";

export type CartItem = { id: string; name: string; qty: string; addedByName: string; shared: boolean; estCents: number | null };

/** Items are attributed to ctx.actorId. estCents comes from a small price table, not the LLM. */
export async function addItems(ctx: Ctx, input: { items: { name: string; qty?: string }[]; shared?: boolean }): Promise<CartItem[]> {
  // TODO(Ryan, P2)
  return input.items.map((i, n) => ({ id: `fake-${n}`, name: i.name, qty: i.qty ?? "1", addedByName: "You", shared: !!input.shared, estCents: null }));
}

export async function removeItem(ctx: Ctx, input: { name: string }): Promise<boolean> {
  // TODO(Ryan, P2): remove the newest open item whose name matches (case-insensitive)
  return false;
}

/** Open items grouped by who added them ("Shared" for shared items). */
export async function viewCart(ctx: Pick<Ctx, "householdId">): Promise<Record<string, CartItem[]>> {
  // TODO(Ryan, P2)
  return {};
}

/** Builds the Instacart shopping-list link for all open items. Sudhersan supplies the Instacart client. */
export async function checkout(ctx: Pick<Ctx, "householdId">): Promise<{ url: string | null; items: CartItem[] }> {
  // TODO(Ryan + Sudhersan, P2): call lib/instacart.createShoppingList(items)
  return { url: null, items: [] };
}

/** Payer bought the cart: one expense, split by who added what (weighted by estCents), shared split evenly. */
export async function markPurchased(ctx: Ctx, input: { totalCents: number; payerId?: string }): Promise<Expense> {
  // TODO(Ryan, P2): compute splits in code, call money.logExpense with explicit split rows, mark items purchased
  return { id: "fake", payerName: "You", cents: input.totalCents, description: "Groceries", createdAt: new Date() };
}
