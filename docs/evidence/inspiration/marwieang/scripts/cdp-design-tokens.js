// Generic design-token dump for an inspiration site via Chrome DevTools Protocol.
// Usage: node cdp-design-tokens.js <port> <url> <outDir> <label> <width> <height>
const fs = require('node:fs');
const path = require('node:path');

const [portArg, url, outDir, label, wArg, hArg] = process.argv.slice(2);
const PORT = Number(portArg);
const W = Number(wArg);
const H = Number(hArg);

async function targetList() {
  for (let attempt = 0; attempt < 12; attempt++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      // Chrome 154 headless exposes the initial about:blank tab as type "other".
      const page =
        list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl) ||
        list.find((t) => t.webSocketDebuggerUrl);
      if (page) return page;
    } catch (e) { /* retry */ }
    await new Promise((r) => setTimeout(r, 800));
  }
  throw new Error('no CDP page target after retries');
}

async function main() {
  const page = await targetList();
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const events = [];

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    } else {
      events.push(msg);
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

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 768 });

  const loaded = new Promise((resolve) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (events.some((e) => e.method === 'Page.loadEventFired') || Date.now() - started > 20000) {
        clearInterval(timer);
        resolve();
      }
    }, 150);
  });
  await send('Page.navigate', { url });
  await loaded;
  await new Promise((r) => setTimeout(r, 4000));

  const expression = `(() => {
    const styleOf = (el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        cls: (typeof el.className === 'string' ? el.className : String(el.className || '')).slice(0, 100),
        text: (el.textContent || '').trim().slice(0, 80),
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, fontStyle: cs.fontStyle,
        lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, textTransform: cs.textTransform,
        color: cs.color, backgroundColor: cs.backgroundColor, borderRadius: cs.borderRadius,
        padding: cs.padding, margin: cs.margin, display: cs.display, position: cs.position,
        textDecoration: cs.textDecorationLine, borderColor: cs.borderTopColor, borderWidth: cs.borderTopWidth,
      };
    };
    const selMap = {
      h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6', p: 'p', a: 'a', button: 'button',
      header: 'header', footer: 'footer', sectionFirst: 'section', navLink: 'nav a',
    };
    const samples = {};
    for (const [k, s] of Object.entries(selMap)) {
      const el = document.querySelector(s);
      samples[k] = el ? styleOf(el) : null;
    }

    const els = Array.from(document.body ? document.body.querySelectorAll('*') : []).slice(0, 2000);
    const fonts = {};
    const bg = {}; const text = {}; const border = {};
    for (const el of els) {
      const cs = getComputedStyle(el);
      fonts[cs.fontFamily] = (fonts[cs.fontFamily] || 0) + 1;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const add = (m, v) => { if (v && v !== 'rgba(0, 0, 0, 0)') m[v] = (m[v] || 0) + 1; };
      add(bg, cs.backgroundColor);
      add(text, cs.color);
      if (parseFloat(cs.borderTopWidth) > 0) add(border, cs.borderTopColor);
    }
    const top = (m, k) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, k);

    const rootCs = getComputedStyle(document.documentElement);
    const vars = {}; let n = 0;
    for (const p of rootCs) {
      if (typeof p === 'string' && p.startsWith('--')) { vars[p] = rootCs.getPropertyValue(p).trim(); if (++n >= 150) break; }
    }

    const links = Array.from(document.querySelectorAll('a[href]')).slice(0, 100).map((a) => ({
      href: a.getAttribute('href'), text: (a.textContent || '').trim().slice(0, 60),
    }));

    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).slice(0, 60).map((h) => ({
      tag: h.tagName.toLowerCase(), text: (h.textContent || '').trim().slice(0, 100),
    }));

    const sections = Array.from(document.querySelectorAll('section, main > div, main > section')).slice(0, 40).map((s) => ({
      tag: s.tagName.toLowerCase(),
      id: s.id || null,
      cls: (typeof s.className === 'string' ? s.className : '').slice(0, 100),
      height: Math.round(s.getBoundingClientRect().height),
    }));

    const meta = {
      url: location.href,
      title: document.title,
      description: (document.querySelector('meta[name="description"]') || {}).content || null,
      viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio },
      bodyScrollHeight: document.body ? document.body.scrollHeight : null,
      htmlLang: document.documentElement.lang || null,
    };

    return JSON.stringify({
      meta, samples,
      fonts: top(fonts, 12),
      colors: { backgrounds: top(bg, 15), text: top(text, 12), borders: top(border, 10) },
      rootVars: vars, links, headings, sections,
    });
  })()`;

  const res = await send('Runtime.evaluate', { expression, returnByValue: true });
  if (res.exceptionDetails) throw new Error('evaluate failed: ' + JSON.stringify(res.exceptionDetails).slice(0, 300));
  const data = res.result.value;
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `design-tokens-${label}.json`);
  fs.writeFileSync(out, data);
  console.log(JSON.stringify({ ok: true, file: out, bytes: data.length }));
  ws.close();
}

main().catch((e) => {
  console.error('ERROR: ' + e.message);
  process.exit(1);
});
