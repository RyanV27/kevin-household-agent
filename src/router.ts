// P0 · Sudhersan. Plain code decides whether Kevin speaks; every message is logged either way.
import type { IncomingMessage, Outgoing } from "@/channels/types";
import { householdForTelegramChat, linkTelegram } from "@/services/members";
import { logMessage, recentChatter } from "@/services/chatlog";
import { askKevin } from "@/agent/kevin";

export function shouldReply(msg: IncomingMessage): boolean {
  return !!(msg.isVoice || msg.isReplyToKevin || msg.mentionsKevin || /\bkevin\b/i.test(msg.text));
}

export async function handleIncoming(msg: IncomingMessage): Promise<Outgoing | null> {
  const house = await householdForTelegramChat(msg.chatId, msg.chatTitle);
  const member = await linkTelegram(house.id, msg.userId, msg.userName);
  await logMessage(house.id, member.id, msg.isVoice ? `(voice) ${msg.text}` : msg.text);
  if (!shouldReply(msg)) return null;

  const chatter = await recentChatter(house.id);
  const out = await askKevin(
    { householdId: house.id, actorId: member.id, source: "chat" },
    `${msg.isVoice ? `[voice note from ${member.name}]` : `[${member.name}]`} ${msg.text}`,
    chatter.slice(0, -1), // everything before this message
  );
  await logMessage(house.id, null, out.text);
  return out;
}
