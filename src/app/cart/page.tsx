// P2 · Placeholder until the module is built. Follow app/members/page.tsx: read via services, write via server actions + revalidatePath.
import { dashboardCtx } from "@/lib/dashboard";
import { Empty, NoHousehold, PageHead } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const ctx = await dashboardCtx();
  if (!ctx) return <NoHousehold />;
  return (
    <main>
      <PageHead title="Grocery cart" quip="I'm eating junk and watching rubbish." />
      <div className="card">
        <Empty title="The cart is empty.">Shared grocery list and Instacart checkout are on the way.</Empty>
      </div>
    </main>
  );
}
