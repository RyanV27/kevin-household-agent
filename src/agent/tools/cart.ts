// P2 · Sudhersan. Cart tools: thin wrappers over services/cart. Buttons go through the outbox (never pasted URLs).
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { cart } from "@/services";
import type { Ctx } from "@/services/types";
import { dollars } from "@/services/types";
import { isAbsoluteUrl } from "@/lib/instacart";
import type { ToolOutbox } from "./index";
import { memberIdByName, toCents } from "./util";

/** Dashboard base URL; empty when APP_URL is unset (then no buttons: Telegram needs absolute links). */
const appUrl = () => (process.env.APP_URL ?? "").trim().replace(/\/+$/, "");

function pushButtons(outbox: ToolOutbox, which: Array<"view" | "checkout">) {
  const base = appUrl();
  if (!base) return;
  const have = new Set(outbox.buttons.map((b) => b.url));
  const add = (text: string, url: string) => {
    if (!have.has(url)) outbox.buttons.push({ text, url });
  };
  if (which.includes("view")) add("🛒 View cart", `${base}/cart`);
  if (which.includes("checkout")) add("Checkout", `${base}/cart/checkout`);
}

export const cartTools = (ctx: Ctx, outbox: ToolOutbox) => ({
  cart_add: createTool({
    id: "cart_add",
    description:
      "Add grocery items to the shared cart, attributed to the sender ('add 3 bags of chips for me' -> one item, name 'chips', qty '3 bags'). shared=true for household items (toilet paper, dish soap). View-cart and Checkout buttons are attached automatically; don't paste URLs.",
    inputSchema: z.object({
      items: z
        .array(
          z.object({
            name: z.string().min(1).describe("Item name without the quantity, e.g. 'chips'"),
            qty: z.string().optional().describe("Free text quantity, e.g. '3 bags', '2', '1 gallon'. Omit for 1."),
          }),
        )
        .min(1),
      shared: z.boolean().optional().describe("true when it's for the whole house, not one person"),
    }),
    execute: async (input) => {
      const items = await cart.addItems(ctx, input);
      pushButtons(outbox, ["view", "checkout"]);
      const estTotalCents = cart.cartTotal(items);
      return { items, estTotalCents, estTotal: dollars(estTotalCents) };
    },
  }),
  cart_remove: createTool({
    id: "cart_remove",
    description: "Remove an item from the open cart by name (case-insensitive).",
    inputSchema: z.object({ name: z.string().min(1) }),
    execute: async (input) => ({ removed: await cart.removeItem(ctx, input) }),
  }),
  cart_view: createTool({
    id: "cart_view",
    description: "Show the open cart grouped by who added each item, with estimated prices and the estimated total.",
    inputSchema: z.object({}),
    execute: async () => {
      const groups = await cart.viewCart(ctx);
      const all = Object.values(groups).flat();
      if (all.length) pushButtons(outbox, ["view"]);
      const estTotalCents = cart.cartTotal(all);
      return { groups, itemCount: all.length, estTotalCents, estTotal: dollars(estTotalCents) };
    },
  }),
  cart_checkout: createTool({
    id: "cart_checkout",
    description:
      "Open the store checkout (Kevin's Market, a simulated Instacart) for the open cart. A Checkout button with the link is attached automatically; don't paste the URL.",
    inputSchema: z.object({}),
    execute: async () => {
      const res = await cart.checkout(ctx);
      const linkAttached = isAbsoluteUrl(res.url);
      if (res.url && linkAttached) outbox.buttons.push({ text: "Checkout", url: res.url });
      const estTotalCents = cart.cartTotal(res.items);
      return { url: res.url, items: res.items, itemCount: res.items.length, estTotalCents, estTotal: dollars(estTotalCents), linkAttached };
    },
  }),
  cart_purchased: createTool({
    id: "cart_purchased",
    description:
      "Someone bought the cart for a total ('I bought the groceries, $84'). Creates one expense split by who added what (shared items split evenly) and clears the cart. Default payer = sender.",
    inputSchema: z.object({
      total: z.number().positive().describe("Dollars, e.g. 84.2"),
      payer: z.string().optional().describe("Who paid, by first name. Omit for the sender."),
    }),
    execute: async ({ total, payer }) =>
      cart.markPurchased(ctx, { totalCents: toCents(total), payerId: payer ? await memberIdByName(ctx, payer) : undefined }),
  }),
});
