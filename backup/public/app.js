function showSiteNotice(title, desc, type) {
  var old = document.getElementById("siteNoticeToast");
  if (old) old.remove();
  var toast = document.createElement("div");
  toast.id = "siteNoticeToast";
  var borderCol = (type === "error") ? "rgba(239, 68, 68, 0.8)" : "rgba(245, 158, 11, 0.8)";
  var glowCol = (type === "error") ? "rgba(239, 68, 68, 0.25)" : "rgba(245, 158, 11, 0.25)";
  var icon = (type === "error") ? "⚠️" : "⚡";
  toast.style.cssText = "position:fixed; top:24px; left:50%; transform:translateX(-50%); width:90%; max-width:380px; background:rgba(15, 23, 42, 0.96); border:1.5px solid " + borderCol + "; border-radius:16px; padding:14px 16px; z-index:9999999; box-shadow:0 12px 35px " + glowCol + "; backdrop-filter:blur(12px); display:flex; align-items:flex-start; gap:12px; font-family:-apple-system, BlinkMacSystemFont, sans-serif; box-sizing:border-box;";
  toast.innerHTML = "<div style='font-size:22px; line-height:1;'>" + icon + "</div>" +
    "<div style='flex:1; text-align:left;'>" +
      "<div style='font-size:13px; font-weight:800; color:#fbbf24; text-transform:uppercase; letter-spacing:0.5px;'>" + title + "</div>" +
      "<div style='font-size:12px; color:#cbd5e1; line-height:1.4; margin-top:3px;'>" + desc + "</div>" +
    "</div>" +
    "<button id='btnCloseNotice' style='background:none; border:none; color:#94a3b8; font-size:22px; line-height:1; cursor:pointer; padding:0 4px; font-weight:bold;'>&times;</button>";
  document.body.appendChild(toast);
  document.getElementById("btnCloseNotice").onclick = function() { toast.remove(); };
  setTimeout(function() {
    if (document.getElementById("siteNoticeToast") === toast) toast.remove();
  }, 8000);
}


function showDeviceBlockModal() {
  const old = document.getElementById("deviceGuardModal");
  if (old) old.remove();

  const modal = document.createElement("div");
  modal.id = "deviceGuardModal";
  modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(2, 6, 23, 0.88); backdrop-filter:blur(12px); display:flex; align-items:center; justify-content:center; z-index:9999999; animation: fadeIn 0.2s ease;";
  modal.innerHTML = `
    <div style="background:linear-gradient(145deg, #0f172a, #020617); border:1.5px solid rgba(239, 68, 68, 0.4); border-radius:24px; padding:28px 22px; width:90%; max-width:360px; text-align:center; box-shadow:0 0 50px rgba(239, 68, 68, 0.25); color:#fff; font-family:-apple-system, BlinkMacSystemFont, sans-serif;">
      <div style="width:68px; height:68px; margin:0 auto 16px; background:rgba(239, 68, 68, 0.12); border:1px solid rgba(239, 68, 68, 0.3); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:32px; box-shadow:0 0 20px rgba(239, 68, 68, 0.2);">
        🛡️
      </div>
      <div style="font-size:18px; font-weight:900; letter-spacing:0.5px; color:#f87171; text-transform:uppercase;">Security Notice</div>
      <div style="font-size:13px; font-weight:700; color:#cbd5e1; margin-top:6px;">Multiple Accounts Prohibited</div>
      <p style="font-size:12px; line-height:1.6; color:#94a3b8; margin:14px 0 22px;">
        To ensure fair rewards, our system strictly allows only <b>1 Account per Device</b>. An existing account is already registered to this hardware.
      </p>
      <div style="background:rgba(255,255,255,0.03); border:1px dashed #334155; border-radius:12px; padding:10px; font-size:11px; color:#64748b; margin-bottom:20px;">
        🔒 Hardware Signature Locked
      </div>
            <button onclick="document.getElementById('deviceGuardModal').remove(); auth.signOut().then(function(){ window.signInWithGoogle(); });" style="width:100%; padding:14px; background:linear-gradient(135deg, #f59e0b, #d97706); border:none; border-radius:14px; font-size:13px; font-weight:800; color:#0f172a; cursor:pointer; text-transform:uppercase; letter-spacing:0.5px; box-shadow:0 4px 20px rgba(245, 158, 11, 0.35); margin-bottom:10px; display:flex; align-items:center; justify-content:center; gap:8px;">
        <span>🔄</span> Login With First Account
      </button>
      <button onclick="document.getElementById('deviceGuardModal').remove(); auth.signOut();" style="width:100%; padding:11px; background:transparent; border:1px solid rgba(239, 68, 68, 0.4); border-radius:12px; font-size:12px; font-weight:700; color:#f87171; cursor:pointer; text-transform:uppercase; letter-spacing:0.5px;">
        Sign Out & Close
      </button>
    </div>
  `;
  document.body.appendChild(modal);
}


