const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// Custom Alert Queue & Device Guard Script
const injectedLogic = `
<script>
// --- 1. SEQUENTIAL NOTIFICATION QUEUE (ONE BY ONE) ---
const alertQueue = [];
let isAlertDisplaying = false;

window.showCustomAlert = function(message, type = 'info') {
  alertQueue.push({ message, type });
  processAlertQueue();
};

function processAlertQueue() {
  if (isAlertDisplaying || alertQueue.length === 0) return;
  isAlertDisplaying = true;
  const item = alertQueue.shift();

  let toast = document.getElementById('app-toast-box');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast-box';
    toast.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:999999; background:#1e293b; color:#fff; padding:12px 20px; border-radius:10px; font-size:14px; font-weight:600; box-shadow:0 8px 24px rgba(0,0,0,0.4); border-left:4px solid #f59e0b; transition:all 0.3s ease; text-align:center; min-width:280px; max-width:90%;';
    document.body.appendChild(toast);
  }

  if (item.type === 'success') toast.style.borderLeftColor = '#10b981';
  else if (item.type === 'error') toast.style.borderLeftColor = '#ef4444';
  else toast.style.borderLeftColor = '#f59e0b';

  toast.innerText = item.message;
  toast.style.display = 'block';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.style.display = 'none';
      isAlertDisplaying = false;
      processAlertQueue(); // Show next alert in line
    }, 350);
  }, 2500);
};

// --- 2. HARDWARE DEVICE LOCK GUARD ---
function checkDeviceBinding(user) {
  let devId = localStorage.getItem('watch_earn_device_id');
  if (!devId) {
    devId = 'DEV_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('watch_earn_device_id', devId);
  }

  if (window.firebase && firebase.database) {
    const userRef = firebase.database().ref('users/' + user.uid);
    userRef.once('value').then(snap => {
      const data = snap.val() || {};
      if (data.lockedDeviceId && data.lockedDeviceId !== devId) {
        window.showCustomAlert('Security Alert: This account is locked to another mobile device!', 'error');
        setTimeout(() => { firebase.auth().signOut(); location.reload(); }, 3000);
      } else if (!data.lockedDeviceId) {
        userRef.update({ lockedDeviceId: devId });
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.firebase && firebase.auth) {
    firebase.auth().onAuthStateChanged(user => {
      if (user) checkDeviceBinding(user);
    });
  }
});
</script>
`;

// Insert before closing body
if (!html.includes('app-toast-box')) {
  html = html.replace('</body>', injectedLogic + '\n</body>');
  fs.writeFileSync('public/index.html', html);
  console.log('Features injected successfully into original 66KB file!');
} else {
  console.log('Features already present.');
}
