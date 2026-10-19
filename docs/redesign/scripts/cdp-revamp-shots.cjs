// Theme-revamp evidence shots for the FJM portfolio via Chrome DevTools Protocol.
// Usage: node cdp-revamp-shots.cjs <port> <baseUrl> <outDir> <label> <width> <height> <theme> [path]
// Captures a viewport shot and a full-page shot + a text evidence JSON (sha256 per file).
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const [portArg, baseUrl, outDir, label, wArg, hArg, theme, routePath = '/', mode = ''] = process.argv.slice(2);
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

  const url = baseUrl.replace(/\/$/, '') + routePath;

  // Load once, force the theme, then reload so the boot script applies it.
  await send('Page.navigate', { url });
  await waitLoad(25000);
  await sleep(600);
  await evaluate(`localStorage.setItem('fjm-theme', ${JSON.stringify(theme)})`);
  await evaluate('location.reload()');
  await sleep(300);
  await waitLoad(25000);
  await sleep(4800);

  const applied = await evaluate('document.documentElement.getAttribute("data-theme") || "unset"');

  // Progressive scroll pass: Reveal sections start at opacity 0 and only
  // appear once observed, so a full-page capture without this would show
  // empty bands. Walk to the bottom, then return to the top for the shots.
  const pageHeight = await evaluate(
    'Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)'
  );
  for (let f = 0.2; f <= 1.01; f += 0.2) {
    await evaluate(`window.scrollTo({ top: ${Math.round(pageHeight * f)}, behavior: 'instant' })`);
    await sleep(700);
  }
  await evaluate("window.scrollTo({ top: 0, behavior: 'instant' })");
  await sleep(1000);

  const files = [];
  const capture = async (name, beyond) => {
    const shotRes = await send('Page.captureScreenshot',
      beyond ? { format: 'png', captureBeyondViewport: true } : { format: 'png' });
    const buf = Buffer.from(shotRes.data, 'base64');
    const sha = crypto.createHash('sha256').update(buf).digest('hex');
    const fileName = `revamp-${label}-${name}.png`;
    fs.writeFileSync(path.join(outDir, fileName), buf);
    files.push({ name: fileName, bytes: buf.length, sha256: sha });
  };

  // Viewport shot at the top.
  await evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`);
  await sleep(900);
  await capture('top', false);

  // Optional: open the mobile drawer before capturing, so the drawer's own
  // layout can be reviewed. This mode skips the scroll stops.
  if (mode === 'menu') {
    await evaluate(`document.querySelector('.nav-burger').click()`);
    await sleep(900);
    await capture('menu', false);
    const drawerRaw = await evaluate(`(() => {
      const panel = document.querySelector('.mobile-menu-panel');
      const cs = (el) => (el ? getComputedStyle(el) : null);
      return JSON.stringify(panel ? {
        visible: cs(document.querySelector('.mobile-menu')).visibility === 'visible',
        width: cs(panel).width,
        background: cs(panel).backgroundColor,
        color: cs(panel).color,
        items: Array.from(panel.querySelectorAll('.sidebar-item')).map((i) => i.textContent.trim()),
        contact: panel.querySelector('.sidebar-contact') ? panel.querySelector('.sidebar-contact').textContent.trim() : null,
        strip: panel.querySelector('.sidebar-strip') ? panel.querySelector('.sidebar-strip').textContent.trim() : null
      } : null);
    })()`);
    console.log('drawer:', drawerRaw);
    ws.close();
    return;
  }

  // Viewport shots down the page. Section review uses these stops because a
  // single full-page captureBeyondViewport pass can slice mid-reveal and show
  // blank bands for sections that are actually fine.
  const stops = [0.25, 0.5, 0.75, 1];
  for (let i = 0; i < stops.length; i++) {
    await evaluate(`window.scrollTo({ top: ${Math.round(pageHeight * stops[i])}, behavior: 'instant' })`);
    await sleep(1100);
    await capture(`stop${i + 1}`, false);
  }

  // Full-page shot from the top.
  await evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`);
  await sleep(600);
  await capture('full', true);

  const evidenceRaw = await evaluate(`(() => {
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const root = cs(document.documentElement);
    const sb = document.querySelector('.sidebar');
    const sbCs = cs(sb);
    const main = document.querySelector('.shell-main');
    const mainCs = cs(main);
    const topbar = document.querySelector('.mobile-topbar');
    const tbCs = cs(topbar);
    const bodyCs = cs(document.body);
    const h1 = document.querySelector('h1');
    const h1Cs = cs(h1);
    const dot = document.querySelector('.hero-dot');
    const statusDot = document.querySelector('.status-dot');
    const serif = document.querySelector('.serif-accent');
    const cx = document.querySelector('.container-x');
    const cards = Array.from(document.querySelectorAll('.message-card'));
    const statEls = Array.from(document.querySelectorAll('.stat'));
    const sidebarItems = Array.from(document.querySelectorAll('.sidebar .sidebar-item'));
    const fontsLoaded = document.fonts
      ? Array.from(document.fonts).filter((f) => f.status === 'loaded').map((f) => f.family + ' ' + f.weight + ' ' + f.style)
      : null;
    return JSON.stringify({
      label: ${JSON.stringify(label)},
      path: location.pathname,
      themeApplied: document.documentElement.getAttribute('data-theme') || 'unset',
      title: document.title,
      viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio },
      scrollHeight: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
      fonts: {
        body: bodyCs.fontFamily,
        h1: h1Cs ? h1Cs.fontFamily : null,
        h1Size: h1Cs ? h1Cs.fontSize : null,
        serif: serif ? cs(serif).fontFamily : null,
        loaded: fontsLoaded
      },
      tokens: {
        accent: root.getPropertyValue('--accent').trim(),
        brand: root.getPropertyValue('--brand').trim(),
        brandInk: root.getPropertyValue('--brand-ink').trim(),
        bgPrimary: root.getPropertyValue('--bg-primary').trim(),
        sidebarBg: root.getPropertyValue('--sidebar-bg').trim(),
        green: root.getPropertyValue('--green').trim()
      },
      sidebar: sb ? {
        display: sbCs.display,
        width: sbCs.width,
        background: sbCs.backgroundColor,
        border: sbCs.borderTopColor,
        radius: sbCs.borderRadius,
        position: sbCs.position,
        itemCount: sidebarItems.length,
        items: sidebarItems.map((i) => i.textContent.trim())
      } : null,
      shellMain: main ? { marginLeft: mainCs.marginLeft, paddingTop: mainCs.paddingTop } : null,
      topbar: topbar ? { display: tbCs.display, height: tbCs.height } : null,
      containerX: cx ? { maxWidth: cs(cx).maxWidth, width: Math.round(cx.getBoundingClientRect().width) } : null,
      hero: h1 ? {
        text: h1.textContent,
        dotColor: dot ? cs(dot).color : null,
        roleRow: !!document.querySelector('.hero-role-row'),
        moreLink: !!document.querySelector('.hero-more')
      } : null,
      statusDotColor: statusDot ? cs(statusDot).backgroundColor : null,
      canvases: document.querySelectorAll('canvas').length,
      stats: statEls.map((s) => ({
        value: (s.querySelector('.stat-value') || {}).textContent || null,
        label: (s.querySelector('.stat-label') || {}).textContent || null,
        arrow: !!s.querySelector('.stat-arrow')
      })),
      cards: cards.map((c) => ({
        className: c.className,
        label: (c.querySelector('.message-card-label') || {}).textContent || null,
        title: (c.querySelector('.message-card-title') || {}).textContent || null,
        backgroundImage: cs(c).backgroundImage.slice(0, 90),
        borderColor: cs(c).borderTopColor,
        labelColor: c.querySelector('.message-card-label') ? cs(c.querySelector('.message-card-label')).color : null,
        titleColor: c.querySelector('.message-card-title') ? cs(c.querySelector('.message-card-title')).color : null
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
  const evName = `evidence-${label}.json`;
  fs.writeFileSync(path.join(outDir, evName), JSON.stringify(evidence, null, 2));

  console.log(JSON.stringify({
    label,
    themeApplied: applied,
    title: evidence.title,
    sidebar: evidence.sidebar ? { display: evidence.sidebar.display, width: evidence.sidebar.width, items: evidence.sidebar.itemCount } : null,
    shellMainMargin: evidence.shellMain ? evidence.shellMain.marginLeft : null,
    topbar: evidence.topbar,
    fonts: { body: evidence.fonts.body.split(',')[0], h1: evidence.fonts.h1, h1Size: evidence.fonts.h1Size },
    dotColor: evidence.hero ? evidence.hero.dotColor : null,
    cards: evidence.cards.map((c) => c.className),
    files: files.map((f) => `${f.name} ${Math.round(f.bytes / 1024)}kb`)
  }, null, 1));

  ws.close();
}

main().catch((e) => {
  console.error('ERROR: ' + e.message);
  process.exit(1);
});
