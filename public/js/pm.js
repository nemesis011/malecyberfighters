/* ============================================================
   SERVER-SYNCED DM SYSTEM (MongoDB + Translation)
============================================================ */

async function loadDMHistory(a, b) {
  const res = await fetch("/api/dm/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ a, b })
  });

  const data = await res.json();
  return data.messages || [];
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

  // If window already exists → bring it forward + clear unread
  if (document.getElementById("pmWindow_" + targetUsername)) {
    clearUnread(targetUsername);
    if (window.updateDMListSidebar) updateDMListSidebar();
    return;
  }
const typing = document.createElement("div");
typing.id = "pmTyping_" + targetUsername;
typing.className = "small muted";
typing.style.display = "none";
typing.textContent = `${targetUsername} is typing...`;

pm.querySelector(".pm-body").appendChild(typing);

   let typingTimeout;

document
  .getElementById("pmInput_" + targetUsername)
  .addEventListener("input", () => {
    socket.emit("typingDM", {
      from: s.username,
      to: targetUsername
    });

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("stopTypingDM", {
        from: s.username,
        to: targetUsername
      });
    }, 1200);
  });

  const pm = document.createElement("div");
  pm.className = "pm-window";
  pm.id = "pmWindow_" + targetUsername;

  pm.innerHTML = `
    <div class="pm-header">
      <div style="display:flex;gap:8px;align-items:center">
        <div class="avatar" style="width:36px;height:36px">${targetUsername[0].toUpperCase()}</div>
        <div>
          <div style="font-weight:700">${targetUsername}</div>
          <div class="small">@${targetUsername}</div>
        </div>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <button class="small-btn pm-clear">Clear</button>
        <button class="small-btn pm-close">X</button>
      </div>
    </div>

    <div class="pm-body" id="pmBody_${targetUsername}"></div>

    <div class="pm-input">
      <input id="pmInput_${targetUsername}" type="text" placeholder="Message ${targetUsername}">
      <button class="small-btn" id="pmSend_${targetUsername}">Send</button>
    </div>
  `;

  document.body.appendChild(pm);

  // Close window
  pm.querySelector(".pm-close").addEventListener("click", () => {
    pm.remove();
  });

  // Clear history (server + UI)
  pm.querySelector(".pm-clear").addEventListener("click", async () => {
    if (!confirm("Clear this DM history?")) return;

    await fetch("/api/dm/clear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a: s.username, b: targetUsername })
    });

    clearUnread(targetUsername);
    renderPMHistory(targetUsername, []);
    if (window.updateDMListSidebar) updateDMListSidebar();
  });

  // Send message
  document
    .getElementById("pmSend_" + targetUsername)
    .addEventListener("click", () => sendPM(targetUsername));

  document
    .getElementById("pmInput_" + targetUsername)
    .addEventListener("keydown", e => {
      if (e.key === "Enter") sendPM(targetUsername);
    });

  // Load history from server
  loadDMHistory(s.username, targetUsername).then(history => {
    renderPMHistory(targetUsername, history);
  });

  clearUnread(targetUsername);
  if (window.updateDMListSidebar) updateDMListSidebar();
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
    text
  };

  socket.emit("privateMessage", message);

  input.value = "";
}

function renderPMHistory(targetUsername, messages) {
  const s = getSession();
  const body = document.getElementById("pmBody_" + targetUsername);
  if (!body) return;

  body.innerHTML = "";

  messages.forEach(m => {
    const div = document.createElement("div");
    div.className = "message " + (m.from === s.username ? "me" : "");
    div.innerHTML = `
      <div style="font-size:13px;font-weight:700">${m.from}</div>
      <div style="margin-top:6px">${escapeHtml(m.text)}</div>
    `;
    body.appendChild(div);
  });

  body.scrollTop = body.scrollHeight;
}

/* ============================================================
   RECEIVE DM FROM SERVER
============================================================ */
socket.on("privateMessage", pm => {
  const me = getSession();
  if (!me) return;

  const other = pm.from === me.username ? pm.to : pm.from;

  // If window is open → append message
  const body = document.getElementById("pmBody_" + other);
  if (body) {
    renderPMHistory(other, [...body._history || [], pm]);
  } else {
    // Window closed → unread++
    incrementUnread(other);
    if (window.updateDMListSidebar) updateDMListSidebar();
  }
});

/* ============================================================
   DM SIDEBAR (unchanged except unread logic)
============================================================ */
function updateDMListSidebar() {
  const sidebar = document.getElementById("dmSidebar");
  if (!sidebar) return;

  const user = getSession();
  if (!user) {
    sidebar.innerHTML = '<div class="small" style="color:var(--muted)">Login to see DMs</div>';
    return;
  }

  const unread = getUnreadMap();

  // Fetch DM partners from server
  fetch("/api/dm/partners", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user.username })
  })
    .then(res => res.json())
    .then(data => {
      const partners = data.partners || [];

      sidebar.innerHTML = "";

      const search = document.createElement("input");
      search.id = "dmSearch";
      search.className = "dm-search";
      search.placeholder = "Search DMs";
      sidebar.appendChild(search);

      const listContainer = document.createElement("div");
      listContainer.id = "dmSidebarList";
      sidebar.appendChild(listContainer);

      const renderList = (filterTerm = "") => {
        listContainer.innerHTML = "";

        partners.forEach(other => {
          if (filterTerm && !other.toLowerCase().includes(filterTerm.toLowerCase())) return;

          const item = document.createElement("div");
          item.className = "dm-sidebar-item";
          item.innerHTML = `
            <span>@${other}</span>
            ${unread[other] ? `<span class="dm-unread-badge">${unread[other]}</span>` : ""}
          `;
          item.addEventListener("click", () => openPrivateWindow(other));
          listContainer.appendChild(item);
        });

        if (!listContainer.innerHTML) {
          listContainer.innerHTML = '<div class="small" style="color:var(--muted)">No DMs yet</div>';
        }
      };

      renderList();

      search.addEventListener("input", e => {
        renderList(e.target.value.trim());
      });
    });
}
