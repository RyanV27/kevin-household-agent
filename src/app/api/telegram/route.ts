// Register once after deploy:
// curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook?url=$APP_URL/api/telegram&secret_token=$TELEGRAM_WEBHOOK_SECRET"
import { webhookCallback } from "grammy";
import { bot } from "@/channels/telegram";

export const runtime = "nodejs";

const handle = webhookCallback(bot(), "std/http", {
  secretToken: process.env.TELEGRAM_WEBHOOK_SECRET,
  timeoutMilliseconds: 55_000, // agent turns can take a while
  onTimeout: "return",
});

export const POST = (req: Request) => handle(req);
