const $ = id => document.getElementById(id);

function show(el){ el.style.display = 'flex'; }
function hide(el){ el.style.display = 'none'; }

function escapeHtml(s){
  return s.replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

const STORAGE_SESSION = 'cw_session_v1';
const STORAGE_PUBLIC  = 'cw_public_v1';
const STORAGE_DM_PREFIX = 'cw_dm_';
const STORAGE_DM_UNREAD = 'cw_dm_unread';

function setSession(user){ localStorage.setItem(STORAGE_SESSION, JSON.stringify(user)); }
function getSession(){ return JSON.parse(localStorage.getItem(STORAGE_SESSION) || 'null'); }
function clearSession(){ localStorage.removeItem(STORAGE_SESSION); }

function loadPublic(){ return JSON.parse(localStorage.getItem(STORAGE_PUBLIC) || '[]'); }
function savePublic(arr){ localStorage.setItem(STORAGE_PUBLIC, JSON.stringify(arr)); }

// DM storage helpers
function pmKey(a, b) {
  return [a, b].sort().join('::');
}

function loadDM(a, b) {
  const key = pmKey(a, b);
  return JSON.parse(localStorage.getItem(STORAGE_DM_PREFIX + key) || '[]');
}

function saveDM(a, b, arr) {
  const key = pmKey(a, b);
  localStorage.setItem(STORAGE_DM_PREFIX + key, JSON.stringify(arr));
}

// Unread DM helpers
function getUnreadMap() {
  return JSON.parse(localStorage.getItem(STORAGE_DM_UNREAD) || '{}');
}

function saveUnreadMap(map) {
  localStorage.setItem(STORAGE_DM_UNREAD, JSON.stringify(map));
}

function incrementUnread(fromUser) {
  const map = getUnreadMap();
  map[fromUser] = (map[fromUser] || 0) + 1;
  saveUnreadMap(map);
}

function clearUnread(user) {
  const map = getUnreadMap();
  delete map[user];
  saveUnreadMap(map);
}

// User profile card management
window.updateProfileCard = function(user) {
  const card = document.getElementById('userProfileCard');
  if (!card) return;
  
  if (!user) {
    card.innerHTML = '<div style="font-size:14px;color:var(--muted)">🔒 Not logged in</div><p style="margin:8px 0 0 0;color:var(--muted);font-size:12px">Login or register to see your profile</p>';
    card.classList.remove('logged-in');
  } else {
    const displayName = user.display || user.displayName || user.username;
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const wins = (user.stats && user.stats.wins) || 0;
    const losses = (user.stats && user.stats.losses) || 0;
    const winRate = (wins + losses) > 0 ? ((wins / (wins + losses)) * 100).toFixed(0) : '0';
    const age = user.age ? `${user.age} years old` : 'Age not set';
    const bio = user.info || 'No bio';
    
    card.innerHTML = `
      <div class="profile-avatar">${initials}</div>
      <div class="profile-info">
        <div class="profile-name">${displayName}</div>
        <div class="profile-status">@${user.username}</div>
        <div class="profile-details">
          <div class="profile-age">${age}</div>
          <div class="profile-bio">${bio}</div>
        </div>
        <div class="profile-stats">
          <div class="profile-stat">
            <div class="profile-stat-value">${wins}</div>
            <div class="profile-stat-label">Wins</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-value">${losses}</div>
            <div class="profile-stat-label">Losses</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-value">${winRate}%</div>
            <div class="profile-stat-label">Win Rate</div>
          </div>
        </div>
      </div>
      <button id="logoutBtn" class="profile-logout ghost">Logout</button>
    `;
    card.classList.add('logged-in');
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        if (window.logout) window.logout();
      });
    }
  }
};

window.updateUIForSession = function() {
  const user = getSession();
  if (user) {
    updateProfileCard(user);
  } else {
    updateProfileCard(null);
  }
};

window.addEventListener('load', function() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (currentUser) {
    window.updateProfileCard(currentUser);
  } else {
    window.updateProfileCard(null);
  }
});
