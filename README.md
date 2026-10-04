# Kevin

Kevin is a roommate assistant that lives in the house group chat (Telegram) and on a dashboard. He splits bills, keeps the grocery cart, tracks chores, reminds about rent, and emails the leasing office from his own inbox. Persona: Kevin from Home Alone, left in charge of the house. "Nobody cheats Kevin."

Live: https://belikekevin.fly.dev. Demo walkthrough: [docs/DEMO.md](docs/DEMO.md). Architecture, conventions and ownership: [CLAUDE.md](CLAUDE.md).

## Stack

- **Next 16** dashboard (server components + server actions), deployed on **Fly** (one Machine, never sleeps)
- **Mastra** agent (`askKevin`) with tools; model via the **Neon AI Gateway** (`neon/<id>`), memory in Postgres
- **Neon Postgres** with **Drizzle**
- **grammY** Telegram bot: webhook in prod, long polling locally
- **OpenRouter** for voice notes (an audio-capable chat model transcribes; `STT_MODEL`)
- **AgentMail** for Kevin's inbox (leasing office email, shared inbox page)
- Simulated Instacart-style checkout ("Kevin's Market"); nothing is really bought

Both front doors (chat and dashboard) call the same `src/services/*` functions. That is the one rule.

## Local setup

```sh
git clone <repo> kevin && cd kevin
npm install
cp .env.example .env     # fill in the values below
npm run db:push          # create tables on Neon
npm run seed:demo        # Apt 4B with three weeks of history (or `npm run seed` for a bare house)
npm run dev              # dashboard at http://localhost:3000 (scheduler runs here too; DISABLE_SCHEDULER=1 to skip)
npm run poll             # Kevin in your Telegram group, locally (deletes the webhook; re-set it after, see Deploy)
```

Where each `.env` value comes from:

| Variable | Source |
| --- | --- |
| `DATABASE_URL` | Neon Console -> branch -> Connect (pooled connection string, `sslmode=require`) |
| `NEON_AI_GATEWAY_BASE_URL`, `NEON_AI_GATEWAY_TOKEN` | Neon Console -> branch -> Connect -> "AI Gateway" tab. Base URL is the bare host (no `/v1`); the token is the gateway credential from "Reveal credential" (scope `ai_gateway:invoke`), not a `napi_` API key |
| `LLM_MODEL` | An id from the branch catalog: `curl "$NEON_AI_GATEWAY_BASE_URL/v1/models" -H "Authorization: Bearer $NEON_AI_GATEWAY_TOKEN"` (default `claude-sonnet-5`) |
| `OPENROUTER_API_KEY`, `STT_MODEL` | openrouter.ai -> Keys; `STT_MODEL` is any audio-capable chat model (default `google/gemini-2.5-flash`) |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME` | @BotFather -> /newbot. Then /setprivacy -> Disable so Kevin sees every group message |
| `TELEGRAM_WEBHOOK_SECRET` | Any string of `A-Z a-z 0-9 _ -` (1-256 chars); sent by Telegram with every webhook call |
| `AGENTMAIL_API_KEY`, `AGENTMAIL_INBOX` | agentmail.to -> API key; create an inbox and use its address. The leasing office address is set per house in the dashboard (Roommates -> House settings) |
| `APP_URL` | Public URL of the app (`https://belikekevin.fly.dev`); webhook target and the base for the buttons in Kevin's replies |
| `TELEGRAM_CHAT_ID` (seed only) | Your group's chat id (`-100...`); binds the seeded house to the group so Kevin can post unprompted |

## Tests

```sh
npm run typecheck     # tsc --noEmit (must pass before every commit)
npm test              # unit tests for the pure service functions, no .env needed
npm run test:tools    # every Kevin tool against the real dev DB in a throwaway household, no LLM
npm run kevin:smoke   # the demo utterances through the real agent; writes rows to the first household
```

## Deploy

```sh
fly launch --no-deploy                         # once
fly secrets set DATABASE_URL=... NEON_AI_GATEWAY_BASE_URL=... NEON_AI_GATEWAY_TOKEN=... LLM_MODEL=... \
  OPENROUTER_API_KEY=... STT_MODEL=... TELEGRAM_BOT_TOKEN=... TELEGRAM_BOT_USERNAME=... TELEGRAM_WEBHOOK_SECRET=... \
  AGENTMAIL_API_KEY=... AGENTMAIL_INBOX=... APP_URL=https://belikekevin.fly.dev
fly deploy --ha=false                          # one Machine: the scheduler runs in-process and must not run twice
npm run telegram:webhook                       # setWebhook -> $APP_URL/api/telegram; prints getWebhookInfo
```

`npm run telegram:webhook -- --delete` removes the webhook (needed before `npm run poll` locally; poll also does it for you). `.github/workflows/fly-deploy.yml` deploys on push once `FLY_API_TOKEN` is a repo secret.

## Layout (short)

```
src/services/   business logic, source of truth (money, cart, chores, reminders, leasing, upkeep, report)
src/agent/      askKevin + one tool file per module
src/channels/   Telegram (grammY)      src/router.ts   decides when Kevin replies
src/app/        dashboard pages + api/{telegram,chat,agentmail}
src/jobs/       60 s scheduler         scripts/        seed, poll, smoke, webhook
```
