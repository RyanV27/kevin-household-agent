// P8 · Placeholder until the module is built. Follow app/members/page.tsx: read via services, write via server actions + revalidatePath.
import { dashboardCtx } from "@/lib/dashboard";
import { Empty, NoHousehold, PageHead } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function UpkeepPage() {
  const ctx = await dashboardCtx();
  if (!ctx) return <NoHousehold />;
  return (
    <main>
      <PageHead title="Upkeep" quip="Kevin's battle plan for the house." />
      <div className="card">
        <Empty title="No battle plan yet.">Filters, smoke alarms and other recurring upkeep go here.</Empty>
      </div>
    </main>
  );
}
