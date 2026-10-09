/* QAF play counts: one start per game document; no IP/cookie/device identifiers. */
(function () {
  'use strict';
  const config = window.QAF_GAME_STATS_CONFIG || {};
  const endpoint = typeof config.endpoint === 'string' && /^https:\/\//.test(config.endpoint) ? config.endpoint.replace(/\/$/, '') : '';
  const counts = new Map();
  const started = new Set();
  const formatter = new Intl.NumberFormat('zh-TW');
  const valid = n => Number.isSafeInteger(n) && n >= 0;
  const known = id => ['aii', 'hdmi'].includes(id);
  function label(id) {
    if (counts.has(id)) return '遊玩 ' + formatter.format(counts.get(id)) + ' 次';
    return endpoint ? '遊玩次數：暫無資料' : '遊玩次數：尚未啟用';
  }
  function render() {
    document.querySelectorAll('[data-play-count]').forEach(el => {
      el.textContent = label(el.dataset.playCount);
    });
    window.dispatchEvent(new Event('qaf-counts-updated'));
  }
  async function request(path, options) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(endpoint + path, { ...options, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', signal: controller.signal });
      if (!response.ok) throw new Error('count-service-unavailable');
      return await response.json();
    } finally { clearTimeout(timeout); }
  }
  function accept(data) {
    if (!data || typeof data.counts !== 'object' || !data.counts) return;
    for (const [id, count] of Object.entries(data.counts)) if (known(id) && valid(count)) counts.set(id, Math.max(counts.get(id) ?? 0, count));
    render();
  }
  async function refresh() {
    if (!endpoint) { render(); return; }
    try { accept(await request('/counts')); } catch (_) { render(); }
  }
  async function start(id) {
    if (!known(id) || started.has(id)) return;
    started.add(id);
    if (!endpoint) return;
    const eventId = crypto.randomUUID();
    try {
      const result = await request('/plays', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gameId: id, eventId }) });
      accept(result);
      // Parent refreshes only; the child alone records starts. No double increment.
      if (parent !== window) parent.postMessage({ namespace: 'qaf-game-stats', type: 'updated' }, location.origin);
    } catch (_) { /* Counting must never stop gameplay or invent a count. */ }
  }
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.data?.namespace !== 'qaf-game-stats' || event.data.type !== 'updated') return;
    const frames = Array.from(document.querySelectorAll('iframe'));
    if (frames.some(frame => frame.contentWindow === event.source)) refresh();
  });
  window.QAFGameStats = { start, end: id => started.delete(id), refresh, label, count: id => counts.get(id), render };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refresh); else refresh();
})();
