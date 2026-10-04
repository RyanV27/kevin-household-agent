// P0 · implemented. Every group message is logged so Kevin knows what happened between mentions.
import { and, desc, eq, gt } from "drizzle-orm";
import { db, schema } from "@/db";

const { chatLog, members } = schema;

export async function logMessage(householdId: string, memberId: string | null, text: string) {
  await db.insert(chatLog).values({ householdId, memberId, text });
}

/** Recent group chatter as "[Name] text" lines, oldest first. */
export async function recentChatter(householdId: string, sinceMinutes = 120, limit = 30): Promise<string[]> {
  const since = new Date(Date.now() - sinceMinutes * 60_000);
  const rows = await db
    .select({ text: chatLog.text, name: members.name })
    .from(chatLog)
    .leftJoin(members, eq(chatLog.memberId, members.id))
    .where(and(eq(chatLog.householdId, householdId), gt(chatLog.createdAt, since)))
    .orderBy(desc(chatLog.createdAt))
    .limit(limit);
  return rows.reverse().map((r) => `[${r.name ?? "Kevin"}] ${r.text}`);
}
