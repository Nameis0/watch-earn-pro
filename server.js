const https = require("https");

const BOT_TOKEN = "8439244872:AAEFE2ojvtm99hHloFlqNxA10AZiHUPFnJc";
const FIREBASE_DB_URL = "https://watchandearn-com-default-rtdb.firebaseio.com";
let offset = 0;

function telegramApi(method, data) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(data);
    const req = https.request({
      hostname: "api.telegram.org",
      path: "/bot" + BOT_TOKEN + "/" + method,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(body)); } catch(e) { resolve({}); }
      });
    });
    req.on("error", () => resolve({}));
    req.write(postData);
    req.end();
  });
}

function updateFirebaseStatus(uid, reqId, status) {
  return new Promise((resolve) => {
    const bodyStr = JSON.stringify({ status: status });
    const u = new URL(FIREBASE_DB_URL + "/withdrawals/" + uid + "/" + reqId + ".json");
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(bodyStr)
      }
    }, () => resolve());
    req.on("error", () => resolve());
    req.write(bodyStr);
    req.end();
  });
}

async function handleUpdate(update) {
  if (!update.callback_query) return;
  const cq = update.callback_query;
  const actionData = cq.data || "";

  await telegramApi("answerCallbackQuery", { callback_query_id: cq.id, text: "Updating..." });

  const parts = actionData.split("_");
  const action = parts[0];
  const reqId = parts[1];
  const uid = parts[2];

  if (action === "approve") {
    await updateFirebaseStatus(uid, reqId, "Approved");

    await telegramApi("editMessageText", {
      chat_id: cq.message.chat.id,
      message_id: cq.message.message_id,
      text: cq.message.text + "\n\n✅ *Status: APPROVED & PAID (Completed)*",
      parse_mode: "Markdown"
    });
    console.log("Successfully Marked as PAID for req:", reqId);
  } else if (action === "decline") {
    await updateFirebaseStatus(uid, reqId, "Declined");

    await telegramApi("editMessageText", {
      chat_id: cq.message.chat.id,
      message_id: cq.message.message_id,
      text: cq.message.text + "\n\n❌ *Status: DECLINED*",
      parse_mode: "Markdown"
    });
    console.log("Successfully Marked as DECLINED for req:", reqId);
  }
}

async function startPolling() {
  console.log("Bot active! Polling for Approve/Decline clicks...");
  while (true) {
    try {
      const res = await telegramApi("getUpdates", { offset: offset, timeout: 25 });
      if (res.ok && res.result && res.result.length > 0) {
        for (const update of res.result) {
          offset = update.update_id + 1;
          await handleUpdate(update);
        }
      }
    } catch(err) {
      console.log("Error:", err.message);
    }
  }
}

startPolling();
