// P5 · Ryan. AgentMail inbound webhook -> store -> summary into the group.
import { handleInboundEmail } from "@/services/leasing";
import { telegram } from "@/channels/telegram";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const payload = await req.json();
  // TODO(Ryan, P5): map AgentMail's webhook payload (message.received) to InboundEmail; verify the signature
  const msg = payload?.message ?? {};
  // AgentMail stamps the message; pass it through so the stored row carries the mail's own time (lets the poll recognise it).
  const ts = msg.timestamp ?? msg.received_at ?? msg.created_at ?? payload?.timestamp;
  const parsed = ts ? new Date(ts) : undefined;
  const receivedAt = parsed && !Number.isNaN(parsed.getTime()) ? parsed : undefined;
  const res = await handleInboundEmail({
    from: msg.from ?? "",
    to: msg.to?.[0] ?? "",
    subject: msg.subject ?? "",
    text: msg.text ?? "",
    threadId: msg.thread_id,
    receivedAt,
  });
  if (res) await telegram.send(res.householdId, { text: `📬 Leasing office: ${res.summary}` });
  return Response.json({ ok: true });
}
