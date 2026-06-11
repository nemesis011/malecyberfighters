const socket = io();

socket.on('presence', onlineUsers => {
  window.users = onlineUsers;
  renderQuickRoster();
  renderRosterPage();
  renderOnlineList();
});

socket.on('publicMessage', m => {
  const arr = loadPublic();
  arr.push(m);
  savePublic(arr);
  renderPublicFeed();
});

socket.on('privateMessage', pm => {
  const key = pmKey(pm.from, pm.to);
  window._pmStore[key] = window._pmStore[key] || [];
  window._pmStore[key].push(pm);

  const me = getSession();
  const other = pm.from === me.username ? pm.to : pm.from;
  renderPM(other);
});

socket.on('pmError', e => alert('PM error: ' + e.reason));
