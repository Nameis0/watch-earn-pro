const https = require('https');

// మీ వివరాలు ఇక్కడ ఎంటర్ చేయండి
const BOT_TOKEN = "YOUR_BOT_TOKEN";
const FIREBASE_DB_URL = "https://watchandearn-com-default-rtdb.firebaseio.com";

let lastUpdateId = 0;

function pollBot() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`;
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.ok && json.result.length > 0) {
          json.result.forEach(update => {
            lastUpdateId = update.update_id;
            if (update.callback_query) {
              handleAction(update.callback_query);
            }
          });
        }
      } catch (e) {}
      setTimeout(pollBot, 1000);
    });
  }).on('error', () => setTimeout(pollBot, 5000));
}

function handleAction(cq) {
  const [action, uid, histKey, coins] = cq.data.split(':');
  const chatId = cq.message.chat.id;
  const messageId = cq.message.message_id;

  if (action === 'APPROVE') {
    const path = `/users/${uid}/history/${histKey}/status.json`;
    sendFirebasePut(path, "SUCCESS", () => {
      editTelegramMessage(chatId, messageId, cq.message.text + "\n\n✅ *Status: APPROVED*");
    });
  } else if (action === 'REJECT') {
    const path = `/users/${uid}/history/${histKey}/status.json`;
    sendFirebasePut(path, "REFUNDED", () => {
      // రీఫండ్ కాయిన్స్
      https.get(`${FIREBASE_DB_URL}/users/${uid}/balance.json`, res => {
        let balData = '';
        res.on('data', d => balData += d);
        res.on('end', () => {
          let currentBal = parseInt(balData) || 0;
          let newBal = currentBal + parseInt(coins);
          sendFirebasePut(`/users/${uid}/balance.json`, newBal, () => {
            editTelegramMessage(chatId, messageId, cq.message.text + "\n\n❌ *Status: REJECTED & REFUNDED*");
          });
        });
      });
    });
  }
}

function sendFirebasePut(path, value, cb) {
  const payload = JSON.stringify(value);
  const req = https.request(`${FIREBASE_DB_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Content-Length': payload.length }
  }, cb);
  req.write(payload);
  req.end();
}

function editTelegramMessage(chatId, messageId, text) {
  const payload = JSON.stringify({
    chat_id: chatId,
    message_id: messageId,
    text: text,
    parse_mode: 'Markdown'
  });
  const req = https.request({
    hostname: 'api.telegram.org',
    path: `/bot${BOT_TOKEN}/editMessageText`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': payload.length }
  });
  req.write(payload);
  req.end();
}

console.log("Status Listener Bot Started...");
pollBot();
