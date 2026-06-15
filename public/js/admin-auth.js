/* -----------------------------------------------------------
   ADMIN PANEL PASSWORD AUTH (CSP-SAFE)
----------------------------------------------------------- */

window.adminSessionKey = null;

/* Open Admin Password Modal */
document.getElementById("btnAdmin").addEventListener("click", () => {
  if (window.adminSessionKey) {
    // Already authenticated → open admin panel
    if (window.loadAdminPanel) window.loadAdminPanel();
    return;
  }

  // Show password modal
  show(document.getElementById("modalAdminPassword"));
});

/* Cancel admin password modal */
document.getElementById("adminPasswordCancel").addEventListener("click", () => {
  hide(document.getElementById("modalAdminPassword"));
});

/* Submit admin password */
document.getElementById("adminPasswordSubmit").addEventListener("click", async () => {
  const input = document.getElementById("adminPasswordInput").value.trim();
  const error = document.getElementById("adminPasswordError");

  error.style.display = "none";

  if (!input) {
    error.textContent = "Enter a password";
    error.style.display = "block";
    return;
  }

  // Test password by calling a protected endpoint
  const resp = await fetch("/api/admin/users", {
    headers: { "x-admin-key": input }
  });

  const data = await resp.json();

  if (!data.ok) {
    error.textContent = "Incorrect password";
    error.style.display = "block";
    return;
  }

  // Password correct → store session key
  window.adminSessionKey = input;

  hide(document.getElementById("modalAdminPassword"));

  // Open admin panel
  if (window.loadAdminPanel) window.loadAdminPanel();
});

/* Close Admin Panel */
document.getElementById("adminClose").addEventListener("click", () => {
  hide(document.getElementById("modalAdmin"));
});
