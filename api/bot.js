import { createClient } from "@supabase/supabase-js";

const TELEGRAM_API = "https://api.telegram.org";

const WEBSITE_URL =
  "https://tributly.io/?utm_source=telegram&utm_medium=bot_user";

const ADVERTISER_URL =
  "https://tributly.io/?utm_source=telegram&utm_medium=bot_advertiser";

const LEAD_RECEIVER_CHAT_ID = "-1004427158558";
const LEAD_RECEIVER_THREAD_ID = 64;

const supabase = createClient(
  "https://ebinxxtajbucndwqfbgh.supabase.co",
  process.env.SUPABASE_KEY
);

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function saveUser(user) {
  if (!user) return;

  await supabase
    .from("users")
    .upsert(
      {
        telegram_id: user.id,
        username: user.username || null,
        first_name: user.first_name || null
      },
      { onConflict: "telegram_id" }
    );
}

const screens = {
  start: {
    text: `
👋 <b>Welcome to Tributly</b>

Turn your everyday browsing into rewards 🚀

Install the extension, browse normally, and earn from sponsored attention.

No extra tasks.
No changes to your habits.

<b>Your attention has value.</b>
    `.trim(),
    keyboard: [
      [{ text: "🚀 Start earning", url: WEBSITE_URL }],
      [
        { text: "💡 How it works", callback_data: "howitworks" },
        { text: "❓ FAQ", callback_data: "faq" }
      ],
      [{ text: "📢 Advertise", url: ADVERTISER_URL }]
    ]
  },

  joinuser: {
    text: `
🚀 <b>Start earning with Tributly</b>

Your account is ready.

1️⃣ Install the extension
2️⃣ Browse normally
3️⃣ Earn rewards from sponsored attention

Welcome to rewarded browsing.
    `.trim(),
    keyboard: [
      [{ text: "🚀 Open Tributly", url: WEBSITE_URL }],
      [{ text: "⬅️ Back", callback_data: "start" }]
    ]
  },

  howitworks: {
    text: `
💡 <b>How Tributly works</b>

1️⃣ Install the extension

2️⃣ Browse the web as usual

3️⃣ See sponsored messages inside your browser

4️⃣ Receive rewards from your attention

Simple. Transparent. User-controlled.
    `.trim(),
    keyboard: [
      [
        { text: "⬅️ Back", callback_data: "start" },
        { text: "❓ FAQ", callback_data: "faq" }
      ]
    ]
  },

  faq: {
    text: `
❓ <b>FAQ</b>

<b>♦️ What is Tributly?</b>
A browser extension that lets users earn rewards from sponsored attention.

<b>♦️ Is Tributly safe?</b>
Yes. We never ask for passwords and never sell personal data.

<b>♦️ Do you see my browsing history?</b>
No. We only verify rewarded ads.

<b>♦️ Supported browsers?</b>
Chrome and Edge are supported.
More browsers will be added over time.
    `.trim(),
    keyboard: [
      [
        { text: "⬅️ Back", callback_data: "start" },
        { text: "💡 How it works", callback_data: "howitworks" }
      ]
    ]
  },

  advertisers: {
    text: `
📢 <b>Advertise with Tributly</b>

Reach users inside their everyday browsing experience.

Create campaigns, set your budget, and connect with engaged users.
    `.trim(),
    keyboard: [
      [{ text: "🚀 Start advertising", url: ADVERTISER_URL }],
      [{ text: "⬅️ Back", callback_data: "start" }]
    ]
  }
};

async function telegramRequest(token, method, body) {
  const response = await fetch(
    `${TELEGRAM_API}/bot${token}/${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );

  const result = await response.json();

  if (!result.ok) {
    throw new Error(JSON.stringify(result));
  }

  return result;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("Tributly bot running");
  }

  try {
    const token = process.env.BOT_TOKEN;
    const update = req.body;

    const message = update?.message;
    const callbackQuery = update?.callback_query;

    if (!message && !callbackQuery)
      return res.status(200).send("ok");

    await saveUser(message?.from || callbackQuery?.from);

    const chatId =
      message?.chat?.id ||
      callbackQuery?.message?.chat?.id;

    const messageId =
      callbackQuery?.message?.message_id;

    const input =
      message?.text?.trim() ||
      callbackQuery?.data;

    let screenName = null;

    switch (input) {
      case "/start":
      case "start":
        screenName = "start";
        break;

      case "joinuser":
      case "/join":
        screenName = "joinuser";
        break;

      case "howitworks":
      case "/howitworks":
        screenName = "howitworks";
        break;

      case "faq":
      case "/faq":
        screenName = "faq";
        break;

      case "advertisers":
      case "/advertisers":
        screenName = "advertisers";
        break;
    }

    if (!screenName)
      return res.status(200).send("ok");

    const screen = screens[screenName];

    const payload = {
      chat_id: chatId,
      text: screen.text,
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
      reply_markup: {
        inline_keyboard: screen.keyboard
      }
    };

    if (callbackQuery) {
      await telegramRequest(token, "answerCallbackQuery", {
        callback_query_id: callbackQuery.id
      });

      await telegramRequest(token, "editMessageText", {
        ...payload,
        message_id: messageId
      });
    } else {
      await telegramRequest(token, "sendMessage", payload);
    }

    return res.status(200).send("ok");

  } catch (error) {
    console.error("BOT ERROR", error);
    return res.status(200).send("error");
  }
}
