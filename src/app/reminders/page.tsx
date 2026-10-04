// P4 · Placeholder until the module is built. Follow app/members/page.tsx: read via services, write via server actions + revalidatePath.
import { dashboardCtx } from "@/lib/dashboard";
import { Empty, NoHousehold, PageHead } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const ctx = await dashboardCtx();
  if (!ctx) return <NoHousehold />;
  return (
    <main>
      <PageHead title="Reminders" quip="KEVIN!" />
      <div className="card">
        <Empty title="Nothing to forget yet.">Rent and other reminders will live here.</Empty>
      </div>
    </main>
  );
}
