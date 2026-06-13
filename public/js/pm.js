// Store PM history in memory
window._pmStore = window._pmStore || {};

function pmKey(a, b) {
  return [a, b].sort().join("::");
}

function openPrivateWindow(targetUsername) {
  const s = getSession();
  if (!s) {
    alert("Please login");
    return;
  }
  if (targetUsername === s.username) {
    alert("You cannot message yourself");
    return;
  }

  // Prevent duplicate windows
  if (document.getElementById("pmWindow_" + targetUsername)) return;

  const target = (window.users || []).find(u => u.username === targetUsername) || {
    username: targetUsername,
    display: targetUsername
  };

  const pm = document.createElement("div");
  pm.className = "pm-window";
  pm.id = "pmWindow_" + target.username;

  pm.innerHTML = `
    <div class="pm-header">
      <div style="display:flex;gap:8px;align-items:center">
        <div class="avatar" style="width:36px;height:36px">${target.display[0]}</div>
        <div>
          <div style="font-weight:700">${target.display}</div>
          <div class="small">@${target.username}</div>
        </div>
      </div>
      <button class="small-btn pm-close">X</button>
    </div>

    <div class="pm-body" id="pmBody_${target.username}"></div>

    <div class="pm-input">
      <input id="pmInput_${target.username}" type="text" placeholder="Message ${target.display}">
      <button class="small-btn" id="pmSend_${target.username}">Send</button>
    </div>
  `;

  document.body.appendChild(pm);

  // Close button
  pm.querySelector(".pm-close").addEventListener("click", () => {
    pm.remove();
  });

  // Send button
  document
    .getElementById("pmSend_" + target.username)
    .addEventListener("click", () => sendPM(target.username));

  // Enter key
  document
    .getElementById("pmInput_" + target.username)
    .addEventListener("keydown", e => {
      if (e.key === "Enter") sendPM(target.username);
    });

  renderPM(target.username);
}

function sendPM(targetUsername) {
  const s = getSession();
  if (!s) return;

  const input = document.getElementById("pmInput_" + targetUsername);
  const text = input.value.trim();
  if (!text) return;

  const message = {
    from: s.username,
    to: targetUsername,
    display: s.display,
    text
  };

  const key = pmKey(s.username, targetUsername);
  window._pmStore[key] = window._pmStore[key] || [];
  window._pmStore[key].push(message);

  socket.emit("privateMessage", message);

  input.value = "";
  renderPM(targetUsername);
}

function renderPM(targetUsername) {
  const s = getSession();
  if (!s) return;

  const key = pmKey(s.username, targetUsername);
  const body = document.getElementById("pmBody_" + targetUsername);
  if (!body) return;

  body.innerHTML = "";

  const msgs = window._pmStore[key] || [];

  msgs.forEach(m => {
    const div = document.createElement("div");
    div.className = "message " + (m.from === s.username ? "me" : "");
    div.innerHTML = `
      <div style="font-size:13px;font-weight:700">${m.display}</div>
      <div style="margin-top:6px">${escapeHtml(m.text)}</div>
    `;
    body.appendChild(div);
  });

  body.scrollTop = body.scrollHeight;
}
