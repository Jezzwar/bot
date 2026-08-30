const TELEGRAM_API = "https://api.telegram.org";

const WEBSITE_URL =
  "https://tributly.io/?utm_source=telegram&utm_medium=paid&utm_campaign=telegram_ads";

const ADVERTISER_URL =
  "https://tributly.io/?utm_source=telegram&utm_medium=paid&utm_campaign=telegram_ads";

const ADVERTISER_URL_2 =
  "https://beta.tributly.io/?panel=advertise";

const LEAD_RECEIVER_CHAT_ID = "-1004427158558";
const LEAD_RECEIVER_THREAD_ID = 64;



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

🚀 <b>Launching September 4th.</b>

Join the waitlist to stay updated.
`.trim(),

    keyboard: [
      [
        {
          text: "🗓️ Join the waitlist",
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

• Install the browser extension
• Browse normally
• See a small sponsor line inside your browser
• Receive rewards

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

<b>♦️What is Tributly?</b>
A free browser extension that rewards you with a share of the ad revenue your attention generates.

<b>♦️Is Tributly legit?</b>
Yes. Tributly is a registered company. We never charge you or ask for your password.

<b>♦️Does Tributly see my browsing history?</b>
No. We only verify ads and rewards. We never see your browsing history or page content.

<b>♦️Do you sell my data?</b>
No. Your data is never sold.

<b>♦️Which browsers are supported?</b>
Chrome and Edge are supported. Firefox and Safari are coming soon.
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
          text: "🚀 Start advertising",
          callback_data: "joinadvertiser"
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
          text: "💬 Chat to manager",
          url: "https://t.me/cactus_bod"
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
  
  joinadvertiser: {
  text: `
⚠️ <b>Advertiser launch is coming</b>

Tributly goes live on September 4th.

Before launch, advertisers can already prepare:
• Create an advertiser account
• Set up your first campaign
• Choose your bid and budget
• Add funds to your balance

Ads will start running only after launch, when the first users are online.

💳 No charges before September 4th.
You only pay when your ad is actually displayed.

💰 Your balance never expires.
Unused funds can be refunded anytime.

Be ready before the first impressions become available.
  `.trim(),

  keyboard: [
    [
      {
        text: "🚀 Create advertiser account",
        url: ADVERTISER_URL_2
      }
    ],
    [
      {
        text: "⬅️ Back",
        callback_data: "advertisers"
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

    const token =
      process.env.BOT_TOKEN;


    if (!token) {
      throw new Error(
        "BOT_TOKEN is not configured"
      );
    }


    const update =
      req.body;


    console.log(
      "TELEGRAM UPDATE:",
      JSON.stringify(update, null, 2)
    );


    const message =
      update?.message;

    const callbackQuery =
      update?.callback_query;


    if (!message && !callbackQuery) {
      return res
        .status(200)
        .send("ok");
    }


    const chatId =
      message?.chat?.id ||
      callbackQuery?.message?.chat?.id;


    const chatType =
      message?.chat?.type ||
      callbackQuery?.message?.chat?.type;


    const chatTitle =
      message?.chat?.title ||
      callbackQuery?.message?.chat?.title ||
      "";


    const messageId =
      callbackQuery?.message?.message_id;


    const input =
      message?.text?.trim() ||
      callbackQuery?.data;



    // =====================================================
    // /chatid
    // =====================================================

    if (
      message?.text &&
      (
        message.text === "/chatid" ||
        message.text.startsWith("/chatid@")
      )
    ) {

      const chatName =
        chatTitle
          ? escapeHtml(chatTitle)
          : "Private chat";


      await telegramRequest(
        token,
        "sendMessage",
        {
          chat_id:
            chatId,

          text: `
🆔 <b>Telegram Chat ID</b>

<b>Chat:</b> ${chatName}
<b>Type:</b> ${escapeHtml(chatType || "unknown")}
<b>ID:</b> <code>${chatId}</code>
`.trim(),

          parse_mode:
            "HTML"
        }
      );


      return res
        .status(200)
        .send("ok");
    }



    // =====================================================
    // ADVERTISER LEAD
    // =====================================================

    if (
      callbackQuery?.data ===
      "advertiser_lead"
    ) {

      const user =
        callbackQuery.from;


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


      const leadProfileUrl =
        user?.username
          ? `https://t.me/${user.username}`
          : `tg://user?id=${telegramId}`;


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


      await telegramRequest(
        token,
        "sendMessage",
        {
          chat_id:
            LEAD_RECEIVER_CHAT_ID,

          message_thread_id:
            LEAD_RECEIVER_THREAD_ID,

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
                  text: "👤 Open lead profile",
                  url: leadProfileUrl
                }
              ]
            ]
          }
        }
      );


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

The team can contact you directly on Telegram.
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

    let screenName =
      null;


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

      case "joinadvertiser":
        screenName = "joinadvertiser";
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

    } else {

      await telegramRequest(
        token,
        "sendMessage",
        payload
      );

    }


    return res
      .status(200)
      .send("ok");


  } catch (error) {

    console.error(
      "Tributly bot error:",
      error
    );


    return res
      .status(200)
      .send("error");
  }
}