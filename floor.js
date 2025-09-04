/* floor.js — deck grid + full-screen viewer (EN/HE), filenames with spaces supported */
(function () {
  const lang = (localStorage.getItem('lang') || 'en').toLowerCase() === 'he' ? 'he' : 'en';
  const T = {
    en: {
      floor_title: 'Floor plan',
      floor_subtitle: 'Tap a deck to view the map. Images will appear when available.',
      open: 'Open',
      close: 'Close',
      no_image: 'Image coming soon',
      zoom_hint: 'Pinch to zoom. Drag to pan.',
      deck: 'Deck'
    },
    he: {
      floor_title: 'תוכנית סיפונים',
      floor_subtitle: 'הקישו על סיפון להצגת המפה. התמונות יופיעו כאשר יהיו זמינות.',
      open: 'פתח',
      close: 'סגור',
      no_image: 'התמונה תעלה בקרוב',
      zoom_hint: 'צמצמו/הגדילו עם האצבעות וגררו להזזה.',
      deck: 'סיפון'
    }
  }[lang];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (T[key]) el.textContent = T[key];
  });

  const grid = document.getElementById('deckGrid');
  if (!grid) return;

  // Viewer elements
  const viewer = document.getElementById('deckViewer');
  const viewerTitle = document.getElementById('deckViewerTitle');
  const viewerImg = document.getElementById('deckImage');
  const closeBtn = document.getElementById('closeViewer');

  const openViewer = (deck) => {
    viewerTitle.textContent = (deck.label && deck.label[lang]) ? deck.label[lang] : `${T.deck} ${deck.id}`;
    viewerImg.alt = viewerTitle.textContent;
    viewerImg.src = encodeURI(deck.image); // handles spaces
    viewerImg.onerror = () => {
      viewerImg.onerror = null;
      const svg = encodeURIComponent(`
        <svg xmlns='http://www.w3.org/2000/svg' width='1400' height='1800'>
          <rect width='100%' height='100%' fill='#f2f2f2'/>
          <g font-family='system-ui,-apple-system,Segoe UI,Roboto' fill='#888' text-anchor='middle'>
            <text x='50%' y='45%' font-size='56'>${T.no_image}</text>
            <text x='50%' y='60%' font-size='28'>assets/images/deck ${deck.id}.png</text>
          </g>
        </svg>`);
      viewerImg.src = `data:image/svg+xml;charset=utf-8,${svg}`;
    };
    if (typeof viewer.showModal === 'function') viewer.showModal();
    else viewer.setAttribute('open','');
    document.body.style.overflow = 'hidden';
  };

  const closeViewer = () => {
    if (typeof viewer.close === 'function') viewer.close();
    else viewer.removeAttribute('open');
    document.body.style.overflow = '';
    viewerImg.src = '';
  };

  closeBtn.addEventListener('click', closeViewer);
  viewer.addEventListener('click', (e) => {
    const rect = viewerImg.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      closeViewer();
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeViewer(); });

  function cardTemplate(deck) {
    const title = (deck.label && deck.label[lang]) ? deck.label[lang] : `${T.deck} ${deck.id}`;
    const card = document.createElement('button');
    card.className = 'deck-card';
    card.type = 'button';
    card.setAttribute('aria-label', `${title} – ${T.open}`);
    card.innerHTML = `
      <div class="deck-thumb">
        <img loading="lazy" alt="${title}">
      </div>
      <div class="deck-meta">
        <div class="deck-title">${title}</div>
        <div class="deck-action">${T.open}</div>
      </div>
    `;
    const img = card.querySelector('img');
    img.src = encodeURI(deck.image); // horizontal thumb
    img.onerror = () => {
      img.onerror = null;
      const svg = encodeURIComponent(`
        <svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'>
          <rect width='100%' height='100%' fill='#fafafa'/>
          <g font-family='system-ui,-apple-system,Segoe UI,Roboto' fill='#bbb' text-anchor='middle'>
            <text x='50%' y='52%' font-size='40'>${T.no_image}</text>
          </g>
        </svg>`);
      img.src = `data:image/svg+xml;charset=utf-8,${svg}`;
    };
    card.addEventListener('click', () => openViewer(deck));
    return card;
  }

  fetch('data/decks.json')
    .then(r => r.json())
    .then(decks => {
      decks.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
      decks.forEach(deck => grid.appendChild(cardTemplate(deck)));
      const params = new URLSearchParams(location.search);
      const want = params.get('deck');
      if (want) {
        const match = decks.find(d => d.id === want.padStart(2,'0'));
        if (match) openViewer(match);
      }
    })
    .catch(() => {
      grid.innerHTML = `<div class="soft-note">${T.no_image}</div>`;
    });

  const hint = document.getElementById('zoomHint');
  if (hint) hint.textContent = T.zoom_hint;
})();
