// currency.js — EUR↔ILS, online/offline with timestamp and visible rate
(async () => {
  const rateKey = 'eur-ils-rate';
  const els = {
    amount: document.getElementById('amount'),
    mode: document.getElementById('mode'),
    refresh: document.getElementById('refreshRate'),
    result: document.getElementById('result'),
    rateDisplay: document.getElementById('rateDisplay'),
    rateWhen: document.getElementById('rateWhen')
  };

  function formatWhen(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleString();
  }

  function setRateUI(rate, ts) {
    els.rateDisplay.textContent = rate ? rate.toFixed(4) : '—';
    els.rateWhen.textContent = formatWhen(ts);
  }

  function convert(rate) {
    const val = parseFloat(els.amount.value) || 0;
    if (!rate || rate <= 0) { els.result.textContent = '—'; return; }
    const mode = els.mode.value;
    const out = mode === 'eur->ils' ? (val * rate) : (val / rate);
    els.result.textContent = out.toFixed(2);
  }

  async function fetchRate() {
    // exchangerate.host is free and doesn’t require an API key
    const url = 'https://api.exchangerate.host/latest?base=EUR&symbols=ILS';
    const cached = JSON.parse(localStorage.getItem(rateKey) || 'null');
    try {
      const r = await fetch(url, { cache: 'no-store' });
      const j = await r.json();
      const nextRate = j && j.rates && j.rates.ILS;
      if (nextRate) {
        const payload = { rate: nextRate, timestamp: Date.now() };
        localStorage.setItem(rateKey, JSON.stringify(payload));
        setRateUI(payload.rate, payload.timestamp);
        convert(payload.rate);
        return;
      }
      throw new Error('invalid response');
    } catch {
      if (cached) {
        setRateUI(cached.rate, cached.timestamp);
        convert(cached.rate);
      } else {
        setRateUI(null, null);
        convert(null);
      }
    }
  }

  els.amount?.addEventListener('input', () => {
    const cached = JSON.parse(localStorage.getItem(rateKey) || 'null');
    convert(cached ? cached.rate : null);
  });
  els.mode?.addEventListener('change', () => {
    const cached = JSON.parse(localStorage.getItem(rateKey) || 'null');
    convert(cached ? cached.rate : null);
  });
  els.refresh?.addEventListener('click', fetchRate);

  await fetchRate();
})();
