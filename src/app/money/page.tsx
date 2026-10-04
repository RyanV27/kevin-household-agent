// P1 · Placeholder until the module is built. Follow app/members/page.tsx: read via services, write via server actions + revalidatePath.
import { dashboardCtx } from "@/lib/dashboard";
import { Empty, NoHousehold, PageHead } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function MoneyPage() {
  const ctx = await dashboardCtx();
  if (!ctx) return <NoHousehold />;
  return (
    <main>
      <PageHead title="Money" quip="Keep the change, ya filthy animal." />
      <div className="card">
        <Empty title="Kevin's still counting.">Expenses, splits and settling up land here next.</Empty>
      </div>
    </main>
  );
}
