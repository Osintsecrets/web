(function(){
  const body=document.body;
  const menuBtn=document.getElementById('menuBtn');
  const sideMenu=document.getElementById('sideMenu');
  const overlay=document.getElementById('overlay');
  const closeBtn=document.getElementById('closeMenuBtn');
  const refreshBtn=document.getElementById('refreshBtn');
  const a2hsToggle=document.getElementById('showA2HS');
  const a2hsHelp=document.getElementById('a2hsHelp');
  const installBtn=document.getElementById('installBtn');

  let lastFocus=null;
  function lockScroll(lock){ body.style.overflow = lock ? 'hidden' : ''; }
  function openMenu(){
    lastFocus = document.activeElement;
    sideMenu.classList.add('open'); overlay.hidden=false; overlay.classList.add('show');
    sideMenu.setAttribute('aria-hidden','false');
    menuBtn?.setAttribute('aria-expanded','true');
    menuBtn?.classList.add('active');
    lockScroll(true);
    // focus first focusable
    (sideMenu.querySelector('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])')||sideMenu).focus();
  }
  function closeMenu(){
    sideMenu.classList.remove('open'); overlay.classList.remove('show');
    setTimeout(()=>overlay.hidden=true, 200);
    sideMenu.setAttribute('aria-hidden','true');
    menuBtn?.setAttribute('aria-expanded','false');
    menuBtn?.classList.remove('active');
    lockScroll(false);
    lastFocus?.focus?.();
  }

  menuBtn?.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeMenu(); });

  // Focus trap inside sideMenu
  sideMenu?.addEventListener('keydown', (e)=>{
    if(e.key!=='Tab') return;
    const focusables = sideMenu.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
    if(!focusables.length) return;
    const first=focusables[0], last=focusables[focusables.length-1];
    if(e.shiftKey && document.activeElement===first){ last.focus(); e.preventDefault(); }
    else if(!e.shiftKey && document.activeElement===last){ first.focus(); e.preventDefault(); }
  });

  // Refresh: update SW then reload
  refreshBtn?.addEventListener('click', async ()=>{
    try{
      const reg=await navigator.serviceWorker?.getRegistration();
      await reg?.update();
      if(reg?.waiting){ reg.waiting.postMessage({type:'SKIP_WAITING'}); }
    }catch(_){ }
    location.reload();
  });

  // Install (Android only)
  let deferredPrompt=null;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
  if(isStandalone && installBtn) installBtn.hidden=true;

  window.addEventListener('beforeinstallprompt',(e)=>{
    e.preventDefault(); deferredPrompt=e; if(installBtn) installBtn.hidden=false;
  });
  installBtn?.addEventListener('click', async ()=>{
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    try{ await deferredPrompt.userChoice; } finally { installBtn.hidden=true; deferredPrompt=null; }
  });
  window.addEventListener('appinstalled', ()=>{ if(installBtn) installBtn.hidden=true; });

  // Toggle Android help
  a2hsToggle?.addEventListener('click', ()=>{
    if(!a2hsHelp) return;
    const isHidden = a2hsHelp.hasAttribute('hidden');
    if(isHidden) a2hsHelp.removeAttribute('hidden'); else a2hsHelp.setAttribute('hidden','');
  });

  // Mark active nav item based on filename
  (function markActive(){
    const map={'itinerary.html':'nav-itinerary','floor-plan.html':'nav-floor','important-info.html':'nav-info'};
    const file=(location.pathname.split('/').pop()||'index.html');
    const id=map[file]; const el=id&&document.getElementById(id);
    if(el) el.classList.add('pill--active');
  })();
})();

// keep SW registration present on every page:
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js'));
}

