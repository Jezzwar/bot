export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("Tributly bot is running");
  }

  try {
    const update = req.body;

    if (!update?.message) {
      return res.status(200).send("ok");
    }

    const chatId = update.message.chat.id;
    const text = update.message.text;

    let reply = "";

    if (text === "/start") {
      reply = `
👋 Welcome to Tributly

Your attention has value.

Tributly helps you earn rewards while browsing normally.

We are preparing our beta launch.

Choose an option:
`;
    }

    if (text === "/howitworks") {
      reply = `
💡 How Tributly works:

1. Install the browser extension
2. Browse normally
3. See sponsored content
4. Receive rewards

No extra tasks. No changes to your habits.
`;
    }

    if (text === "/faq") {
      reply = `
❓ FAQ

Q: What is Tributly?
A: Tributly rewards users for their online attention.

Q: Do I need to change how I browse?
A: No.

Q: Is this mining?
A: No.

Q: When does beta start?
A: Join the waitlist to get updates.
`;
    }

    if (text === "/joinbeta") {
      reply = `
🚀 Join Tributly Beta

Get early access:

https://tributly.io
`;
    }

    if (!reply) {
      return res.status(200).send("ok");
    }

    const response = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply
        })
      }
    );

    const result = await response.json();

    console.log("Telegram:", result);

    return res.status(200).send("ok");

  } catch (error) {
    console.error(error);
    return res.status(200).send("error");
  }
}