// --- HARDWARE FINGERPRINTING (CROSS-BROWSER GUARD) ---
function getHardwareFingerprint() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    const debugInfo = gl ? gl.getExtension("WEBGL_debug_renderer_info") : null;
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "no-gl";

    const rawId = [
      screen.width + "x" + screen.height,
      screen.colorDepth,
      navigator.hardwareConcurrency || 4,
      renderer
    ].join("###");

    let hash = 0;
    for (let i = 0; i < rawId.length; i++) {
      hash = ((hash << 5) - hash) + rawId.charCodeAt(i);
      hash |= 0;
    }
    return "HW_" + Math.abs(hash);
  } catch(e) {
    return "HW_FALLBACK_" + screen.width + "x" + screen.height;
  }
}


// [Duplicate Removed: Native WebGL Hardware Guard Active]

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyD1eDObpqsBmeIDLtyffZFciVkXU8vdspo",
  authDomain: "watchandearn-com.firebaseapp.com",
  databaseURL: "https://watchandearn-com-default-rtdb.firebaseio.com",
  projectId: "watchandearn-com",
  storageBucket: "watchandearn-com.firebasestorage.app",
  messagingSenderId: "996933521379",
  appId: "1:996933521379:web:ce352dd0b5a8080e46dad6"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const rtdb = firebase.database();
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// State
var currentUser = null;
var currentUID = localStorage.getItem("we_uid") || "";
var userCoins = parseInt(localStorage.getItem("we_coins") || "200", 10);
var userSpins = parseInt(localStorage.getItem("we_spins") || "10", 10);
var selectedWithdrawAmount = 5;
var streakRewards = [50, 70, 100, 150, 170, 200, 300];
var currentActiveScreen = "home";

// --- PREVENT FLICKER ON REFRESH ---
if (localStorage.getItem("we_uid")) {
  document.getElementById("authGateOverlay").style.display = "none";
  document.getElementById("mainAppWrapper").style.display = "block";
} else {
  document.getElementById("authGateOverlay").style.display = "flex";
  document.getElementById("mainAppWrapper").style.display = "none";
}

// --- MOBILE BACK BUTTON HANDLER ---
window.history.replaceState({ screen: "home" }, "", "");

window.addEventListener("popstate", function(event) {
  if (event.state && event.state.screen) {
    navigateInternal(event.state.screen, false);
  } else {
    navigateInternal("home", false);
  }
});

function navigateInternal(screenName, push) {
  currentActiveScreen = screenName;
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  var target = document.getElementById("screen-" + screenName);
  if (target) target.classList.add("active");

  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  var navBtn = document.querySelector(`.nav-item[onclick*="'${screenName}'"]`);
  if (navBtn) navBtn.classList.add("active");

  if (push) {
    window.history.pushState({ screen: screenName }, "", "");
  }

  if (screenName === "spin") setTimeout(initWheelCanvas, 50);
  if (screenName === "history") renderHistory();
}

window.switchScreen = function(screenName) {
  if (screenName === currentActiveScreen) return;
  navigateInternal(screenName, true);
};

// --- AUTHENTICATION ---
window.signInWithGoogle = function() {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  auth.signInWithPopup(provider)
    .then(function(result) {
      handleUserSession(result.user);
    })
    .catch(function(error) {
      if (error && (error.code === "auth/cancelled-popup-request" || error.code === "auth/popup-closed-by-user")) {
        showSiteNotice("Sign-In Cancelled", "The login window was closed before finishing. You can tap continue whenever you are ready.", "info");
      } else {
        showSiteNotice("Authentication Error", "Unable to complete sign-in right now. Please check your connection and try again.", "error");
      }
    });
};

window.signOutUser = function() {
  auth.signOut().then(function() {
    localStorage.removeItem("we_uid");
    location.reload();
  });
};

