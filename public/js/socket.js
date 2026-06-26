const socket = io();

socket.on('presence', onlineUsers => {
  window.users = onlineUsers;
  renderQuickRoster();
  renderRosterPage();
  renderOnlineList();
  if (window.updateDMListSidebar) updateDMListSidebar();
});



socket.on("typingDM", ({ from }) => {
  const el = document.getElementById("pmTyping_" + from);
  if (el) el.style.display = "block";
});

socket.on("stopTypingDM", ({ from }) => {
  const el = document.getElementById("pmTyping_" + from);
  if (el) el.style.display = "none";
});
