const axios = require('axios');
const https = require('https');

const BOT_TOKEN = "8439244872:AAEFE2ojvtm99hHloFlqNxA10AZiHUPFnJc";
const DB_URL = "https://watchandearn-com-default-rtdb.firebaseio.com";

let lastUpdateId = 0;

async function updateFirebaseWithdrawal(uid, reqId, status, refundCoins) {
  try {
    // 1. Update status directly in Firebase RTDB REST API
    await axios.patch(`${DB_URL}/withdrawals/${uid}/${reqId}.json`, {
      status: status,
      updatedAt: Date.now()
    });

    // 2. If declined, refund coins to user
    if (status === "Declined" && refundCoins > 0) {
      const userRes = await axios.get(`${DB_URL}/users/${uid}/coins.json`);
      const currentCoins = userRes.data || 0;
      await axios.put(`${DB_URL}/users/${uid}/coins.json`, currentCoins + refundCoins);
    }
    console.log(`[UPDATED] ${reqId} -> ${status}`);
  } catch (err) {
    console.error("RTDB update error:", err.message);
  }
}

async function pollTelegramUpdates() {
  try {
    const res = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=20`);
    if (res.data && res.data.result) {
      for (const update of res.data.result) {
        lastUpdateId = update.update_id;

        if (update.callback_query) {
          const query = update.callback_query;
          const data = query.data; // e.g. "approve_W1234_uid_5"
          const parts = data.split('_');
          const action = parts[0];
          const reqId = parts[1];
          const uid = parts[2];
          const amount = parseInt(parts[3] || "5", 10);

          let replyNotice = "";
          if (action === "approve") {
            await updateFirebaseWithdrawal(uid, reqId, "Approved", 0);
            replyNotice = "✅ Approved & Payment Marked Successful!";
          } else if (action === "decline") {
            await updateFirebaseWithdrawal(uid, reqId, "Declined", amount * 100);
            replyNotice = `❌ Declined & ${amount * 100} Coins Refunded!`;
          }

          // Answer Telegram Callback
          await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
            callback_query_id: query.id,
            text: replyNotice
          });

          // Update Telegram Message Text to lock buttons
          await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            text: query.message.text + `\n\n📌 *ACTION:* ${replyNotice}`,
            parse_mode: "Markdown"
          });
        }
      }
    }
  } catch (err) {
    // Network idle
  }
  setTimeout(pollTelegramUpdates, 1500);
}

console.log("Telegram Bot Listener Started...");
pollTelegramUpdates();
