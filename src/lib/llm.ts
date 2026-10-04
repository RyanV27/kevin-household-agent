// Neon AI Gateway is OpenAI-compatible, so one provider covers chat + speech-to-text.
// If the gateway lacks a model, point LLM_BASE_URL at the provider directly.
import { createOpenAI } from "@ai-sdk/openai";

export const gateway = createOpenAI({
  baseURL: process.env.LLM_BASE_URL,
  apiKey: process.env.LLM_API_KEY,
});

// .chat() = Chat Completions API, which gateways support (the default Responses API often isn't).
export const model = gateway.chat(process.env.LLM_MODEL ?? "claude-sonnet-5-5");
