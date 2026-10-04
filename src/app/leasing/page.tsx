// P5 · Placeholder until the module is built. Follow app/members/page.tsx: read via services, write via server actions + revalidatePath.
import { dashboardCtx } from "@/lib/dashboard";
import { Empty, NoHousehold, PageHead } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function LeasingPage() {
  const ctx = await dashboardCtx();
  if (!ctx) return <NoHousehold />;
  return (
    <main>
      <PageHead title="Leasing" quip="Kevin handles the grown-up stuff." />
      <div className="card">
        <Empty title="No letters to the leasing office.">Work orders and email threads will show up here.</Empty>
      </div>
    </main>
  );
}
