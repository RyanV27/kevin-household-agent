// Demo data: Apt 4B, 3 roommates, rent $2,400 on the 1st, a few chores. Extend per module.
import { db, schema } from "../src/db";

const [house] = await db
  .insert(schema.households)
  .values({ name: "Apt 4B", telegramChatId: process.env.TELEGRAM_CHAT_ID, rentCents: 240_000, rentDueDay: 1, leasingEmail: "leasing@example.com" })
  .returning();
await db.insert(schema.members).values([
  { householdId: house.id, name: "Sudhersan" },
  { householdId: house.id, name: "Ryan" },
  { householdId: house.id, name: "Alex" },
]);
await db.insert(schema.chores).values([
  { householdId: house.id, name: "Clean bathroom", everyDays: 7 },
  { householdId: house.id, name: "Take out trash", everyDays: 3 },
  { householdId: house.id, name: "Dishes", everyDays: 1 },
]);
console.log("seeded", house.id, process.env.TELEGRAM_CHAT_ID ? "" : "(set TELEGRAM_CHAT_ID to bind your group)");
process.exit(0);
