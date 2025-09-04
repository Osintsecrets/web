// refresh-status.js — handles "Last refreshed" UI on Home
(() => {
  // Use a single localStorage key for last refresh timestamp
  const LS_KEY = 'last-refreshed-ts';
  const el = document.getElementById('lastRefreshedValue');
  if (!el) return; // Only on home page

  // Render helper
  function render(ts) {
    if (!ts) {
      // Use i18n text if present, else fallback
      const never = document.querySelector('[data-i18n="never"]')?.textContent || 'Never';
      el.textContent = never;
      return;
    }
    const dt = new Date(ts);
    el.textContent = dt.toLocaleString();
  }

  // Initial render
  try {
    const saved = localStorage.getItem(LS_KEY);
    render(saved ? Number(saved) : null);
  } catch {
    render(null);
  }

  // Hook the refresh button to update timestamp AFTER refresh action
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      // Let the existing refresh logic run; then stamp time.
      // If you have an async refresh, consider stamping in its .then().
      const now = Date.now();
      try { localStorage.setItem(LS_KEY, String(now)); } catch {}
      render(now);
    }, { capture: true });
  }
})();
