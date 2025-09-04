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
