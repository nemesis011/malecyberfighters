/* -----------------------------------------------------------
   ADMIN PANEL (CSP-SAFE VERSION)
----------------------------------------------------------- */

async function loadAdminPanel() {
  const res = await fetch('/api/admin/users', {
    headers: { 'x-admin-key': window.adminSessionKey }
  });

  const data = await res.json();
  if (!data.ok) {
    alert("Admin access denied");
    return;
  }

  const tbody = document.querySelector('#adminTable tbody');
  tbody.innerHTML = '';

  data.users.forEach(u => {
    const row = document.createElement('tr');
    row.dataset.username = u.username;

    row.innerHTML = `
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td>${u.online ? "🟢" : "⚪"}</td>
      <td>${u.banned ? "🚫" : "✔"}</td>
      <td>
        <button class="small-btn admin-ban">${u.banned ? "Unban" : "Ban"}</button>
        <button class="small-btn admin-reset">Reset PW</button>
        <button class="small-btn admin-delete">Delete</button>
      </td>
    `;

    tbody.appendChild(row);
  });

  show(document.getElementById('modalAdmin'));
}

/* EVENT DELEGATION (CSP-SAFE) */
document.addEventListener('click', async (e) => {
  const row = e.target.closest('tr');
  if (!row) return;

  const username = row.dataset.username;

  /* BAN / UNBAN */
  if (e.target.classList.contains('admin-ban')) {
    const banned = e.target.textContent === "Ban" ? true : false;

    await fetch('/api/admin/ban', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': window.adminSessionKey
      },
      body: JSON.stringify({ username, banned })
    });

    loadAdminPanel();
  }

  /* RESET PASSWORD */
  if (e.target.classList.contains('admin-reset')) {
    const newPass = prompt("Enter new password:");
    if (!newPass) return;

    await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': window.adminSessionKey
      },
      body: JSON.stringify({ username, newPassword: newPass })
    });

    alert("Password reset");
  }

  /* DELETE USER */
  if (e.target.classList.contains('admin-delete')) {
    if (!confirm("Delete this user?")) return;

    await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': window.adminSessionKey
      },
      body: JSON.stringify({ username })
    });

    loadAdminPanel();
  }
});

/* CLOSE BUTTON */
document.getElementById('adminClose').addEventListener('click', () => {
  hide(document.getElementById('modalAdmin'));
});
