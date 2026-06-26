const socket = io();

socket.on('presence', onlineUsers => {
  window.users = onlineUsers;
  renderQuickRoster();
  renderRosterPage();
  renderOnlineList();
  if (window.updateDMListSidebar) updateDMListSidebar();
});


socket.on('privateMessage', pm => {
  const me = getSession();
  if (!me) return;

  // Determine the other user in the DM
  const other = pm.from === me.username ? pm.to : pm.from;

  // Check if the DM window is open
  const body = document.getElementById("pmBody_" + other);

  if (body) {
    // Append to in‑memory history
    const existing = body._history || [];
    const updated = [...existing, pm];
    body._history = updated;

    // Render updated history
    renderPMHistory(other, updated);
  } else {
    // DM window closed → unread++
    incrementUnread(other);
    if (window.updateDMListSidebar) updateDMListSidebar();
  }
});
socket.on("typingDM", ({ from }) => {
  const el = document.getElementById("pmTyping_" + from);
  if (el) el.style.display = "block";
});

socket.on("stopTypingDM", ({ from }) => {
  const el = document.getElementById("pmTyping_" + from);
  if (el) el.style.display = "none";
});
