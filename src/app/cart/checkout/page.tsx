// P2 · "Kevin's Market": our own simulated Instacart-style checkout. Nothing is purchased anywhere. Placing the
// order logs one grocery expense (split by who added what) through the money service and clears the cart.
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dashboardCtx } from "@/lib/dashboard";
import { cart, members } from "@/services";
import { dollars } from "@/services/types";
import { Empty, NoHousehold, PageHead } from "@/components/ui";

export const dynamic = "force-dynamic";

const STORES = ["Kevin's Market", "Mart of Shame", "Buzz's Bodega", "Little Nero's Pantry"];

async function placeOrder(form: FormData) {
  "use server";
  const ctx = await dashboardCtx();
  if (!ctx) return;
  const items = await cart.listOpenItems(ctx);
  if (items.length === 0) redirect("/cart");
  const total = cart.cartTotal(items);
  await cart.markPurchased(ctx, { totalCents: total > 0 ? total : items.length * 499, payerId: String(form.get("payerId") || ctx.actorId) });
  revalidatePath("/", "layout");
  redirect("/money");
}

export default async function CheckoutPage() {
  const ctx = await dashboardCtx();
  if (!ctx) return <NoHousehold />;
  const [items, people] = await Promise.all([cart.listOpenItems(ctx), members.listMembers(ctx)]);
  const total = cart.cartTotal(items);
  const actor = people.find((m) => m.id === ctx.actorId);

  return (
    <main>
      <PageHead title="Kevin's Market" quip="Credit card? You got it.">
        <span className="pill gold">Simulated Instacart — nothing is really bought</span>
      </PageHead>

      {items.length === 0 ? (
        <div className="card">
          <Empty title="The cart is empty.">
            Nothing to check out. <Link href="/cart">Back to the cart</Link> and add something first.
          </Empty>
        </div>
      ) : (
        <div className="grid">
          <section className="card" style={{ gridColumn: "1 / -1" }}>
            <h2>
              Your order
              <span className="pill">{items.length} item{items.length === 1 ? "" : "s"}</span>
            </h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>For</th>
                  <th className="num">Price</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id}>
                    <td><b>{i.name}</b></td>
                    <td className="muted">{i.qty}</td>
                    <td>{i.shared ? <span className="pill green">Shared</span> : i.addedByName}</td>
                    <td className="num">{i.estCents != null ? dollars(i.estCents) : "—"}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3}><b>Total</b></td>
                  <td className="num"><span className="stat" style={{ fontSize: 20 }}>{dollars(total)}</span></td>
                </tr>
              </tbody>
            </table>
            <p className="muted" style={{ margin: "10px 0 0" }}>
              Estimated prices from Kevin&apos;s catalog. Delivery: never. Tip: whoever does the dishes.
            </p>
          </section>

          <section className="card">
            <h2>Place order</h2>
            <form action={placeOrder} className="stack">
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="store">Store</label>
                  <select id="store" name="store" defaultValue={STORES[0]}>
                    {STORES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="payerId">Paid by</label>
                  <select id="payerId" name="payerId" defaultValue={ctx.actorId}>
                    {people.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <button style={{ fontSize: 17, padding: "12px 22px" }}>Place order (simulated) · {dollars(total)}</button>
              </div>
              <small className="muted">
                No card is charged and no store is contacted. Placing the order logs one {dollars(total)} grocery expense paid by{" "}
                {actor?.name ?? "you"}: everyone pays for their own items, shared items split evenly across the house. Then it clears the cart.
              </small>
            </form>
          </section>

          <section className="card">
            <h2>Who owes what</h2>
            <ul className="list">
              {people.map((m) => {
                const mine = items.filter((i) => !i.shared && i.addedBy === m.id);
                const sharedCents = cart.cartTotal(items.filter((i) => i.shared));
                const share = Math.round(sharedCents / Math.max(1, people.length));
                return (
                  <li key={m.id}>
                    <b>{m.name}</b>
                    <span className="muted">
                      {mine.length} item{mine.length === 1 ? "" : "s"}
                      {sharedCents > 0 && <> + shared</>}
                    </span>
                    <span className="spacer" />
                    <span className="num">≈ {dollars(cart.cartTotal(mine) + share)}</span>
                  </li>
                );
              })}
            </ul>
            <p style={{ margin: "12px 0 0" }}>
              <Link href="/cart">← Back to the cart</Link>
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
