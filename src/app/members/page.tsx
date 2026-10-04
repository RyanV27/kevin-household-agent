// P0 · Ryan. Members + house settings. This page is the reference pattern: server component reads services, server actions write.
import { revalidatePath } from "next/cache";
import { dashboardCtx } from "@/lib/dashboard";
import { members, reminders } from "@/services";

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

async function remove(form: FormData) {
  "use server";
  const ctx = await dashboardCtx();
  if (!ctx) return;
  await members.removeMember(ctx, { memberId: String(form.get("id")) });
  revalidatePath("/", "layout");
}

async function saveSettings(form: FormData) {
  "use server";
  const ctx = await dashboardCtx();
  if (!ctx) return;
  const rent = String(form.get("rent") ?? "").trim();
  const day = String(form.get("dueDay") ?? "").trim();
  await members.updateHouseSettings(ctx, {
    name: String(form.get("name")).trim() || "Our place",
    rentCents: rent ? Math.round(Number(rent) * 100) : null,
    rentDueDay: day ? Math.min(28, Math.max(1, Math.round(Number(day)))) : null,
    leasingEmail: String(form.get("leasingEmail") ?? "").trim() || null,
  });
  await reminders.syncRentReminder(ctx);
  revalidatePath("/members");
}

export default async function MembersPage() {
  const ctx = await dashboardCtx();
  if (!ctx) return <p>No household yet.</p>;
  const [people, house] = await Promise.all([members.listMembers(ctx), members.getHousehold(ctx.householdId)]);
  return (
    <main>
      <h1>Roommates</h1>
      {people.map((m) => (
        <form key={m.id} action={rename} style={{ display: "flex", gap: 8 }}>
          <input type="hidden" name="id" value={m.id} />
          <input name="name" defaultValue={m.name} />
          <small>{m.telegramUserId ? `Telegram ${m.telegramUserId}` : "not on Telegram"}</small>
          <button>Save</button>
          <button formAction={remove}>Remove</button>
        </form>
      ))}
      <form action={add} style={{ marginTop: 16 }}>
        <input name="name" placeholder="New roommate" required /> <button>Add</button>
      </form>

      <h2>House settings</h2>
      <form action={saveSettings} style={{ display: "grid", gridTemplateColumns: "max-content 240px", gap: 8 }}>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" defaultValue={house?.name ?? ""} required />
        <label htmlFor="rent">Rent ($/month)</label>
        <input id="rent" name="rent" type="number" min="0" step="0.01" defaultValue={house?.rentCents != null ? house.rentCents / 100 : ""} />
        <label htmlFor="dueDay">Rent due day (1-28)</label>
        <input id="dueDay" name="dueDay" type="number" min="1" max="28" defaultValue={house?.rentDueDay ?? ""} />
        <label htmlFor="leasingEmail">Leasing office email</label>
        <input id="leasingEmail" name="leasingEmail" type="email" defaultValue={house?.leasingEmail ?? ""} />
        <span />
        <button style={{ justifySelf: "start" }}>Save settings</button>
      </form>
    </main>
  );
}
