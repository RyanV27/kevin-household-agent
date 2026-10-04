# Kevin — demo walkthrough

For the presenter. Everything below is said in the Telegram group "Apt 4B" and shown on the dashboard at https://belikekevin.fly.dev. Budget: about 6 minutes talking, 2 minutes slack.

## The pitch (one paragraph)

Kevin is a shared household assistant that joins your group chat. Roommates already talk about money, groceries, chores and the broken sink in the chat; Kevin is the roommate who writes it all down. Say "Kevin, I paid $60 for internet" and it is split; "add chips for me" and it is in the cart with a price; "the sink is leaking, tell the leasing office" and an email goes out from Kevin's own inbox, with the reply posted back to the group. The same data shows up on a dashboard, and Kevin pipes up on his own for rent day, overdue chores and the Sunday report. Persona: Kevin from Home Alone, left in charge of the house. Brief, cheeky, never mean.

## Setup once (dashboard, before the demo)

Open the dashboard and walk through the tabs quickly; this is the "it was already configured" story.

| Tab | What it holds | Say |
| --- | --- | --- |
| Roommates | Who lives here + House settings: house name, rent ($/month) and due day (1-28), leasing office email, Kevin's inbox address | "Three roommates, rent $2,400 on the 1st. Saving rent here creates the monthly rent reminder." |
| Inbox | Kevin's AgentMail mailbox with the leasing office; everyone sees the same threads and the unread badge in the nav | "Kevin has his own email address. The whole house shares the inbox." |
| Upkeep | Recurring upkeep (HVAC filter every 90 days, smoke alarms, dryer vent, coffee maker, fire extinguisher); one click seeds the defaults | "The adult stuff nobody remembers. Kevin nags at 9 AM when one is overdue." |
| Chores | The chart with cadence, whose turn, and the Hall of Shame | "Dishes daily, trash every 3 days, bathroom weekly." |

Also on every page: the "Acting as" picker (top right) is who the dashboard acts as, and the Ask Kevin panel sends the same agent the same messages as Telegram.

## Live script (Telegram)

Kevin replies when a message says "kevin", mentions @kevin_apt4b_bot, replies to one of his messages, or is a voice note. Everything else is logged silently as context for him. Say the lines exactly; after each one, switch to the dashboard tab in the last column (pages are dynamic; a reload shows the new state).

| # | Say in Telegram | What Kevin does | Tool | Show |
| --- | --- | --- | --- | --- |
| 1 | **Kevin, add 3 bags of chips for me** | Adds "chips, 3 bags" to the cart under your name; reply carries 🛒 View cart / Checkout buttons | `cart_add` | **/cart**: items grouped by who added them, price estimates from the built-in catalog |
| 1b | *(tap Checkout, or open /cart/checkout)* | "Kevin's Market — simulated, nothing is really bought". Click **Place order (simulated)**: one expense is logged, split by who added what | dashboard action (`cart.markPurchased`) | **/cart/checkout**, then **/money**: the grocery expense with its per-person split |
| 2 | **Kevin, I paid $60 for internet** | Logs a $60 expense, you as payer, split evenly three ways ($20 each) | `log_expense` | **/money**: expense list, balances move |
| 3 | **Kevin, who owes what?** | Reads balances and the minimal settle-up plan; answers in dollars (the LLM never does the math, the service does) | `get_balances` | **/money**: "Who pays whom" matches his answer |
| 4 | **Kevin, I did the dishes** | Fuzzy-matches "dishes" to the chart, logs it for you, reports the streak | `log_chore` | **/chores**: Dishes shows "today", whose-turn rotates, Hall of Shame reorders |
| 5 | **Kevin, remind everyone trash goes out Tuesday 8pm** | Resolves "Tuesday 8pm" in America/Chicago, stores a one-off reminder for the whole group | `set_reminder` | **/reminders**: the row with its due time |
| 6 | **Kevin, the kitchen sink is leaking, tell the leasing office** | Emails the leasing office from Kevin's inbox: subject "Work order: kitchen sink is leaking", location kitchen; reply carries a 📬 Open inbox button | `create_work_order` | **/inbox**: the outbound thread |
| 7 | **Kevin, check the work order** | Reads the leasing threads and reports the latest status / what the office said; 📬 Open inbox button again | `leasing_status` | **/inbox**: open the thread (opening marks it read for everyone) |
| 8 | 🎤 *voice note:* **"Kevin, I took out the trash"** | Transcribes the note via OpenRouter (`STT_MODEL`), then handles it exactly like text | STT, then `log_chore` | **/chores**: trash logged, Hall of Shame moves again |
| 9 | **Kevin, what's the report?** | Posts the full Kevin Report: who pays whom, chores, Hall of Shame, upcoming reminders, upkeep | `kevin_report` | **/** (Home): the same report as cards |

Timing: lines 2, 3, 4 and 9 are the money shots; if you are short on time drop 1b and 7.

If the leasing office has replied before step 7 (reply from the leasing address yourself during setup), Kevin will already have posted it to the group with an "Open inbox" button; point at that message instead of asking.

