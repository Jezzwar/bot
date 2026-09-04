import { createClient } from "@supabase/supabase-js";

const TELEGRAM_API = "https://api.telegram.org";

const WEBSITE_URL =
  "https://tributly.io/?utm_source=telegram&utm_medium=paid&utm_campaign=telegram_ads";

const ADVERTISER_URL =
  "https://tributly.io/?utm_source=telegram&utm_medium=paid&utm_campaign=telegram_ads";



const LEAD_RECEIVER_CHAT_ID = "-1004427158558";
const LEAD_RECEIVER_THREAD_ID = 64;

const SUPABASE_URL = "https://ebinxxtajbucndwqfbgh.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Supabase environment variables missing");
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function saveUser(user){

  if(!user){
    return;
  }

  const { error } = await supabase
    .from("users")
    .upsert(
      {
        telegram_id: user.id,
        username: user.username || null,
        first_name: user.first_name || null
      },
      {
        onConflict: "telegram_id"
      }
    );

  if(error){
    console.error(
      "SUPABASE ERROR:",
      error
    );
  }

}


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

Tributly is live 🚀

Turn your attention into rewards while browsing normally.

Install the extension, browse as usual, and earn from the value of your attention.

Join thousands of early users building the future of rewarded browsing.
`.trim(),

    keyboard: [
      [
        {
          text: "👤 Become a User",
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
          url: ADVERTISER_URL
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
📢 ⚠️ <b>Advertiser launch is coming</b>

📢 <b>Advertise with Tributly</b>

Tributly is live 🚀

Reach users inside their everyday browsing experience.

Create your campaign, set your budget, and start reaching engaged users.
`.trim(),

    keyboard: [
      [
        {
          text: "🚀 Start advertising",
          url: ADVERTISER_URL
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
  
joinuser: {
  text: `
⚠️ <b>Tributly is almost ready</b>

The extension is currently in Chrome and Edge store review.

Until approval, it cannot be installed yet - and installation is the only thing standing between you and earning rewards.

Everything else is already running:
• Your account system
• Reward tracking
• Advertiser campaigns
• The platform infrastructure

Once the extension is approved, you can install it, browse normally and start earning from your attention.

We start September 4th. See you soon!

🚀 Be one of the first users when we launch.
  `.trim(),

  keyboard: [
    [
      {
        text: "🚀 Create user account",
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
},

joinuser: {
  text: `
⚠️ <b>Tributly is almost ready</b>

The extension is currently under Chrome and Edge store review.

Until approval, it cannot be installed yet - and installation is the only step before you can start earning rewards.

Everything else is already running:
• Account system
• Reward tracking
• Advertiser campaigns
• Platform infrastructure

Once the extension is approved, you can install it, browse normally and start earning.

We start September 4th. See you soon!

🚀 Join early and be among the first users.
  `.trim(),

  keyboard: [
    [
      {
        text: "🔥 Get Early Access",
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
          text: "🚀 Become a user",
          callback_data: "joinuser"
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
    if(message || callbackQuery){

    if(message || callbackQuery){

  try {

    await saveUser(
      message?.from ||
      callbackQuery?.from
    );

  } catch(error){

    console.error(
      "SAVE USER ERROR:",
      error
    );

  }

}
}

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
// STOP BROADCAST
// =====================================================

if (message?.text === "/stop") {

  const adminId = 724797169;

  if (chatId != adminId) {
    return res.status(200).send("ok");
  }


  await supabase
    .from("broadcast_control")
    .update({
      is_running: false
    })
    .eq("id", 1);


  await telegramRequest(
    token,
    "sendMessage",
    {
      chat_id: chatId,
      text: "🛑 Рассылка остановлена"
    }
  );


  return res.status(200).send("stopped");
}

   // =====================================================
// BROADCAST
// =====================================================

if (message?.text?.startsWith("/broadcast")) {

  const adminId = 724797169; 


  if (chatId != adminId) {
    return res.status(200).send("ok");
  }


  const text = message.text
    .replace("/broadcast", "")
    .trim();


  if (!text) {

    await telegramRequest(
      token,
      "sendMessage",
      {
        chat_id: chatId,
        text: "❌ Напиши текст после /broadcast"
      }
    );

    return res.status(200).send("ok");
  }

  const { error: controlError } = await supabase
  .from("broadcast_control")
  .update({
    is_running: true
  })
  .eq("id", 1);

if (controlError) {
  console.error("START ERROR:", controlError);
  return res.status(200).send("control error");
}


  const { data: users, error } = await supabase
    .from("users")
    .select("telegram_id");


  if (error) {
    console.error(error);
    return res.status(200).send("database error");
  }


  const BATCH_SIZE = 100;

  let sent = 0;
  let failed = 0;

  
  for (
    let i = 0;
    i < users.length;
    i += BATCH_SIZE
  ) {

  const { data: control } = await supabase
  .from("broadcast_control")
  .select("is_running")
  .eq("id",1)
  .single();





    const batch = users.slice(
      i,
      i + BATCH_SIZE
    );


    await Promise.all(
      batch.map(async (user)=>{

        try {

          await telegramRequest(
            token,
            "sendMessage",
            {
              chat_id: user.telegram_id,
              text: text,
              parse_mode: "HTML"
            }
          );


          sent++;


        } catch(error){

          console.error(
            "SEND ERROR:",
            user.telegram_id,
            error.message
          );

          failed++;

        }

      })
    );


    // пауза между пачками
    await new Promise(
      resolve => setTimeout(resolve,1500)
    );

  }
  
  await telegramRequest(
  token,
  "sendMessage",
  {
    chat_id: chatId,
    text:
      `✅ Рассылка завершена\n\n📨 Отправлено: ${sent}\n❌ Ошибок: ${failed}`
  }
);

  return res.status(200).send("broadcast done");
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

      case "/joinwaitlist":
      case "/joinbeta":
      case "joinuser":
        screenName = "joinuser";
        break;
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