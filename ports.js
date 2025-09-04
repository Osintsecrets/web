/* ports.js — Ports wiki (EN/HE), mobile-first accordion */
(function () {
  const lang = (localStorage.getItem('lang') || 'en').toLowerCase() === 'he' ? 'he' : 'en';
  const T = {
    en: {
      ports_title: 'Ports',
      ports_subtitle: 'Tap a port to view nearby Wi-Fi cafés and places to visit. Distances are approximate from the cruise terminal.',
      wifi_cafes: 'Wi-Fi Cafés near the port',
      sights: 'Places to visit',
      distance: 'Distance',
      walk: 'Walk',
      min: 'min',
      approx: 'approx.',
      free_wifi: 'Free Wi-Fi',
      paid_wifi: 'Paid Wi-Fi',
      port_area: 'Port area',
      sources_note: 'Sources (internal)',
      show: 'Show details',
      hide: 'Hide'
    },
    he: {
      ports_title: 'נמלים',
      ports_subtitle: 'הקישו על נמל כדי לראות בתי קפה עם Wi-Fi ומקומות מעניינים. המרחקים הם הערכות מאזור הנמל.',
      wifi_cafes: 'בתי קפה עם Wi-Fi ליד הנמל',
      sights: 'מקומות לבקר',
      distance: 'מרחק',
      walk: 'הליכה',
      min: 'דק׳',
      approx: 'בערך',
      free_wifi: 'Wi-Fi חינם',
      paid_wifi: 'Wi-Fi בתשלום',
      port_area: 'אזור הנמל',
      sources_note: 'מקורות (פנימי)',
      show: 'הצגת פרטים',
      hide: 'סגור'
    }
  }[lang];

  // i18n for static header text
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (T[key]) el.textContent = T[key];
  });

  const root = document.getElementById('portsList');
  if (!root) return;

  fetch('data/ports.json')
    .then(r => r.json())
    .then(ports => {
      ports.forEach(p => root.appendChild(renderPort(p)));
      root.setAttribute('aria-busy', 'false');
    })
    .catch(() => {
      root.innerHTML = '<div class="soft-note">Failed to load ports data.</div>';
    });

  function renderPort(port) {
    const card = document.createElement('section');
    card.className = 'port-card';

    const title = (port.name && port.name[lang]) || port.key;
    const area = (port.port_area && port.port_area[lang]) || '';

    card.innerHTML = `
      <button class="port-toggle" type="button" aria-expanded="false">
        <div class="port-title-row">
          <div class="port-title">${title}</div>
          <div class="port-area">${T.port_area}: ${area}</div>
        </div>
        <div class="port-chevron">▾</div>
      </button>
      <div class="port-details" hidden>
        <p class="port-disclaimer">${(port.disclaimer && port.disclaimer[lang]) || ''}</p>
        <div class="port-section">
          <h3>${T.wifi_cafes}</h3>
          <ul class="poi-list">${(port.wifi_cafes || []).map(renderCafe).join('')}</ul>
        </div>
        <div class="port-section">
          <h3>${T.sights}</h3>
          <ul class="poi-list">${(port.sights || []).map(renderSight).join('')}</ul>
        </div>
      </div>
    `;

    const btn = card.querySelector('.port-toggle');
    const details = card.querySelector('.port-details');
    btn.addEventListener('click', () => {
      const open = details.hasAttribute('hidden') === false;
      if (open) {
        details.setAttribute('hidden', '');
        btn.setAttribute('aria-expanded', 'false');
        card.classList.remove('open');
      } else {
        details.removeAttribute('hidden');
        btn.setAttribute('aria-expanded', 'true');
        card.classList.add('open');
      }
    });

    return card;
  }

  function renderCafe(c) {
    const wifiLabel = c.wifi === 'free' ? T.free_wifi : T.paid_wifi;
    return `
      <li class="poi">
        <div class="poi-head">
          <div class="poi-name">${escapeHtml(c.name)}</div>
          <div class="poi-wifi">${wifiLabel}</div>
        </div>
        <div class="poi-sub">${escapeHtml(c.address || '')}</div>
        <div class="poi-meta">${T.distance}: ~${c.approx_distance_m} m • ${T.walk}: ~${c.approx_walk_min} ${T.min}</div>
        ${c.notes ? `<div class="poi-notes">${escapeHtml(c.notes)}</div>` : ''}
      </li>
    `;
  }

  function renderSight(s) {
    const name = (s.name && s.name[lang]) || '';
    const notes = (s.notes && s.notes[lang]) || '';
    return `
      <li class="poi">
        <div class="poi-head">
          <div class="poi-name">${escapeHtml(name)}</div>
        </div>
        <div class="poi-meta">${T.distance}: ~${s.approx_distance_m} m • ${T.walk}: ~${s.approx_walk_min} ${T.min}</div>
        ${notes ? `<div class="poi-notes">${escapeHtml(notes)}</div>` : ''}
      </li>
    `;
  }

  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m]));
  }
})();
