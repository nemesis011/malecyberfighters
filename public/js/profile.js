let editImageUrl = '';

document.getElementById("btnEditProfile").addEventListener("click", () => {
  const user = getSession();
  if (!user) return;

  // Pre-fill fields
  $('editDisplay').value = user.display || user.username;
  $('editAge').value = user.age || '';
  $('editInfo').value = user.info || '';
  $('editColor').value = user.color || '#ffffff';
  $('editLanguage').value = user.language || 'en';
  $('editWins').value = user.stats?.wins || 0;
  $('editLosses').value = user.stats?.losses || 0;

  editImageUrl = user.imageUrl || '';

  show($('modalEditProfile'));
});

$('editCancel').addEventListener('click', () => hide($('modalEditProfile')));

$('btnEditUploadImage').addEventListener('click', async () => {
  const file = $('editImageFile').files[0];
  const status = $('editUploadStatus');
  if (!file) {
    status.textContent = 'Select a file first';
    return;
  }

  const form = new FormData();
  form.append('image', file);

  status.textContent = 'Uploading...';

  const resp = await fetch('/api/upload-image', { method: 'POST', body: form });
  const data = await resp.json();

  if (data.ok) {
    editImageUrl = data.url;
    status.textContent = 'Uploaded';
  } else {
    status.textContent = 'Upload failed';
  }
});

$('editSubmit').addEventListener('click', async () => {
  const user = getSession();
  if (!user) return;

  const updates = {
    display: $('editDisplay').value.trim(),
    age: Number($('editAge').value),
    info: $('editInfo').value.trim(),
    color: $('editColor').value,
    language: $('editLanguage').value,
    stats: {
      wins: Number($('editWins').value),
      losses: Number($('editLosses').value)
    },
    imageUrl: editImageUrl
  };

  const resp = await fetch('/api/update-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: user.username, updates })
  });

  const data = await resp.json();

  if (!data.ok) {
    $('editError').textContent = data.error || 'Update failed';
    $('editError').style.display = 'block';
    return;
  }

  // Update session + UI
  setSession(data.user);
  localStorage.setItem('currentUser', JSON.stringify(data.user));

  if (window.updateProfileCard) updateProfileCard(data.user);

  hide($('modalEditProfile'));
});
