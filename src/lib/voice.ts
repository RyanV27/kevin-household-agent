// P6 · Sudhersan. Telegram voice note -> transcript. Feed the result through the normal text path.
export async function transcribe(audio: ArrayBuffer, filename = "voice.ogg"): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([audio], { type: "audio/ogg" }), filename);
  form.append("model", process.env.STT_MODEL ?? "whisper-1");
  const res = await fetch(`${process.env.LLM_BASE_URL}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.LLM_API_KEY}` },
    body: form,
  });
  if (!res.ok) throw new Error(`transcription failed: ${res.status} ${await res.text()}`);
  const { text } = (await res.json()) as { text: string };
  return text;
}
