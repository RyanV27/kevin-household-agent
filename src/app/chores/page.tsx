// P3 · Ryan. Follow app/members/page.tsx: read via services, write via server actions + revalidatePath.
import { dashboardCtx } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function ChoresPage() {
  const ctx = await dashboardCtx();
  if (!ctx) return <p>No household yet.</p>;
  return (
    <main>
      <h1>Chores</h1>
      <p>TODO(P3): see plans/kevin-module-prompts.md</p>
    </main>
  );
}
