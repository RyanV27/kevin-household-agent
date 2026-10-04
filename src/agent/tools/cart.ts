// P2 · Sudhersan.
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { cart } from "@/services";
import type { Ctx } from "@/services/types";
import type { ToolOutbox } from "./index";
import { toCents } from "./util";

export const cartTools = (ctx: Ctx, outbox: ToolOutbox) => ({
  cart_add: createTool({
    id: "cart_add",
    description:
      "Add grocery items to the shared cart, attributed to the sender ('add 3 bags of chips for me' -> one item, name 'chips', qty '3 bags'). shared=true for household items (toilet paper, dish soap).",
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
    execute: async (input) => cart.addItems(ctx, input),
  }),
  cart_remove: createTool({
    id: "cart_remove",
    description: "Remove an item from the open cart by name (case-insensitive).",
    inputSchema: z.object({ name: z.string().min(1) }),
    execute: async (input) => ({ removed: await cart.removeItem(ctx, input) }),
  }),
  cart_view: createTool({
    id: "cart_view",
    description: "Show the open cart grouped by who added each item.",
    inputSchema: z.object({}),
    execute: async () => cart.viewCart(ctx),
  }),
  cart_checkout: createTool({
    id: "cart_checkout",
    description: "Create the Instacart list for the open cart. A button with the link is attached automatically; don't paste the URL.",
    inputSchema: z.object({}),
    execute: async () => {
      const res = await cart.checkout(ctx);
      if (res.url) outbox.buttons.push({ text: "🛒 Open in Instacart", url: res.url });
      return { itemCount: res.items.length, linkAttached: !!res.url };
    },
  }),
  cart_purchased: createTool({
    id: "cart_purchased",
    description: "Someone bought the cart for a total ('I bought the groceries, $84'). Creates one expense split by who added what. Default payer = sender.",
    inputSchema: z.object({ total: z.number().positive().describe("Dollars, e.g. 84.2") }),
    execute: async ({ total }) => cart.markPurchased(ctx, { totalCents: toCents(total) }),
  }),
});
