const TELEGRAM_API = "https://api.telegram.org";

const WEBSITE_URL =
  "https://tributly.io/?utm_source=telegram&utm_medium=paid&utm_campaign=telegram_ads";

const ADVERTISER_URL =
  "https://tributly.io/?utm_source=telegram&utm_medium=paid&utm_campaign=advertisers";

// =====================================================
// MANAGER
// =====================================================

const MANAGER_USERNAME = "cactus_bod";
const MANAGER_URL = `https://t.me/${MANAGER_USERNAME}`;
const MANAGER_CHAT_ID = "610260127";


// =====================================================
// HELPERS
// =====================================================

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


// =====================================================
// SCREENS
// =====================================================

const screens = {
  start: {
    text: `
👋 <b>Welcome to Tributly</b>

Your attention has value.

Earn rewards while browsing normally.

🚀 <b>Launching in August.</b>

Join the waitlist to stay updated:
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
      ],
      [
        {
          text: "📢 Advertise with Tributly",
          callback_data: "advertisers"
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


  advertisers: {
    text: `
📢 <b>Advertise with Tributly</b>

Reach people who spend their day online.

Promote your SaaS, AI tool, app or digital product through a new advertising layer built for desktop users.

💸 Flexible bidding
🌎 Audience targeting
📊 Track CTR, CPC and CPM

Choose how you'd like to get started:
`.trim(),

    keyboard: [
      [
        {
          text: "🚀 Join advertiser waitlist",
          url: ADVERTISER_URL
        }
      ],
      [
        {
          text: "👤 Share my Telegram profile",
          callback_data: "advertiser_lead"
        }
      ],
      [
        {
          text: "💬 Message a manager",
          url: MANAGER_URL
        }
      ],
      [
        {
          text: "⬅️ Back",
          callback_data: "start"
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


// =====================================================
// TELEGRAM API REQUEST
// =====================================================

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
      `Telegram API error (${method}): ${JSON.stringify(result)}`
    );
  }

  return result;
}


// =====================================================
// HANDLER
// =====================================================

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(200)
      .send("Tributly bot is running");
  }

  try {
    // BOT TOKEN берём из Vercel Environment Variables
    const token = process.env.BOT_TOKEN;

    if (!token) {
      throw new Error(
        "BOT_TOKEN is not configured"
      );
    }


    const update = req.body;

    const message =
      update?.message;

    const callbackQuery =
      update?.callback_query;


    // Игнорируем update, который нам не нужен
    if (!message && !callbackQuery) {
      return res
        .status(200)
        .send("ok");
    }


    const chatId =
      message?.chat?.id ||
      callbackQuery?.message?.chat?.id;


    const messageId =
      callbackQuery?.message?.message_id;


    const input =
      message?.text?.trim() ||
      callbackQuery?.data;



    // =====================================================
    // ADVERTISER LEAD
    // =====================================================

    if (
      callbackQuery?.data ===
      "advertiser_lead"
    ) {
      const user =
        callbackQuery.from;


      // Убираем загрузку с Telegram-кнопки
      await telegramRequest(
        token,
        "answerCallbackQuery",
        {
          callback_query_id:
            callbackQuery.id,

          text:
            "Sending your profile…"
        }
      );


      // =====================================================
      // USER DATA
      // =====================================================

      const firstName =
        escapeHtml(
          user?.first_name || ""
        );


      const lastName =
        escapeHtml(
          user?.last_name || ""
        );


      const fullName =
        [
          firstName,
          lastName
        ]
          .filter(Boolean)
          .join(" ") ||
        "Unknown";


      const username =
        user?.username
          ? `@${escapeHtml(user.username)}`
          : "No username";


      const telegramId =
        user?.id;


      const language =
        user?.language_code
          ? escapeHtml(
              user.language_code
            )
          : "Unknown";


      // Если username есть — открываем обычную ссылку.
      // Если username нет — используем Telegram user ID.
      const leadProfileUrl =
        user?.username
          ? `https://t.me/${user.username}`
          : `tg://user?id=${telegramId}`;


      // =====================================================
      // MESSAGE FOR MANAGER
      // =====================================================

      const leadText = `
🔥 <b>New advertiser lead</b>

👤 <b>Name:</b> ${fullName}
🔗 <b>Username:</b> ${username}
🆔 <b>Telegram ID:</b> <code>${telegramId}</code>
🌐 <b>Language:</b> ${language}

📢 <b>Source:</b> Tributly Telegram Bot
🎯 <b>Intent:</b> Advertising

The user shared their Telegram profile and requested contact from the Tributly team.
`.trim();


      // =====================================================
      // SEND LEAD TO MANAGER
      // =====================================================

      await telegramRequest(
        token,
        "sendMessage",
        {
          chat_id:
            MANAGER_CHAT_ID,

          text:
            leadText,

          parse_mode:
            "HTML",

          link_preview_options: {
            is_disabled: true
          },

          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "💬 Open lead profile",
                  url: leadProfileUrl
                }
              ]
            ]
          }
        }
      );


      // =====================================================
      // SUCCESS SCREEN FOR ADVERTISER
      // =====================================================

      await telegramRequest(
        token,
        "editMessageText",
        {
          chat_id:
            chatId,

          message_id:
            messageId,

          text: `
✅ <b>Profile sent</b>

Thanks! Your Telegram profile has been shared with the Tributly team.

A manager can now contact you directly on Telegram.

Want to talk right now?
`.trim(),

          parse_mode:
            "HTML",

          link_preview_options: {
            is_disabled: true
          },

          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "💬 Message a manager",
                  url: MANAGER_URL
                }
              ],
              [
                {
                  text: "🚀 Join advertiser waitlist",
                  url: ADVERTISER_URL
                }
              ],
              [
                {
                  text: "⬅️ Back",
                  callback_data: "advertisers"
                }
              ]
            ]
          }
        }
      );


      return res
        .status(200)
        .send("ok");
    }



    // =====================================================
    // NORMAL BOT SCREENS
    // =====================================================

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


      case "/advertisers":
      case "advertisers":
        screenName = "advertisers";
        break;


      case "/joinwaitlist":
      case "/joinbeta":
      case "joinwaitlist":
        screenName = "joinwaitlist";
        break;


      default:
        return res
          .status(200)
          .send("ok");
    }


    const screen =
      screens[screenName];


    // Убираем индикатор загрузки с inline-кнопки
    if (callbackQuery) {
      await telegramRequest(
        token,
        "answerCallbackQuery",
        {
          callback_query_id:
            callbackQuery.id
        }
      );
    }


    const payload = {
      chat_id:
        chatId,

      text:
        screen.text,

      parse_mode:
        "HTML",

      link_preview_options: {
        is_disabled: true
      },

      reply_markup: {
        inline_keyboard:
          screen.keyboard
      }
    };


    // =====================================================
    // EDIT EXISTING MESSAGE
    // =====================================================

    if (
      callbackQuery &&
      messageId
    ) {
      await telegramRequest(
        token,
        "editMessageText",
        {
          ...payload,

          message_id:
            messageId
        }
      );
    }

    // =====================================================
    // SEND NEW MESSAGE
    // =====================================================

    else {
      await telegramRequest(
        token,
        "sendMessage",
        payload
      );
    }


    return res
      .status(200)
      .send("ok");
  }

  catch (error) {
    console.error(
      "Tributly bot error:",
      error
    );


    // Возвращаем 200, чтобы Telegram
    // не повторял один и тот же webhook update
    return res
      .status(200)
      .send("error");
  }
}