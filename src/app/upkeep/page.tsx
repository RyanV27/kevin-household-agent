// P8 · Ryan. Follow app/members/page.tsx: read via services, write via server actions + revalidatePath.
import { dashboardCtx } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function UpkeepPage() {
  const ctx = await dashboardCtx();
  if (!ctx) return <p>No household yet.</p>;
  return (
    <main>
      <h1>Upkeep</h1>
      <p>TODO(P8): see plans/kevin-module-prompts.md</p>
    </main>
  );
}