function handleUserSession(user) {
  const deviceId = getHardwareFingerprint();
  const devRef = rtdb.ref("devices/" + deviceId);

  devRef.once("value").then(function(snap) {
    const boundUid = snap.val();
    if (boundUid && boundUid !== user.uid) {
      showDeviceBlockModal();
      auth.signOut();
      return;
    }

    if (!boundUid) {
      devRef.set(user.uid);
    }

    proceedUserSession(user);
  }).catch(function(err) {
    proceedUserSession(user);
  });
}

function proceedUserSession(user) {
  if (!user) return;
  currentUser = user;
  currentUID = user.uid.substring(0, 10);
  localStorage.setItem("we_uid", currentUID);

  document.getElementById("authGateOverlay").style.display = "none";
  document.getElementById("mainAppWrapper").style.display = "block";

  var uName = document.getElementById("userName");
  if (uName) uName.innerText = user.displayName || "Player";
  var uAvatar = document.getElementById("userAvatar");
  if (uAvatar) uAvatar.src = user.photoURL || "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg";

  // First Time Check -> Strict 200 Opening Coins
  var initKey = "we_init_" + user.uid;
  if (!localStorage.getItem(initKey)) {
    userCoins = 200;
    userSpins = 10;
    localStorage.setItem("we_coins", 200);
    localStorage.setItem("we_spins", 10);
    localStorage.setItem(initKey, "true");
  } else {
    userCoins = parseInt(localStorage.getItem("we_coins") || "200", 10);
    userSpins = parseInt(localStorage.getItem("we_spins") || "10", 10);
  }

  syncBalances();
  // syncToFirebaseCloud bypassed on initial load to prevent overwrite
  listenToLiveWithdrawals();
  listenToCloudUserData();
}

auth.onAuthStateChanged(function(user) {
  if (user) {
    handleUserSession(user);
  } else {
    currentUser = null;
    document.getElementById("authGateOverlay").style.display = "flex";
    document.getElementById("mainAppWrapper").style.display = "none";
  }
});

// --- LIVE WITHDRAWALS STATUS LISTENER (UPDATES LIVE WHEN BOT APPROVES/DECLINES) ---
function listenToLiveWithdrawals() {
  if (!currentUser) return;

  rtdb.ref("withdrawals/" + currentUser.uid).on("value", function(snap) {
    var cloudList = snap.val();
    if (!cloudList) return;

    var list = [];
    Object.keys(cloudList).forEach(function(k) {
      list.push(cloudList[k]);
    });
    list.sort((a, b) => b.timestamp - a.timestamp);

    // Save to LocalStorage
    localStorage.setItem("we_withdraw_list_" + currentUID, JSON.stringify(list));

    // Check if any status changed to Declined to auto refund locally
    list.forEach(function(item) {
      var refundedKey = "refunded_" + item.id;
      if (item.status === "Declined" && !localStorage.getItem(refundedKey)) {
        userCoins += (item.amount * 100);
        localStorage.setItem("we_coins", userCoins);
        localStorage.setItem(refundedKey, "true");
        syncBalances();
        showRewardModal("PAYOUT REFUNDED", "₹" + item.amount + " declined by admin & coins refunded!", (item.amount * 100));
      }
    });

    if (currentActiveScreen === "history") {
      renderHistory();
    }
  });
}

// --- REALTIME 2-WAY CLOUD BALANCE SYNC ---
function listenToCloudUserData() {
  if (!currentUser) return;
  rtdb.ref("users/" + currentUser.uid).on("value", function(snap) {
    var data = snap.val();
    if (data) {
      if (data.coins !== undefined) {
        userCoins = data.coins;
        localStorage.setItem("we_coins", userCoins);
      }
      if (data.spins !== undefined) {
        userSpins = data.spins;
        localStorage.setItem("we_spins", userSpins);
      }
      syncBalances();
    }
  });
}

function syncToFirebaseCloud() {
  if (currentUser) {
    rtdb.ref("users/" + currentUser.uid).update({
      uid: currentUID,
      email: currentUser.email,
      name: currentUser.displayName,
      coins: userCoins,
      spins: userSpins,
      lastActive: firebase.database.ServerValue.TIMESTAMP
    }).catch(function() {});
  }
}

