$('btnAdmin').addEventListener('click', loadAdminPanel);

async function loadAdminPanel(){
  const res = await fetch('/api/admin/users', {
    headers:{'x-admin-key':'supersecretadminkey'}
  });
  const data = await res.json();
  if(!data.ok){ alert("Admin access denied"); return; }

  const tbody = $('adminTable').querySelector('tbody');
  tbody.innerHTML = '';

  data.users.forEach(u => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td>${u.online ? "🟢" : "⚪"}</td>
      <td>${u.banned ? "🚫" : "✔"}</td>
      <td>
        <button class="small-btn" onclick="adminBan('${u.username}', ${!u.banned})">${u.banned ? "Unban" : "Ban"}</button>
        <button class="small-btn" onclick="adminResetPass('${u.username}')">Reset PW</button>
        <button class="small-btn" onclick="adminDelete('${u.username}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  show($('modalAdmin'));
}

async function adminBan(username, banned){
  await fetch('/api/admin/ban', {
    method:'POST',
    headers:{'Content-Type':'application/json','x-admin-key':'supersecretadminkey'},
    body:JSON.stringify({username,banned})
  });
  loadAdminPanel();
}

async function adminResetPass(username){
  const newPass = prompt("Enter new password:");
  if(!newPass) return;

  await fetch('/api/admin/reset-password', {
    method:'POST',
    headers:{'Content-Type':'application/json','x-admin-key':'supersecretadminkey'},
    body:JSON.stringify({username,newPassword:newPass})
  });

  alert("Password reset");
}

async function adminDelete(username){
  if(!confirm("Delete this user?")) return;

  await fetch('/api/admin/delete-user', {
    method:'POST',
    headers:{'Content-Type':'application/json','x-admin-key':'supersecretadminkey'},
    body:JSON.stringify({username})
  });

  loadAdminPanel();
}
