document.addEventListener('DOMContentLoaded', () => {
  const pills = document.querySelectorAll('.pill[data-target]');
  pills.forEach(pill => {
    pill.addEventListener('click', (event) => {
      event.preventDefault();
      // TODO: implement navigation when sections are available
    });
  });
});

(function() {
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      try {
        if (navigator.serviceWorker?.getRegistration) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg?.update) { await reg.update(); }
        }
      } catch(e) { /* no-op */ }
      location.reload();
    });
  }
})();

(function() {
  let deferredPrompt = null;
  const installBtn = document.getElementById('installBtn');

  // Hide if already installed (standalone)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isStandalone && installBtn) installBtn.hidden = true;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Only show on Android/Chromium where this event fires
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.hidden = false;
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } finally {
        installBtn.hidden = true;
        deferredPrompt = null;
      }
    });
  }

  // Optional: hide if app becomes installed
  window.addEventListener('appinstalled', () => {
    if (installBtn) installBtn.hidden = true;
  });
})();

