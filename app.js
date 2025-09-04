(function(){
  const menuBtn=document.getElementById('menuBtn');
  const sideMenu=document.getElementById('sideMenu');
  const overlay=document.getElementById('overlay');
  const closeBtn=document.getElementById('closeMenuBtn');
  const showA2HS=document.getElementById('showA2HS');
  const a2hsHelp=document.getElementById('a2hsHelp');

  if(!menuBtn || !sideMenu || !overlay) return;

  const open=()=>{
    sideMenu.classList.add('open');
    sideMenu.setAttribute('aria-hidden','false');
    overlay.hidden=false;
    menuBtn.setAttribute('aria-expanded','true');
    sideMenu.focus();
  };
  const close=()=>{
    sideMenu.classList.remove('open');
    sideMenu.setAttribute('aria-hidden','true');
    overlay.hidden=true;
    menuBtn.setAttribute('aria-expanded','false');
    menuBtn.focus();
  };

  menuBtn.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', e=>{ if(e.key==='Escape' && sideMenu.classList.contains('open')) close(); });

  showA2HS?.addEventListener('click', ()=>{ a2hsHelp.hidden=!a2hsHelp.hidden; });
})();

(function(){
  const btn=document.getElementById('refreshBtn');
  if(!btn) return;
  btn.addEventListener('click', async ()=>{
    try{
      const reg=await navigator.serviceWorker?.getRegistration();
      await reg?.update();
      if(reg?.waiting){ reg.waiting.postMessage({type:'SKIP_WAITING'}); }
    }catch(e){}
    location.reload();
  });
})();

(function(){
  let deferred=null;
  const installBtn=document.getElementById('installBtn');

  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
  if(standalone && installBtn) installBtn.hidden=true;

  window.addEventListener('beforeinstallprompt',(e)=>{
    e.preventDefault();
    deferred=e;
    if(installBtn) installBtn.hidden=false;
  });

  installBtn?.addEventListener('click', async ()=>{
    if(!deferred) return;
    deferred.prompt();
    try{ await deferred.userChoice; }finally{
      installBtn.hidden=true;
      deferred=null;
    }
  });

  window.addEventListener('appinstalled', ()=>{ if(installBtn) installBtn.hidden=true; });
})();
