/* Shared cloud totals. Reading menus never records a play. */
(() => {
  'use strict';
  const games = new Set(['hdmi', 'aii', 'guitar-nut', 'ankle-breaker']);
  const totals = new Map(), pending = new Map();
  const token = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const urn = game => `qafstudio2.github.io/qaf-game/plays/${game}`;
  const style = document.createElement('style');
  style.textContent = '.play-count{display:block;color:#657064!important;font:12px/1.5 system-ui,sans-serif!important;letter-spacing:0!important;margin:8px 0!important;min-height:18px}.game-card>.play-count{margin:-10px 0 16px!important}.friend-card .play-count{padding:0 12px 12px!important;margin:0!important}';
  document.head.append(style);
  function render(game, failed = false) {
    document.querySelectorAll(`[data-play-count="${game}"]`).forEach(el => {
      el.textContent = totals.has(game) ? `已遊玩 ${totals.get(game).toLocaleString('zh-TW')} 次` : failed ? '遊玩次數暫時無法讀取' : '遊玩次數載入中…';
    });
  }
  async function refresh(game, fresh = false) {
    if (!games.has(game)) return;
    if (pending.has(game)) {
      await pending.get(game);
      if (fresh) return refresh(game, true);
      return;
    }
    const task = (async () => {
      const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const api = `https://hits.sh/api/urns/${urn(game)}?v=${token()}`;
        const url = new URL('https://img.shields.io/badge/dynamic/json');
        url.search = new URLSearchParams({url:api, query:'$.total', label:'plays', v:token()});
        const response = await fetch(url, {signal:controller.signal, cache:'no-store'});
        if (!response.ok) throw new Error('Counter unavailable');
        const xml = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
        const title = xml.querySelector('title')?.textContent || '';
        const match = /^plays:\s*([\d,]+)$/.exec(title);
        const value = match ? Number(match[1].replaceAll(',', '')) : title === 'plays: resource not found' ? 0 : NaN;
        if (!Number.isSafeInteger(value) || value < 0) throw new Error('Invalid counter');
        totals.set(game, Math.max(totals.get(game) || 0, value));
        render(game);
      } catch { render(game, true); }
      finally { clearTimeout(timeout); }
    })();
    pending.set(game, task);
    await task;
    pending.delete(game);
  }
  function start(game) {
    if (!games.has(game)) return;
    const img = new Image();
    const timeout = setTimeout(() => { img.onload = img.onerror = null; }, 10000);
    img.onload = () => {
      clearTimeout(timeout);
      refresh(game, true);
      if (window.parent !== window) window.parent.postMessage({namespace:'qaf-game', type:'play-count', game}, location.origin);
    };
    img.onerror = () => { clearTimeout(timeout); render(game, true); };
    // Never retry an uncertain write: a retry could count the same start twice.
    img.src = `https://hits.sh/${urn(game)}.svg?label=plays&v=${token()}`;
  }
  window.QAFPlayCount = {start, refresh};
  window.addEventListener('message', event => {
    const data = event.data;
    if (event.origin !== location.origin || data?.namespace !== 'qaf-game' || data.type !== 'play-count') return;
    if (![...document.querySelectorAll('iframe')].some(frame => frame.contentWindow === event.source)) return;
    refresh(data.game, true);
  });
  new Set([...document.querySelectorAll('[data-play-count]')].map(el => el.dataset.playCount)).forEach(game => refresh(game));
})();