function syncBalances() {
  var tCoins = document.getElementById("topCoinsDisplay");
  if (tCoins) tCoins.innerText = userCoins.toLocaleString();
  var hCoins = document.getElementById("homeCoinsDisplay");
  if (hCoins) hCoins.innerText = userCoins.toLocaleString() + " 🪙";
  var hUid = document.getElementById("homeUid");
  if (hUid) hUid.innerText = currentUID;
  var sNum = document.getElementById("spinsLeftNum");
  if (sNum) sNum.innerText = userSpins;

  var st = checkStreakStatus();
  var stText = document.getElementById("streakStatusText");
  if (stText) {
    if (st.canClaim) {
      stText.innerText = "Day " + st.day + ": Claim +" + st.reward + " Coins";
      stText.style.color = "#facc15";
    } else {
      stText.innerText = "Day " + st.day + " Claimed ✅ (Come back tomorrow)";
      stText.style.color = "#10b981";
    }
  }
}

function checkStreakStatus() {
  var lastDateStr = localStorage.getItem("we_streak_last_date_" + currentUID);
  var streakDay = parseInt(localStorage.getItem("we_streak_day_" + currentUID) || "0", 10);
  var todayStr = new Date().toDateString();

  if (!lastDateStr) return { day: 1, reward: streakRewards[0], canClaim: true };

  var lastDate = new Date(lastDateStr);
  var today = new Date(todayStr);
  var diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { day: streakDay, reward: streakRewards[streakDay - 1] || 50, canClaim: false };
  } else if (diffDays === 1) {
    var nextDay = (streakDay % 7) + 1;
    return { day: nextDay, reward: streakRewards[nextDay - 1], canClaim: true };
  } else {
    return { day: 1, reward: streakRewards[0], canClaim: true, broken: true };
  }
}

function showRewardModal(title, msg, coins) {
  var old = document.getElementById("rewardModal");
  if (old) old.remove();

  var modal = document.createElement("div");
  modal.id = "rewardModal";
  modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:999999;";
  modal.innerHTML = `
    <div style="background:linear-gradient(135deg, #1e1b4b, #0f172a); border:2px solid #facc15; border-radius:24px; padding:24px 20px; width:88%; max-width:340px; text-align:center; box-shadow:0 0 35px rgba(250,204,21,0.4);">
      <div style="font-size:38px; margin-bottom:6px;">🎉</div>
      <div style="font-size:18px; font-weight:900; color:#facc15;">${title}</div>
      <div style="font-size:30px; font-weight:900; color:#fff; margin:10px 0;">+${coins} <span style="color:#facc15; font-size:22px;">🪙</span></div>
      <div style="font-size:12px; color:#94a3b8; margin-bottom:18px;">${msg}</div>
      <button onclick="document.getElementById('rewardModal').remove()" style="width:100%; padding:14px; background:linear-gradient(135deg, #facc15, #eab308); border:none; border-radius:14px; font-size:14px; font-weight:800; color:#0f172a; cursor:pointer; text-transform:uppercase;">Collect</button>
    </div>
  `;
  document.body.appendChild(modal);
}

