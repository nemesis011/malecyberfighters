$('btnLogin').addEventListener('click', () => show($('modalLogin')));
$('ctaLogin').addEventListener('click', () => show($('modalLogin')));
$('loginCancel').addEventListener('click', () => hide($('modalLogin')));
$('loginSubmit').addEventListener('click', doLogin);
$('loginPass').addEventListener('keydown', e => { if(e.key === 'Enter') doLogin(); });

async function doLogin(){
  const username = $('loginUser').value.trim();
  const password = $('loginPass').value;
  const err = $('loginError');
  err.style.display = 'none';

  if(!username || !password){
    err.textContent = "Enter username and password";
    err.style.display = 'block';
    return;
  }

  try {
    const resp = await fetch('/api/login', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({username,password})
    });
    const data = await resp.json();

    if(!data.ok){
      err.textContent = data.error === 'banned' ? 'You are banned.' : 'Invalid credentials';
      err.style.display = 'block';
      return;
    }

    setSession(data.user);
    socket.emit('login', data.user);
    hide($('modalLogin'));
    updateUIForSession();

  } catch(e){
    err.textContent = "Network error";
    err.style.display = 'block';
  }
}

function logout(){
  clearSession();
  updateUIForSession();
}
