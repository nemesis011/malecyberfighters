async function loadAnalytics(){
  $('adminUsersView').style.display = 'none';
  $('adminAnalyticsView').style.display = 'block';

  const [statsRes, ipsRes] = await Promise.all([
    fetch('/api/admin/stats', { headers:{'x-admin-key':'supersecretadminkey'} }),
    fetch('/api/admin/top-ips', { headers:{'x-admin-key':'supersecretadminkey'} })
  ]);

