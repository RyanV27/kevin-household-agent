import { listMembers } from "@/services/members";
import type { Ctx } from "@/services/types";

export const toCents = (dollars: number) => Math.round(dollars * 100);

/** Case-insensitive first-name match. Unknown names throw so the model can ask. */
export async function memberIdByName(ctx: Ctx, name: string): Promise<string> {
  const people = await listMembers(ctx);
  const hit = people.find((p) => p.name.toLowerCase().startsWith(name.trim().toLowerCase()));
  if (!hit) throw new Error(`No roommate named "${name}". Roommates: ${people.map((p) => p.name).join(", ")}`);
  return hit.id;
}
