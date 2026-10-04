# Kevin

Kevin is a roommate assistant that lives in the house group chat (Telegram first) and a dashboard. He splits bills, keeps the grocery cart, tracks chores, reminds about rent, and emails the leasing office. Persona: Kevin from Home Alone, left in charge of the house. Brief, cheeky, never mean. "Nobody cheats Kevin."

Hackathon build: deadline 4:30 PM, feature freeze 3:30 PM. Ship small, working slices. Full plan: `plans/kevin-build-plan.md`.

## The one rule

**All business logic lives in `src/services/`.** Kevin's tools (`src/agent/tools/`) and the dashboard (`src/app/`) are thin front doors that call the same service functions. Anything you can do in chat must be doable in the UI, and vice versa. Never put logic in a tool or a page that belongs in a service.

## Layout

```
src/
  db/schema.ts          Drizzle tables (shared contract; tell the other person before changing)
  db/index.ts           db client
  services/             (ctx: Ctx, input) => result. Source of truth. index.ts re-exports as namespaces.
    types.ts            Ctx { householdId, actorId, source }, dollars()
    members.ts chatlog.ts            implemented (P0)
    money.ts cart.ts chores.ts reminders.ts leasing.ts upkeep.ts report.ts   stubs: signatures fixed, bodies TODO
  agent/kevin.ts        askKevin(ctx, text, chatter) -> { text, buttons }. Mastra Agent built per request.
  agent/tools/*.ts      one file per module; createTool -> service call. index.ts merges them.
  channels/types.ts     IncomingMessage, Outgoing, Channel { send(householdId, msg) }
  channels/telegram.ts  grammY bot + telegram.send()
  router.ts             logs every message, decides if Kevin replies, calls askKevin
  lib/llm.ts            OpenAI-compatible provider (Neon AI Gateway)
  lib/voice.ts          speech-to-text
  lib/instacart.ts lib/agentmail.ts   integration clients (stubs)
  lib/dashboard.ts      dashboardCtx(): first household + "actor" cookie member
  jobs/scheduler.ts     60 s tick: due reminders -> telegram.send
  instrumentation.ts    starts the scheduler once
  app/                  dashboard pages + api/{telegram,chat,agentmail}
scripts/poll.ts         local dev: Telegram long polling
scripts/seed.ts         demo house "Apt 4B"
```

## Ownership

- **Ryan:** `src/services/*`, `src/db/*`, `src/app/**` pages, `app/api/agentmail`, `scripts/seed.ts`.
- **Sudhersan:** `src/agent/**`, `src/channels/**`, `src/router.ts`, `src/lib/{llm,voice,instacart,agentmail}.ts`, `src/jobs/**`, `app/api/{telegram,chat}`.
- `TODO(Name, P#)` comments mark who fills what. Grep `TODO(` to see what's left.
- Service **signatures** are the contract. Change a body freely; change a signature only together with its tool.

## Conventions

- Money is **integer cents** everywhere in services and the DB. Tools accept dollars from the model and convert with `toCents()`. The LLM never does math: balances, splits and totals come from services.
- Every service takes `ctx: Ctx` first. `ctx.actorId` is the sender in chat or the selected member in the UI; use it as the default payer/doer/adder.
- Tools resolve names to ids with `memberIdByName()` and throw a helpful error on unknown names (the model then asks).
- Tools attach buttons via the `outbox` (see `cart_checkout`), not by pasting URLs.
- Dashboard pattern: see `app/members/page.tsx`. Server components read services; server actions write then `revalidatePath`. Pages are `force-dynamic`.
- Keep Kevin's replies to 1 to 3 short lines.

## Library notes (versions in package-lock)

- **Mastra v1:** `createTool({ id, description, inputSchema, execute: async (input, context) => ... })`. The first arg is the parsed input, not `{ context }`. Agent needs `id`. Memory call: `agent.generate(text, { memory: { thread, resource } })`.
- **LLM:** `gateway.chat(model)` (Chat Completions), because OpenAI-compatible gateways often lack the Responses API.
- **grammY:** webhook via `webhookCallback(bot, "std/http")` in `app/api/telegram`. Locally use `npm run poll` (it deletes the webhook; re-set it after).
- **Next 16:** Mastra and pg are in `serverExternalPackages`.

## Commands

```
npm install
cp .env.example .env          # fill DATABASE_URL, LLM_*, TELEGRAM_*
npm run db:push               # create tables on Neon
TELEGRAM_CHAT_ID=-100... npm run seed
npm run poll                  # Kevin in your group, locally
npm run dev                   # dashboard at localhost:3000 (scheduler runs here too; DISABLE_SCHEDULER=1 to skip)
npm run typecheck && npm test
```

Deploy: `fly launch --no-deploy` (once), `fly secrets set ...` for every var in `.env.example`, `fly deploy`, then set the Telegram webhook (command at the top of `app/api/telegram/route.ts`). Deploy after every priority.

## Before you commit

`npm run typecheck` must pass. Test a service with a quick `tsx` script or a `*.test.ts` before wiring its tool or page. Commit to `main` in small pieces.
