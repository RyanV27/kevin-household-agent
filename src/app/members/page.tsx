// P0 · Ryan. Members + house settings. This page is the reference pattern: server component reads services, server actions write.
import { revalidatePath } from "next/cache";
import { dashboardCtx } from "@/lib/dashboard";
import { members } from "@/services";

export const dynamic = "force-dynamic";

async function add(form: FormData) {
  "use server";
  const ctx = await dashboardCtx();
  if (!ctx) return;
  await members.addMember(ctx, { name: String(form.get("name")) });
  revalidatePath("/members");
}

async function rename(form: FormData) {
  "use server";
  const ctx = await dashboardCtx();
  if (!ctx) return;
  await members.renameMember(ctx, { memberId: String(form.get("id")), name: String(form.get("name")) });
  revalidatePath("/members");
}

export default async function MembersPage() {
  const ctx = await dashboardCtx();
  if (!ctx) return <p>No household yet.</p>;
  const people = await members.listMembers(ctx);
  return (
    <main>
      <h1>Roommates</h1>
      {people.map((m) => (
        <form key={m.id} action={rename} style={{ display: "flex", gap: 8 }}>
          <input type="hidden" name="id" value={m.id} />
          <input name="name" defaultValue={m.name} />
          <small>{m.telegramUserId ? `Telegram ${m.telegramUserId}` : "not on Telegram"}</small>
          <button>Save</button>
        </form>
      ))}
      <form action={add} style={{ marginTop: 16 }}>
        <input name="name" placeholder="New roommate" required /> <button>Add</button>
      </form>
      {/* TODO(Ryan, P0): remove button, house settings form (name, rent $, due day, leasing email) -> updateHouseSettings + reminders.syncRentReminder */}
    </main>
  );
}
