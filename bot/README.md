# TaskPilot Telegram Bot 🤖

Connect your **TaskPilot** workspace directly to Telegram to view and create tasks in real-time synced with your Supabase database.

---

## ⚡ Quick Setup in 3 Minutes

### 1. Create your Telegram Bot
1. Open Telegram and search for **[@BotFather](https://t.me/BotFather)**.
2. Send `/newbot`.
3. Give your bot a display name (e.g. `My TaskPilot`) and a username ending in `bot` (e.g. `MyTaskPilot_bot`).
4. Copy the **HTTP API Bot Token** provided by BotFather (looks like `7123456789:AAH...`).

### 2. Add the token to `.env.local`
Open your `e:/taskpilot/taskpilot/.env.local` file and add:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here

# (Optional but recommended) Your Telegram user ID or username to restrict bot access:
# TELEGRAM_ALLOWED_USERS=your_telegram_username,123456789
```

> **Tip to find your Telegram User ID**: Message **[@userinfobot](https://t.me/userinfobot)** on Telegram.

### 3. Run the Bot
In your terminal, simply execute:
```bash
npm run bot
```

That's it! Your bot is live and connected directly to your TaskPilot Supabase database.

---

## 💬 Available Commands

| Command | Description | Example |
| :--- | :--- | :--- |
| `/tasks` | List all active board tasks (`TODO`, `IN_PROGRESS`) | `/tasks` |
| `/backlog` | List all backlog items | `/backlog` |
| `/task <details>` | Create a new task on the Board | `/task Deploy staging environment #urgent #hourly` |
| `/backlog_add <details>` | Create a task directly into the Backlog | `/backlog_add Explore migration to Vite 6` |
| `/<task-details>` | **Quick creation:** Any command not matching a system command is treated as a task! | `/Fix checkout button crash #q1` |
| `/done <number>` | Mark any task as DONE by number | `/done 0101` or `/done 101` |
| `/help` | Display command guide and tags | `/help` |

---

## 🏷️ Smart Tags & Details Parsing

You can add priority, cadence, or multi-line descriptions directly in Telegram:

### Priority Quadrants:
- `#q1` or `#urgent #important` ➔ **Q1: Urgent & Important**
- `#q2` or `#important` ➔ **Q2: Important (Default)**
- `#q3` or `#urgent` ➔ **Q3: Urgent**
- `#q4` or `#low` ➔ **Q4: Low Priority**

### Cadence / Due Schedule:
- `#hourly` or `#1h` ➔ Hourly (+1 hour due)
- `#daily` or `#24h` ➔ Daily (Due tonight at 23:59) *(Default)*
- `#weekly` or `#7d` ➔ Weekly (+7 days due)

### Multi-line Support:
```text
/task Upgrade database connection pool #urgent
We noticed connection timeouts during load spike.
Need to increase max pool size to 20 in config.
```
- Line 1 becomes the **Task Title**.
- Lines 2+ become the **Description**.

---

## ☁️ Running 24/7 (Optional)

If you want the bot running continuously even when your local machine is off:
- **PM2 (Background process on local/VPS):**
  ```bash
  npm install -g pm2
  pm2 start bot/telegramBot.mjs --name "taskpilot-bot" --node-args="--env-file=.env.local"
  ```
- **Free Cloud Worker (Railway / Render / Fly.io):**
  Deploy as a background worker with start command:
  `node bot/telegramBot.mjs`
  and set environment variables: `TELEGRAM_BOT_TOKEN`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
