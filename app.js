(function () {
  const body = document.body;
  const menuBtn = document.getElementById('menuBtn');
  const sideMenu = document.getElementById('sideMenu');
  const overlay = document.getElementById('overlay');
  const closeBtn = document.getElementById('closeMenuBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const a2hsToggle = document.getElementById('showA2HS');
  const a2hsHelp = document.getElementById('a2hsHelp');
  const installBtn = document.getElementById('installBtn');
  const updateToast = document.getElementById('updateToast');
  const langToggle = document.getElementById('langToggle');

  // Simple i18n store
  const I18N = { lang: 'en', dict: {} };

  function t(key){ return I18N.dict[key] || key; }

  function detectInitialLang(){
    const saved = localStorage.getItem('lang');
    if (saved) return saved;
    return /^he\b/i.test(navigator.language||'') ? 'he' : 'en';
  }

  async function loadLang(lang){
    try{
      const res = await fetch(`i18n/${lang}.json`, { cache: 'no-store' });
      I18N.dict = await res.json();
      I18N.lang = lang;
      localStorage.setItem('lang', lang);
      applyI18N();
    }catch(_){ }
  }

  function applyI18N(root=document){
    // Swap all text nodes marked with data-i18n
    root.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      const val = I18N.dict[key];
      if (val) el.textContent = val;
    });
  }

  // init + toggle
  loadLang(detectInitialLang());
  langToggle?.addEventListener('click', ()=>{
    const next = (I18N.lang === 'he') ? 'en' : 'he';
    loadLang(next);
  });

  // Expose t() for other renderers (e.g., deck titles)
  window.__t = t;

  let lastFocus = null;

  function lockScroll(lock){ body.style.overflow = lock ? 'hidden' : ''; }
  function openMenu(){
    lastFocus = document.activeElement;
    sideMenu.classList.add('open');
    overlay.hidden = false; overlay.classList.add('show');
    sideMenu.setAttribute('aria-hidden','false');
    menuBtn?.setAttribute('aria-expanded','true');
    menuBtn?.classList.add('active');
    lockScroll(true);
    (sideMenu.querySelector('a,button,[tabindex]:not([tabindex="-1"])')||sideMenu).focus();
  }
  function closeMenu(){
    sideMenu.classList.remove('open');
    overlay.classList.remove('show'); setTimeout(()=>overlay.hidden=true,200);
    sideMenu.setAttribute('aria-hidden','true');
    menuBtn?.setAttribute('aria-expanded','false');
    menuBtn?.classList.remove('active');
    lockScroll(false);
    lastFocus?.focus?.();
  }
  menuBtn?.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', closeMenu);
  document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeMenu(); });

  // Focus trap
  sideMenu?.addEventListener('keydown',(e)=>{
    if(e.key!=='Tab') return;
    const nodes = sideMenu.querySelectorAll('a,button,[tabindex]:not([tabindex="-1"])');
    if(!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length-1];
    if(e.shiftKey && document.activeElement===first){ last.focus(); e.preventDefault(); }
    else if(!e.shiftKey && document.activeElement===last){ first.focus(); e.preventDefault(); }
  });

  // Refresh (check SW, apply immediately)
  refreshBtn?.addEventListener('click', async ()=>{
    try{
      const reg = await navigator.serviceWorker?.getRegistration();
      await reg?.update();
      if(reg?.waiting) reg.waiting.postMessage({type:'SKIP_WAITING'});
    }catch(_){ }
    location.reload();
  });

  // Update toast (notify when a new version is ready)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', ()=>{
      if(updateToast){ updateToast.classList.add('show'); setTimeout(()=>updateToast.classList.remove('show'), 3500); }
    });
  }

  // Platform-specific A2HS instructions
  const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const android = /android/i.test(navigator.userAgent);
  if(a2hsHelp){
    a2hsHelp.innerHTML = iOS
      ? `<ol>
           <li>Open this site in <strong>Safari</strong> on your iPhone.</li>
           <li>Tap the <strong>Share</strong> icon.</li>
           <li>Choose <strong>Add to Home Screen</strong>.</li>
           <li>Confirm to add the icon to your Home Screen.</li>
         </ol>`
      : `<ol>
           <li>Open this site in <strong>Chrome</strong> on your Android phone.</li>
           <li>Tap the <strong>⋮</strong> menu (top-right).</li>
           <li>Choose <strong>Add to Home screen</strong> or <strong>Install app</strong>.</li>
           <li>Confirm to add the icon to your Home Screen.</li>
         </ol>`;
  }
  a2hsToggle?.addEventListener('click', ()=>{
    if(!a2hsHelp) return;
    const hidden = a2hsHelp.hasAttribute('hidden');
    if(hidden) a2hsHelp.removeAttribute('hidden'); else a2hsHelp.setAttribute('hidden','');
  });

  // Android install button via beforeinstallprompt
  let deferredPrompt=null;
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
  if(standalone && installBtn) installBtn.hidden=true;
  window.addEventListener('beforeinstallprompt',(e)=>{
    e.preventDefault(); deferredPrompt=e; if(installBtn) installBtn.hidden=false;
  });
  installBtn?.addEventListener('click', async ()=>{
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    try{ await deferredPrompt.userChoice; } finally { installBtn.hidden=true; deferredPrompt=null; }
  });
  window.addEventListener('appinstalled', ()=>{ if(installBtn) installBtn.hidden=true; });

  // ===== Dynamic renderers =====

  // Itinerary: if data/itinerary.json has items, render them
  (async function renderItinerary(){
    const mount = document.getElementById('itineraryDynamic');
    if(!mount) return;
    try{
      const res = await fetch('data/itinerary.json', {cache:'no-store'});
      const data = await res.json();
      if(Array.isArray(data.items) && data.items.length){
        const ul = document.createElement('ul');
        ul.className = 'timeline-list';
        data.items.forEach(row=>{
          const li = document.createElement('li');
          if(row.gap){
            li.innerHTML = `<div class="gap"><span class="arrow">↓</span> ${row.gap}</div>`;
          }else{
            li.innerHTML = `<div class="event"><div class="when">${row.when||''}</div><div class="note">${row.note||''}</div></div>`;
          }
          ul.appendChild(li);
        });
        mount.replaceChildren(ul);
      }
    }catch(_){ }
  })();

  // Deck plans: read data/decks.json and render cards
  (async function renderDecks(){
    const root = document.getElementById('decksRoot');
    if(!root) return;
    try{
      const res = await fetch('data/decks.json', {cache:'no-store'});
      const data = await res.json();
      if(Array.isArray(data.decks) && data.decks.length){
        root.innerHTML = '';
        data.decks.forEach(d=>{
          const card = document.createElement('a');
          card.className='deck-card';
          card.href = d.image;
          card.target = '_blank';
          card.rel = 'noopener';
          card.innerHTML = `<img loading="lazy" src="${d.image}" alt="${d.name||'Deck plan'}"><div class="deck-card__label">${d.name||''}</div>`;
          root.appendChild(card);
        });
      }
    }catch(_){ }
  })();

  /* ===== Floor plans placeholder/auto loader ===== */
  (function renderDeckGrid(){
    const grid = document.getElementById('decksGrid');
    if(!grid) return;

    // Configure the decks you want to show as cards (titles only; images optional)
    const DECKS = [
      'Deck 03', 'Deck 04', 'Deck 05', 'Deck 06',
      'Deck 07', 'Deck 08', 'Deck 09', 'Deck 10', 'Deck 11'
    ];

    // Helper to check if an image exists
    function imageExists(src){
      return new Promise(resolve=>{
        const img = new Image();
        img.onload = ()=> resolve(true);
        img.onerror = ()=> resolve(false);
        img.src = src;
      });
    }

    // Build all cards
    (async () => {
      for (const name of DECKS){
        const path = `assets/images/${name}.png`;     // e.g., assets/images/Deck 03.png

        // shell
        const card = document.createElement('a');
        card.className = 'deck-card skeleton';  // start skeleton state
        card.href = 'javascript:void(0)';
        card.setAttribute('aria-label', `${name} deck plan`);

        const header = document.createElement('div');
        header.className = 'deck-card__header';
        header.textContent = `${window.__t('deck.label')} ${name.split(' ')[1]}`;

        const media = document.createElement('div');
        media.className = 'deck-card__media';

        const img = document.createElement('img');
        img.className = 'deck-card__img';
        img.alt = `${name} plan`;

        media.appendChild(img);
        card.appendChild(header);
        card.appendChild(media);
        grid.appendChild(card);

        // check file
        const exists = await imageExists(path);
        if (exists){
          img.src = path;
          card.classList.remove('skeleton');
          card.href = path;
          card.target = '_blank';
          card.rel = 'noopener';
        } else {
          // leave skeleton, keep card non-clickable
          img.remove(); // keep the shimmering block instead of a broken image icon
        }
      }
    })();
  })();

})();

// SW registration (all pages)
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js'));
}
