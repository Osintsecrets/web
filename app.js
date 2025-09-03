document.addEventListener('DOMContentLoaded', () => {
  const pills = document.querySelectorAll('.nav-button');
  const installBtn = document.getElementById('installBtn');
  let deferredPrompt;

  pills.forEach(pill => {
    pill.addEventListener('click', (event) => {
      event.preventDefault();
      // TODO: implement navigation when sections are available
    });
  });

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  if (!isStandalone) {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      installBtn.hidden = false;
    });

    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.hidden = true;
    });

    window.addEventListener('appinstalled', () => {
      installBtn.hidden = true;
      deferredPrompt = null;
    });
  }
});