## Things that happen on their own

The scheduler ticks every 60 seconds inside the Fly app (one Machine, never sleeps).

- **Rent reminder**: monthly on the due day from House settings, at 14:00 UTC (morning US). Created or refreshed whenever settings are saved. Text: "Rent $2,400.00 due today. Pay up."
- **Any reminder you set**: delivered when due, in Kevin's voice ("don't make me come over there").
- **Weekly Kevin Report**: Sunday 18:00–18:59 America/Chicago, once a week.
- **Upkeep nudge**: daily 09:00–09:59 America/Chicago, only if something is overdue ("Somebody adult today.").
- **Leasing reply notification**: the scheduler polls Kevin's AgentMail inbox every minute and posts new leasing-office messages to the group with a 📬 Open inbox button (the AgentMail webhook at `/api/agentmail` does the same when configured).

To show one live, set a reminder two minutes out: "Kevin, remind me to check the oven in 2 minutes".

## Pre-demo checklist

1. `npm run seed:demo` against the production `DATABASE_URL` (three weeks of history into Apt 4B: expenses, chore logs, cart, emails). Run once; it is what makes the Hall of Shame and balances non-empty.
2. Fly secrets set for every var in `.env.example`: `fly secrets list` should show DATABASE_URL, NEON_AI_GATEWAY_BASE_URL, NEON_AI_GATEWAY_TOKEN, LLM_MODEL, OPENROUTER_API_KEY, STT_MODEL, TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME, TELEGRAM_WEBHOOK_SECRET, AGENTMAIL_API_KEY, AGENTMAIL_INBOX, APP_URL.
3. Webhook set: `npm run telegram:webhook`. The printout must show `url: https://belikekevin.fly.dev/api/telegram` and no `last_error_message`. (Anyone who ran `npm run poll` locally deleted it; re-run.)
4. Bot is in the group with privacy mode off (@BotFather -> /setprivacy -> Disable), and the group's chat id is bound to Apt 4B (`TELEGRAM_CHAT_ID` at seed time, or `households.telegram_chat_id`). Without the binding Kevin still answers but cannot post unprompted.
5. House settings filled: rent + due day, leasing office email (an address you control, so you can reply during the demo), Kevin's inbox address.
6. Smoke it: say "Kevin, who lives here?" in the group; expect three names in under 10 s.
7. Open the dashboard tabs in order in separate browser tabs: Home, Money, Cart, Chores, Reminders, Inbox. Set "Acting as" to the presenter's roommate.
8. Phone (Telegram) on the screen next to the browser; mute other chats.
9. Optional dry run: `npm run kevin:smoke` runs the same utterances through the agent and prints the replies. It writes real rows, so run it before `seed:demo` or not at all on the demo house.

## Fallback if the LLM is slow or down

The dashboard uses the same services with no model in the loop, so every step has a click equivalent:

| Step | Dashboard-only |
| --- | --- |
| Cart | /cart: add "chips, 3 bags" in the form; Checkout -> Place order (simulated) |
| Expense | /money: Add expense $60 "internet", payer you, split all |
| Who owes what | /money: balances + "Who pays whom" (Mark paid settles a transfer) |
| Chore | /chores: "I did it" next to Dishes |
| Reminder | /reminders: text + datetime, "Everyone" |
| Work order | /inbox: Work order form (issue, location, urgency) |
| Report | / (Home) |

Narrate it as "the chat and the dashboard are two front doors to the same service layer". If only one Telegram turn is slow (the webhook handler gives up at 55 s), wait for that reply, then move to the dashboard; do not re-send the line or it will be processed twice.

## How it's built

```
 Telegram group --webhook /api/telegram--> channels/telegram.ts --> router.ts
   |   voice note --> lib/voice.ts (OpenRouter chat model, STT_MODEL, input_audio) --> text
   |                                        (log every message; reply if "kevin" / @bot / reply-to-Kevin / voice)
   |                                                                |
 Dashboard (Next 16) --Ask Kevin /api/chat-------------------------> agent/kevin.ts  askKevin(ctx, text)
   |   pages + server actions                                        Mastra Agent, model "neon/<id>" via the
   |                                                                 Neon AI Gateway; memory in Postgres
   |                                                                |  tools (agent/tools/*)
   |                                                                v
   +--------------------------------------------------------------> services/*  money cart chores reminders
                                                                                leasing upkeep report
                                                                                |
                                                                                v
                                                                     Neon Postgres (Drizzle)

 jobs/scheduler.ts  60 s tick, in-process on Fly: due reminders (incl. rent), Sunday report,
                    9 AM upkeep nudge, AgentMail inbox poll -> leasing replies into the group
 lib/agentmail.ts   Kevin's inbox: send work orders, read threads; /api/agentmail receives webhooks
 Buttons in chat (View cart / Checkout / Open inbox) link to APP_URL pages.
```

One rule: all business logic lives in `src/services/`; tools and pages are thin front doors. Anything you can do in chat you can do in the UI, and vice versa.
