// Smoke test: the full router -> Kevin path (DB, members, chat log, memory, tools) without Telegram.
// npx tsx --env-file=.env scripts/smoke-agent.ts
// Uses its own throwaway household ("Smoke test") so it never claims real members of the demo house.
import { handleIncoming } from "../src/router";
import type { IncomingMessage } from "../src/channels/types";

const base: Omit<IncomingMessage, "text"> = {
  channel: "telegram",
  chatId: "smoke-test-chat",
  chatTitle: "Smoke test",
  userId: "smoke-user-1",
  userName: "Tester",
};

for (const text of [
  "hey all, I'm making pasta tonight", // logged only, Kevin stays quiet
  "kevin who lives here?", // should call list_members
  "kevin what did I say I'm cooking?", // memory / chatter recall
]) {
  const out = await handleIncoming({ ...base, text });
  console.log(`> ${text}\n${out ? `Kevin: ${out.text}` : "(no reply)"}\n`);
}
process.exit(0);
