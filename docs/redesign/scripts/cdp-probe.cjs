// One-off probe: scrolls to a selector, reports reveal state, screenshots the viewport.
// Usage: node cdp-probe.cjs <port> <baseUrl> <outName> <theme> <w> <h> <selector>
const fs = require('node:fs');
const path = require('node:path');

const [portArg, baseUrl, outName, theme, wArg, hArg, selector] = process.argv.slice(2);
const PORT = Number(portArg);
const W = Number(wArg);
const H = Number(hArg);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  let page;
  for (let i = 0; i < 15 && !page; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl) || list.find((t) => t.webSocketDebuggerUrl);
    } catch {}
    if (!page) await sleep(800);
  }
  if (!page) throw new Error('no target');

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  let loadWaiter = null;
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    if (msg.method === 'Page.loadEventFired' && loadWaiter) { loadWaiter(); loadWaiter = null; }
  };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws failed')); });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, (m) => (m.error ? reject(new Error(method + ': ' + JSON.stringify(m.error))) : resolve(m.result)));
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  const evaluate = async (expression) => {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) throw new Error('eval: ' + JSON.stringify(res.exceptionDetails).slice(0, 300));
    return res.result.value;
  };

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: theme }] });

  await send('Page.navigate', { url: baseUrl });
  await new Promise((r) => { loadWaiter = r; setTimeout(r, 20000); });
  await sleep(500);
  await evaluate(`localStorage.setItem('fjm-theme', ${JSON.stringify(theme)})`);
  await evaluate('location.reload()');
  await new Promise((r) => { loadWaiter = r; setTimeout(r, 20000); });
  await sleep(4000);

  const target = await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return null;
    return Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - 120));
  })()`);
  if (target === null) throw new Error('selector not found: ' + selector);
  await evaluate(`window.scrollTo({ top: ${target}, behavior: 'instant' })`);
  await sleep(1600);

  const report = await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    const reveal = el && el.closest('.reveal');
    const h2 = el && el.querySelector('h2');
    const cs = (n) => (n ? getComputedStyle(n) : null);
    const chain = [];
    let node = el;
    while (node && node !== document.body) {
      const s = getComputedStyle(node);
      chain.push({
        tag: node.tagName.toLowerCase(),
        cls: String(node.className && node.className.baseVal !== undefined ? node.className.baseVal : node.className).slice(0, 80),
        opacity: s.opacity,
        transform: s.transform === 'none' ? 'none' : 'set',
        display: s.display,
        visibility: s.visibility
      });
      node = node.parentElement;
    }
    return JSON.stringify({
      scrollY: Math.round(window.scrollY),
      found: !!el,
      headingText: h2 ? h2.textContent : null,
      headingSize: h2 ? cs(h2).fontSize : null,
      headingColor: h2 ? cs(h2).color : null,
      revealClass: reveal ? reveal.className : null,
      revealOpacity: reveal ? cs(reveal).opacity : null,
      ioVisible: reveal ? reveal.classList.contains('is-visible') : null,
      chain
    });
  })()`);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.mkdirSync(path.dirname(outName), { recursive: true });
  fs.writeFileSync(outName, Buffer.from(shot.data, 'base64'));
  console.log(report);
  ws.close();
}
main().catch((e) => { console.error('ERROR: ' + e.message); process.exit(1); });
