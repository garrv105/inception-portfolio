/* ═══════════════════════════════════════════════════════════
   DAY-LIVE.JS — Live clock for the nav bar
   (Ticker, counters, typing animation removed for clean redesign)
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const clockEl = document.getElementById('al-clock');
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const hStr = String(h).padStart(2, '0');

    // Detect timezone abbreviation
    const tz = Intl.DateTimeFormat('en', { timeZoneName: 'short' })
      .formatToParts(now)
      .find(p => p.type === 'timeZoneName')?.value || 'EST';

    clockEl.textContent = `${hStr}:${m} ${ampm} ${tz}`;
  }

  updateClock();
  setInterval(updateClock, 10000); // update every 10 seconds
})();
