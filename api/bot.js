const TELEGRAM_API = "https://api.telegram.org";
const WEBSITE_URL = "https://tributly.io/?utm_source=telegram&utm_medium=paid&utm_campaign=telegram_ads";

const screens = {
  start: {
    text: `
👋 <b>Welcome to Tributly</b>

Your attention has value.

Earn rewards while browsing normally.

🚀 <b>Launching in August.</b>

Join the waitlist to stay updated:
${WEBSITE_URL}
`.trim(),
    keyboard: [
      [
        {
          text: "🚀 Join the waitlist",
          url: WEBSITE_URL
        }
      ],
      [
        {
          text: "💡 How it works",
          callback_data: "howitworks"
        },
        {
          text: "❓ FAQ",
          callback_data: "faq"
        }
      ]
    ]
  },

  howitworks: {
    text: `
💡 <b>How Tributly works</b>

1. Install the browser extension
2. Browse normally
3. See sponsored content
4. Receive rewards

No extra tasks. No changes to your habits.
`.trim(),
    keyboard: [
      [
        {
          text: "🚀 Join the waitlist",
          url: WEBSITE_URL
        }
      ],
      [
        {
          text: "⬅️ Back",
          callback_data: "start"
        },
        {
          text: "❓ FAQ",
          callback_data: "faq"
        }
      ]
    ]
  },

  faq: {
    text: `
❓ <b>FAQ</b>

<b>What is Tributly?</b>
Tributly rewards users for their online attention.

<b>Do I need to change how I browse?</b>
No. Browse as usual.

<b>Is this mining?</b>
No.

<b>When does Tributly launch?</b>
Tributly is launching in August.

Join the waitlist to stay updated.
`.trim(),
    keyboard: [
      [
        {
          text: "🚀 Join the waitlist",
          url: WEBSITE_URL
        }
      ],
      [
        {
          text: "⬅️ Back",
          callback_data: "start"
        },
        {
          text: "💡 How it works",
          callback_data: "howitworks"
        }
      ]
    ]
  },

  joinwaitlist: {
    text: `
🚀 <b>Join the Tributly waitlist</b>

Sign up to receive launch updates:

${WEBSITE_URL}
`.trim(),
    keyboard: [
      [
        {
          text: "🚀 Join the waitlist",
          url: WEBSITE_URL
        }
      ],
      [
        {
          text: "⬅️ Back",
          callback_data: "start"
        }
      ]
    ]
  }
};

async function telegramRequest(token, method, body) {
  const response = await fetch(
    `${TELEGRAM_API}/bot${token}/${method}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(
      `Telegram API error: ${JSON.stringify(result)}`
    );
  }

  return result;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("Tributly bot is running");
  }

  try {
    const token = process.env.BOT_TOKEN;

    if (!token) {
      throw new Error("BOT_TOKEN is not configured");
    }

    const update = req.body;
    const message = update?.message;
    const callbackQuery = update?.callback_query;

    if (!message && !callbackQuery) {
      return res.status(200).send("ok");
    }

    const chatId =
      message?.chat?.id ||
      callbackQuery?.message?.chat?.id;

    const messageId = callbackQuery?.message?.message_id;

    const input =
      message?.text?.trim() ||
      callbackQuery?.data;

    let screenName = null;

    switch (input) {
      case "/start":
      case "start":
        screenName = "start";
        break;

      case "/howitworks":
      case "howitworks":
        screenName = "howitworks";
        break;

      case "/faq":
      case "faq":
        screenName = "faq";
        break;

      case "/joinwaitlist":
      case "/joinbeta":
      case "joinwaitlist":
        screenName = "joinwaitlist";
        break;

      default:
        return res.status(200).send("ok");
    }

    const screen = screens[screenName];

    // Убирает индикатор загрузки после нажатия inline-кнопки.
    if (callbackQuery) {
      await telegramRequest(
        token,
        "answerCallbackQuery",
        {
          callback_query_id: callbackQuery.id
        }
      );
    }

    const payload = {
      chat_id: chatId,
      text: screen.text,
      parse_mode: "HTML",
      link_preview_options: {
        is_disabled: true
      },
      reply_markup: {
        inline_keyboard: screen.keyboard
      }
    };

    // При нажатии кнопки обновляем существующее сообщение,
    // чтобы бот не создавал кучу новых сообщений.
    if (callbackQuery && messageId) {
      await telegramRequest(
        token,
        "editMessageText",
        {
          ...payload,
          message_id: messageId
        }
      );
    } else {
      await telegramRequest(
        token,
        "sendMessage",
        payload
      );
    }

    return res.status(200).send("ok");
  } catch (error) {
    console.error("Tributly bot error:", error);

    // Telegram должен получить 200, иначе будет повторять webhook.
    return res.status(200).send("error");
  }
}