// Redesign evidence shots for the FJM portfolio via Chrome DevTools Protocol.
// Usage: node cdp-redesign-shots.mjs <port> <baseUrl> <outDir> <label> <width> <height> <theme>
// Writes PNG screenshots + a text evidence JSON (with sha256 per file).
const fs = require('node:fs');
const path = require('node:path');

const [portArg, baseUrl, outDir, label, wArg, hArg, theme] = process.argv.slice(2);
const PORT = Number(portArg);
const W = Number(wArg);
const H = Number(hArg);
if (!['light', 'dark'].includes(theme)) {
  console.error('theme must be light or dark');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function targetList() {
  for (let attempt = 0; attempt < 15; attempt++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      const page =
        list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl) ||
        list.find((t) => t.webSocketDebuggerUrl);
      if (page) return page;
    } catch (e) { /* retry */ }
    await sleep(800);
  }
  throw new Error('no CDP page target after retries');
}

async function main() {
  const page = await targetList();
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  let loadWaiters = [];
  let lastLoadAt = 0;

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
      return;
    }
    if (msg.method === 'Page.loadEventFired') {
      lastLoadAt = Date.now();
      const waiters = loadWaiters;
      loadWaiters = [];
      waiters.forEach((r) => r());
    }
  };
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error('ws connect failed'));
  });

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, (m) => (m.error ? reject(new Error(`${method}: ${JSON.stringify(m.error)}`)) : resolve(m.result)));
    ws.send(JSON.stringify({ id: mid, method, params }));
  });

  const waitLoad = async (timeoutMs) => {
    const started = Date.now();
    if (lastLoadAt > started - 250) return;
    await new Promise((resolve) => {
      loadWaiters.push(resolve);
      setTimeout(resolve, timeoutMs);
    });
  };

  const evaluate = async (expression) => {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) throw new Error('evaluate failed: ' + JSON.stringify(res.exceptionDetails).slice(0, 300));
    return res.result.value;
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 768 });
  await send('Emulation.setEmulatedMedia', {
    features: [
      { name: 'prefers-color-scheme', value: theme },
      { name: 'prefers-reduced-motion', value: 'no-preference' }
    ]
  });

  fs.mkdirSync(outDir, { recursive: true });

  // Load once, force the theme, then reload so the boot script applies it.
  await send('Page.navigate', { url: baseUrl });
  await waitLoad(25000);
  await sleep(600);
  await evaluate(`localStorage.setItem('fjm-theme', ${JSON.stringify(theme)})`);
  await evaluate('location.reload()');
  await sleep(300);
  await waitLoad(25000);
  await sleep(4600);

  const applied = await evaluate('document.documentElement.getAttribute("data-theme") || "unset"');

  const shots = [
    { name: 'top', sel: null, off: 0 },
    { name: 'stats', sel: '.stats', off: 150 },
    { name: 'work', sel: '#work', off: 80 },
    { name: 'cardB', sel: '.message-card--green', off: 300 },
    { name: 'contact', sel: '#contact', off: 80 }
  ];

  const files = [];
  const scrollLog = [];

  for (const shot of shots) {
    let target = 0;
    if (shot.sel) {
      target = await evaluate(`(() => {
        const el = document.querySelector(${JSON.stringify(shot.sel)});
        if (!el) return null;
        return Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - ${shot.off}));
      })()`);
      if (target === null) {
        scrollLog.push({ name: shot.name, error: 'selector not found' });
        continue;
      }
    }
    await evaluate(`window.scrollTo({ top: ${target}, behavior: 'instant' })`);
    await sleep(1400);
    let actual = Math.round(await evaluate('window.scrollY'));
    if (Math.abs(actual - target) > 80) {
      await evaluate(`window.scrollTo({ top: ${target}, behavior: 'instant' })`);
      await sleep(1000);
      actual = Math.round(await evaluate('window.scrollY'));
    }
    const shotRes = await send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(shotRes.data, 'base64');
    const sha = require('node:crypto').createHash('sha256').update(buf).digest('hex');
    const name = `after-${label}-${shot.name}.png`;
    fs.writeFileSync(path.join(outDir, name), buf);
    files.push({ name, bytes: buf.length, sha256: sha });
    scrollLog.push({ name: shot.name, target, actual });
  }

  const evidenceRaw = await evaluate(`(() => {
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const root = getComputedStyle(document.documentElement);
    const statEls = Array.from(document.querySelectorAll('.stat'));
    const cardEls = Array.from(document.querySelectorAll('.message-card'));
    const heroEl = document.querySelector('.hero');
    return JSON.stringify({
      label: ${JSON.stringify(label)},
      themeApplied: document.documentElement.getAttribute('data-theme') || 'unset',
      url: location.href,
      viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio },
      scrollHeight: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      tokens: {
        accent: root.getPropertyValue('--accent').trim(),
        accentInk: root.getPropertyValue('--accent-ink').trim(),
        bgPrimary: root.getPropertyValue('--bg-primary').trim(),
        textSecondary: root.getPropertyValue('--text-secondary').trim()
      },
      hero: { animationName: heroEl ? cs(heroEl).animationName : null },
      canvases: document.querySelectorAll('canvas').length,
      stats: statEls.map((s) => ({
        value: (s.querySelector('.stat-value') || {}).textContent || null,
        label: (s.querySelector('.stat-label') || {}).textContent || null,
        href: s.getAttribute('href'),
        arrow: !!s.querySelector('.stat-arrow'),
        valueFontSize: s.querySelector('.stat-value') ? cs(s.querySelector('.stat-value')).fontSize : null,
        revealed: s.closest('.reveal') ? s.closest('.reveal').classList.contains('is-visible') : null
      })),
      cards: cardEls.map((c) => ({
        className: c.className,
        title: (c.querySelector('.message-card-title') || {}).textContent || null,
        support: (c.querySelector('.message-card-support') || {}).textContent || null,
        cta: (c.querySelector('.message-card-cta-label') || {}).textContent || null,
        href: c.getAttribute('href'),
        background: cs(c).backgroundColor,
        borderColor: cs(c).borderTopColor,
        radius: cs(c).borderRadius,
        height: Math.round(c.getBoundingClientRect().height),
        revealed: c.closest('.reveal') ? c.closest('.reveal').classList.contains('is-visible') : null
      })),
      workCount: (() => {
        const el = document.querySelector('.work-count');
        if (!el) return null;
        return { text: el.textContent.trim(), isLink: el.tagName === 'A', href: el.getAttribute('href') };
      })()
    });
  })()`);

  const evidence = JSON.parse(evidenceRaw);
  evidence.files = files;
  evidence.scrollLog = scrollLog;
  const evName = `evidence-${label}.json`;
  fs.writeFileSync(path.join(outDir, evName), JSON.stringify(evidence, null, 2));

  console.log(JSON.stringify({
    label,
    themeApplied: applied,
    stats: evidence.stats.length,
    cards: evidence.cards.length,
    canvases: evidence.canvases,
    heroAnimation: evidence.hero.animationName,
    workCount: evidence.workCount,
    files: files.map((f) => `${f.name} ${f.bytes}b`),
    evidence: evName
  }, null, 1));

  ws.close();
}

main().catch((e) => {
  console.error('ERROR: ' + e.message);
  process.exit(1);
});
