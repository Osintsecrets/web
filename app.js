(function(){
  const body = document.body;
  const menuBtn = document.getElementById('menuBtn');
  const sideMenu = document.getElementById('sideMenu');
  const overlay = document.getElementById('overlay');
  const closeBtn = document.getElementById('closeMenuBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const showA2HS = document.getElementById('showA2HS');
  const a2hsHelp = document.getElementById('a2hsHelp');
  const installBtn = document.getElementById('installBtn');

  // Drawer helpers
  function openMenu(){
    sideMenu.classList.add('open');
    overlay.hidden = false;
    sideMenu.setAttribute('aria-hidden','false');
    menuBtn?.setAttribute('aria-expanded','true');
    sideMenu.focus();
  }
  function closeMenu(){
    sideMenu.classList.remove('open');
    overlay.hidden = true;
    sideMenu.setAttribute('aria-hidden','true');
    menuBtn?.setAttribute('aria-expanded','false');
  }

  menuBtn?.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeMenu(); });

  // Refresh: check for SW update and reload
  refreshBtn?.addEventListener('click', async ()=>{
    try{
      const reg = await navigator.serviceWorker?.getRegistration();
      await reg?.update();
      if(reg?.waiting){ reg.waiting.postMessage({type:'SKIP_WAITING'}); }
    }catch(e){}
    location.reload();
  });

  // Android PWA Install
  let deferredPrompt = null;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if(isStandalone && installBtn) installBtn.hidden = true;

  window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault();
    deferredPrompt = e;
    if(installBtn) installBtn.hidden = false;
  });
  installBtn?.addEventListener('click', async ()=>{
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    try{ await deferredPrompt.userChoice; } finally {
      installBtn.hidden = true; deferredPrompt = null;
    }
  });
  window.addEventListener('appinstalled', ()=>{ if(installBtn) installBtn.hidden = true; });

  // Toggle Android manual steps
  showA2HS?.addEventListener('click', ()=>{
    const isHidden = a2hsHelp?.hasAttribute('hidden');
    if(!a2hsHelp) return;
    if(isHidden) a2hsHelp.removeAttribute('hidden'); else a2hsHelp.setAttribute('hidden','');
  });
})();
