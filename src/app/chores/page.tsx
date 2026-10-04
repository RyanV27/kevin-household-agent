// P3 · Placeholder until the module is built. Follow app/members/page.tsx: read via services, write via server actions + revalidatePath.
import { dashboardCtx } from "@/lib/dashboard";
import { Empty, NoHousehold, PageHead } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ChoresPage() {
  const ctx = await dashboardCtx();
  if (!ctx) return <NoHousehold />;
  return (
    <main>
      <PageHead title="Chores" quip="I'm the man of the house." />
      <div className="card">
        <Empty title="No chore chart yet.">Chores, whose turn it is and the Hall of Shame are coming.</Empty>
      </div>
    </main>
  );
}
