async function loadAnalytics(){
  $('adminUsersView').style.display = 'none';
  $('adminAnalyticsView').style.display = 'block';

  const [statsRes, ipsRes] = await Promise.all([
    fetch('/api/admin/stats', { headers:{'x-admin-key': window.adminSessionKey} }),
    fetch('/api/admin/top-ips', { headers:{'x-admin-key': window.adminSessionKey} })
  ]);

  const stats = await statsRes.json();
  const ips   = await ipsRes.json();

  if (!stats.ok || !ips.ok) {
    console.error('Analytics error', stats, ips);
    return;
  }

  const statsBox = $('adminStatsSummary');
  if (statsBox) {
    const s = stats;
    statsBox.innerHTML = `
      <div>Total users: ${s.totalUsers}</div>
      <div>Online users: ${s.onlineUsers}</div>
      <div>Banned users: ${s.bannedUsers}</div>
      <div>Total logs: ${s.totalLogs}</div>
      <div>Last 24h: logins ${s.last24h.logins24h}, fails ${s.last24h.fails24h}, regs ${s.last24h.regs24h}</div>
    `;
  }

  const ipsTable = $('adminTopIps');
  if (ipsTable) {
    const tbody = ipsTable.querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = '';
      ips.ips.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row._id}</td>
          <td>${row.count}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  }
}
