// P5 · Sudhersan. Thin AgentMail client: send from Kevin's inbox; inbound arrives at /api/agentmail.
export async function sendEmail(input: { from: string; to: string; subject: string; text: string; threadId?: string }): Promise<{ threadId: string | null }> {
  // TODO(Sudhersan, P5): use the agentmail SDK (npm i agentmail), reply in-thread when threadId is set
  return { threadId: null };
}