// Special Earnings Modal
window.openSpecialEarningsModal = function() {
  var old = document.getElementById("folderModal");
  if (old) old.remove();

  var tgClaimed = localStorage.getItem("task_tg_done_" + currentUID);
  var ytClaimed = localStorage.getItem("task_yt_done_" + currentUID);
  var refClaimed = localStorage.getItem("refer_code_used_" + currentUID);

  var modal = document.createElement("div");
  modal.id = "folderModal";
  modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:999999;";
  modal.innerHTML = `
    <div style="background:#0f172a; border:1px solid #334155; border-radius:24px; padding:20px; width:92%; max-width:380px; max-height:85vh; overflow-y:auto; box-shadow:0 10px 30px rgba(0,0,0,0.6);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div style="font-size:16px; font-weight:800; color:#facc15; display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-folder-open"></i> Special Earnings
        </div>
        <i class="fa-solid fa-xmark" style="font-size:20px; color:#94a3b8; cursor:pointer;" onclick="document.getElementById('folderModal').remove()"></i>
      </div>
      <p style="font-size:12px; color:#94a3b8; margin-bottom:14px;">Complete official tasks & invite friends to boost coins:</p>

      <div class="task-row">
        <div class="task-info">
          <div class="task-icon" style="background:rgba(14,165,233,0.15); color:#38bdf8;"><i class="fa-brands fa-telegram"></i></div>
          <div>
            <div style="font-size:13px; font-weight:700; color:#fff;">Telegram Channel</div>
            <div style="font-size:11px; color:#94a3b8;">${tgClaimed ? 'Claimed (+50 🪙)' : '+50 Coins Reward'}</div>
          </div>
        </div>
        <button class="btn-claim" onclick="handleSocialClick('tg', 'https://t.me/watch_and_earn_2')">
          ${tgClaimed ? 'Visit ↗' : 'Join +50 🪙'}
        </button>
      </div>

      <div class="task-row">
        <div class="task-info">
          <div class="task-icon" style="background:rgba(239,68,68,0.15); color:#ef4444;"><i class="fa-brands fa-youtube"></i></div>
          <div>
            <div style="font-size:13px; font-weight:700; color:#fff;">YouTube Channel</div>
            <div style="font-size:11px; color:#94a3b8;">${ytClaimed ? 'Claimed (+50 🪙)' : '+50 Coins Reward'}</div>
          </div>
        </div>
        <button class="btn-claim" onclick="handleSocialClick('yt', 'https://youtube.com/@watch_and_earn_official?si=nqk1mGAULrrv_7zJ')">
          ${ytClaimed ? 'Visit ↗' : 'Sub +50 🪙'}
        </button>
      </div>

      <hr style="border:0; border-top:1px solid #1e293b; margin:16px 0;">

      <div style="font-size:13px; font-weight:800; color:#a855f7; margin-bottom:6px; display:flex; align-items:center; gap:6px;">
        <i class="fa-solid fa-users"></i> Refer & Earn (+200 Coins)
      </div>
      <p style="font-size:11px; color:#94a3b8; margin-bottom:10px;">Share your code with friends. When they redeem it, you get <b>+200 Coins</b>!</p>

      <label style="font-size:11px; color:#94a3b8; font-weight:700;">YOUR REDEEM CODE:</label>
      <div style="display:flex; gap:8px; margin: 5px 0 12px;">
        <input type="text" id="modalMyReferCode" class="input-box" readonly value="${currentUID}" style="margin-bottom:0; font-weight:800; color:#facc15; text-align:center; padding:10px;">
        <button class="btn-claim" style="padding:0 16px; font-size:12px;" onclick="copyModalReferCode()"><i class="fa-solid fa-copy"></i> Copy</button>
      </div>

      <label style="font-size:11px; color:#94a3b8; font-weight:700;">HAVE A FRIEND'S CODE?</label>
      <div style="display:flex; gap:8px; margin-top:5px;">
        <input type="text" id="modalFriendCode" class="input-box" placeholder="Enter friend's code" style="margin-bottom:0; padding:10px;">
        <button class="btn-claim" ${refClaimed ? 'disabled style="opacity:0.5;"' : ''} onclick="applyModalReferralCode()">
          ${refClaimed ? 'Done ✅' : 'Redeem'}
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.handleSocialClick = function(type, url) {
  window.open(url, "_blank");
  var key = "task_" + type + "_done_" + currentUID;
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, "true");
    addCoins(50, type === "tg" ? "Telegram Join Bonus" : "YouTube Subscribe Bonus");
    showRewardModal("TASK COMPLETED!", "Bonus coins added to your wallet!", 50);
  }
};

window.copyModalReferCode = function() {
  var copyText = document.getElementById("modalMyReferCode");
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(copyText.value);
  showRewardModal("CODE COPIED!", "Share this code with friends to get +200 coins!", 0);
};

window.applyModalReferralCode = function() {
  var key = "refer_code_used_" + currentUID;
  if (localStorage.getItem(key)) {
    showRewardModal("Already Claimed", "You have already redeemed a code!", 0);
    return;
  }

  var code = document.getElementById("modalFriendCode").value.trim();
  if (!code) {
    showRewardModal("Enter Code", "Please enter a valid code.", 0);
    return;
  }
  if (code === currentUID) {
    showRewardModal("Invalid Code", "You cannot use your own referral code!", 0);
    return;
  }

  localStorage.setItem(key, code);
  addCoins(100, "Referral Welcome Bonus");
  showRewardModal("REDEEM SUCCESS!", "You received +100 bonus coins for using a friend's code!", 100);
};

// 7-Day Streak
window.openStreakModal = function() {
  var old = document.getElementById("streakModal");
  if (old) old.remove();

  var st = checkStreakStatus();

  var daysHtml = streakRewards.map((reward, i) => {
    var dayNum = i + 1;
    var isCurrent = (dayNum === st.day);
    var isCompleted = (dayNum < st.day) || (dayNum === st.day && !st.canClaim);
    var bg = isCurrent ? 'rgba(250,204,21,0.2)' : 'rgba(15,23,42,0.8)';
    var border = isCurrent ? '#facc15' : '#334155';
    var icon = isCompleted ? '✅' : (isCurrent ? '🔥' : '🪙');

    return `
      <div style="background:${bg}; border:1px solid ${border}; border-radius:12px; padding:10px; text-align:center; flex:1; min-width:65px;">
        <div style="font-size:11px; color:#94a3b8;">Day ${dayNum}</div>
        <div style="font-size:16px; margin:4px 0;">${icon}</div>
        <div style="font-size:12px; font-weight:800; color:#facc15;">+${reward}</div>
      </div>
    `;
  }).join("");

  var modal = document.createElement("div");
  modal.id = "streakModal";
  modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:999999;";
  modal.innerHTML = `
    <div style="background:#0f172a; border:1px solid #334155; border-radius:24px; padding:22px; width:92%; max-width:370px; box-shadow:0 10px 30px rgba(0,0,0,0.6);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div style="font-size:16px; font-weight:800; color:#facc15; display:flex; align-items:center; gap:8px;">
          🔥 7-Day Login Streak
        </div>
        <i class="fa-solid fa-xmark" style="font-size:20px; color:#94a3b8; cursor:pointer;" onclick="document.getElementById('streakModal').remove()"></i>
      </div>
      <p style="font-size:11px; color:#ef4444; margin-bottom:12px; background:rgba(239,68,68,0.1); padding:8px; border-radius:8px;">
        ⚠️ <b>Rule:</b> Log in daily from Monday to Sunday. If you miss a single day, streak breaks back to Day 1!
      </p>
      <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:18px;">
        ${daysHtml}
      </div>
      <button class="btn-primary" ${st.canClaim ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"'} onclick="claimDailyStreak()">
        ${st.canClaim ? `Claim Day ${st.day} (+${st.reward} Coins)` : 'Claimed For Today ✅'}
      </button>
    </div>
  `;
  document.body.appendChild(modal);
};

window.claimDailyStreak = function() {
  var st = checkStreakStatus();
  if (!st.canClaim) return;

  var todayStr = new Date().toDateString();
  localStorage.setItem("we_streak_last_date_" + currentUID, todayStr);
  localStorage.setItem("we_streak_day_" + currentUID, st.day);

  addCoins(st.reward, "Day " + st.day + " Streak Bonus");
  var sModal = document.getElementById("streakModal");
  if (sModal) sModal.remove();

  showRewardModal("STREAK CLAIMED!", "Logged in consecutively for Day " + st.day, st.reward);
};

// Lucky Wheel
var isSpinning = false;
var wheelAngle = 0;
var sectors = [
  { label: "10", value: 10, color: "#f97316" },
  { label: "20", value: 20, color: "#3b82f6" },
  { label: "15", value: 15, color: "#10b981" },
  { label: "50", value: 50, color: "#8b5cf6" },
  { label: "25", value: 25, color: "#eab308" },
  { label: "10", value: 10, color: "#06b6d4" },
  { label: "100", value: 100, color: "#ef4444" },
  { label: "30", value: 30, color: "#84cc16" }
];

function drawWheel(angle) {
  var canvas = document.getElementById("wheelCanvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  
  // Responsive fit inside wheel circle border
  canvas.width = 260;
  canvas.height = 260;
  
  var width = canvas.width;
  var height = canvas.height;
  var cx = width / 2;
  var cy = height / 2;
  var radius = (width / 2) - 8;

  ctx.clearRect(0, 0, width, height);

  var numSectors = sectors.length;
  var arc = (2 * Math.PI) / numSectors;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  for (var i = 0; i < numSectors; i++) {
    var startAngle = i * arc;
    var endAngle = startAngle + arc;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.fillStyle = sectors[i].color;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Reward Text
    ctx.save();
    ctx.rotate(startAngle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px -apple-system, sans-serif";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 4;
    ctx.fillText(sectors[i].label, radius - 16, 5);
    ctx.restore();
  }

  ctx.restore();

  // Center Knob
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
  ctx.fillStyle = "#fbbf24";
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function initWheelCanvas() {
  drawWheel(wheelAngle);
}

window.spinNow = function() {
  if (isSpinning) return;
  if (userSpins <= 0) {
    if (typeof showRewardModal === "function") {
      showRewardModal("Limit Reached", "Daily spins finished. Check back tomorrow!", 0);
    } else {
      alert("Daily spins finished. Check back tomorrow!");
    }
    return;
  }

  isSpinning = true;
  userSpins--;
  localStorage.setItem("we_spins", userSpins);
  if (typeof syncBalances === "function") syncBalances();
  if (typeof syncToFirebaseCloud === "function") syncToFirebaseCloud();

  var numSectors = sectors.length;
  var arc = (2 * Math.PI) / numSectors;

  // Random sector
  var winningIndex = Math.floor(Math.random() * numSectors);
  var winningSector = sectors[winningIndex];

  // Align to top marker
  var targetAngle = (3 * Math.PI / 2) - (winningIndex * arc + arc / 2);
  var extraRotations = (5 + Math.floor(Math.random() * 3)) * (2 * Math.PI);
  var finalAngle = wheelAngle + extraRotations + (targetAngle - (wheelAngle % (2 * Math.PI)));

  var startTime = performance.now();
  var duration = 3800;
  var startA = wheelAngle;

  function animate(now) {
    var elapsed = now - startTime;
    var progress = Math.min(elapsed / duration, 1);
    var ease = 1 - Math.pow(1 - progress, 3);
    wheelAngle = startA + (finalAngle - startA) * ease;
    drawWheel(wheelAngle);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      userCoins = (parseInt(userCoins, 10) || 0) + winningSector.value;
      localStorage.setItem("we_coins", userCoins);
      if (typeof syncBalances === "function") syncBalances();
      if (typeof syncToFirebaseCloud === "function") syncToFirebaseCloud();

      if (typeof showRewardModal === "function") {
        showRewardModal("CONGRATULATIONS!", "You won " + winningSector.value + " coins from Lucky Wheel!", winningSector.value);
      }
    }
  }

  requestAnimationFrame(animate);
};

function renderHistory() {
  var cBox = document.getElementById("historyCoinsBox");
  var cLogs = JSON.parse(localStorage.getItem("we_coin_logs_" + currentUID) || "[]");
  if (cLogs.length === 0) {
    cBox.innerHTML = '<div style="text-align:center; color:#64748b; padding:20px;">No rewards logged yet.</div>';
  } else {
    cBox.innerHTML = cLogs.map(c => `
      <div style="background:#0f172a; border:1px solid #1e293b; border-radius:12px; padding:12px; display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div>
          <div style="font-weight:700; color:#fff;">${c.title}</div>
          <div style="font-size:11px; color:#64748b;">${c.time}</div>
        </div>
        <div style="font-weight:800; color:#facc15;">+${c.coins} 🪙</div>
      </div>
    `).join("");
  }

  var wBox = document.getElementById("historyWithdrawBox");
  var wLogs = JSON.parse(localStorage.getItem("we_withdraw_list_" + currentUID) || "[]");
  if (wLogs.length === 0) {
    wBox.innerHTML = '<div style="text-align:center; color:#64748b; padding:20px;">No withdrawal records.</div>';
  } else {
    wBox.innerHTML = wLogs.map(w => {
      var badgeStyle = "";
      if (w.status === "Approved") {
        badgeStyle = "background:#10b98122; color:#10b981; border:1px solid #10b98144;";
      } else if (w.status === "Declined") {
        badgeStyle = "background:#ef444422; color:#ef4444; border:1px solid #ef444444;";
      } else {
        badgeStyle = "background:#f59e0b22; color:#f59e0b; border:1px solid #f59e0b44;";
      }

      return `
        <div style="background:#0f172a; border:1px solid #1e293b; border-radius:12px; padding:12px; display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div>
            <div style="font-weight:700; color:#fff;">₹${w.amount} via ${w.upi}</div>
            <div style="font-size:11px; color:#64748b;">${w.date}</div>
          </div>
          <div style="font-size:11px; font-weight:700; padding:4px 8px; border-radius:6px; ${badgeStyle}">
            ${w.status}
          </div>
        </div>
      `;
    }).join("");
  }
}

document.addEventListener("DOMContentLoaded", function() {
  initWheelCanvas();
});
