// P5 · Ryan. AgentMail inbound webhook -> store -> summary into the group.
import { handleInboundEmail } from "@/services/leasing";
import { telegram } from "@/channels/telegram";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const payload = await req.json();
  // TODO(Ryan, P5): map AgentMail's webhook payload (message.received) to InboundEmail; verify the signature
  const res = await handleInboundEmail({
    from: payload?.message?.from ?? "",
    to: payload?.message?.to?.[0] ?? "",
    subject: payload?.message?.subject ?? "",
    text: payload?.message?.text ?? "",
    threadId: payload?.message?.thread_id,
  });
  if (res) await telegram.send(res.householdId, { text: `📬 Leasing office: ${res.summary}` });
  return Response.json({ ok: true });
}
