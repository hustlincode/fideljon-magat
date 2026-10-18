// One-shot jev_find runner through the actual jev MCP server (stdio, newline-delimited JSON).
// Runs the three redesign decisions sequentially in one process.
// Expects OPENROUTER_API_KEY (or another jev provider key) in process.env.
// Usage: node jev-find-run.js [outFile]
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const outFile = process.argv[2];

const decisions = [
  {
    key: 'scope',
    query:
      "Redesign scope for an already-strong developer portfolio inspired by marwieang.com's calm editorial restraint. The site already has: dual light/dark themes with system default and localStorage, grain texture, availability status chip, serif-italic accent words, project count badge, typewriter hero role line, crafted motion (GSAP reveals, magnetic hover, shared view transitions, spring route transitions), aurora glow accents, and an orange accent used pervasively. Goal: marwieang's quiet, information-honest, mostly-neutral look while keeping the site's existing personality and technical craft.",
    candidates: [
      { id: 'targeted-pass', text: 'Targeted restraint + signals pass: keep shell, hero concept, and signature motion; make the orange accent rare and deliberate (status dots, one punctuation accent, key link hovers) and quiet the aurora glows; add a stat row (numbers with arrow links to sections) and one or two tinted message cards (achievement/availability); refine body type rhythm toward 17px / 1.65. No structural rebuild.' },
      { id: 'full-reskin', text: 'Full visual re-skin: strip aurora, particles and kinetic flourishes; rebuild sections in a nearly monochrome flat editorial style closely matching marwieang; remove serif accents and typewriter for a plainer voice; keep minimal fades only.' },
      { id: 'additive-only', text: 'Additive only: add the stat row and message cards, but leave all current accent and glow intensity untouched; no restraint pass.' },
      { id: 'sidebar-shell', text: 'Structural flip: rebuild the home page around a persistent left sidebar app-shell like marwieang (grouped nav with count badges, footer strip), replacing the top navbar and hero-first layout.' },
    ],
  },
  {
    key: 'motion',
    query:
      "Motion policy for that same portfolio redesign. Current motion: typewriter loop, split-text hero reveals, magnetic hover, floating particles layer, aurora background drift, Lenis smooth scroll, GSAP scroll staggers, shared-element view transitions to project pages, spring route transitions. marwieang.com's calm feel comes from sparse, purposeful motion. The redesign wants that calm without losing the site's crafted liveliness. Pick the best policy.",
    candidates: [
      { id: 'quiet-down', text: 'Quiet-down: keep all signature interactions (typewriter, split-text, magnetic, shared view transitions) but reduce amplitude and simultaneity — remove the floating particles layer, keep aurora only as a single static hero wash with no endless drift, fewer scroll staggers, slightly longer eases.' },
      { id: 'full-keep', text: 'Keep all motion exactly as is; change only colors, type and the added sections.' },
      { id: 'full-calm', text: 'Full calm: remove particles, aurora, magnetic hover and all continuous animation; keep quick 150–250 ms fades plus the typewriter only.' },
      { id: 'consolidate', text: 'Consolidate: remove particles and Lenis smooth scroll entirely (native scrolling), keep CSS/GSAP reveals and view transitions; simpler stack, calmer feel.' },
    ],
  },
  {
    key: 'cards',
    query:
      "Content for one or two marwieang-style message cards: a full-width, softly tinted banner with a small icon, one bold line, a supporting line and an arrow link. Shown once or twice on the home page (after hero / after stats) of a Filipino full-stack developer's portfolio. The person: BSIT graduate 2024 (Pampanga State Agricultural University), associate-then-junior software developer at Servo IT Solutions OPC since 2024 building hospitality systems, 4 selected projects shipped, currently open to opportunities, active on GitHub and LinkedIn. Content should feel informative and warm, not salesy.",
    candidates: [
      { id: 'availability', text: "'Open to opportunities' card: full-time roles or freelance — Angeles City, PH, remote-friendly, replies within a day. Arrow leads to the contact section; small green status dot." },
      { id: 'current-role', text: "'Currently building hospitality systems at Servo IT Solutions OPC' — turning manual workflows into shipped web platforms since 2024. Arrow leads to the resume page." },
      { id: 'spotlight', text: "'Latest case study' card: newest project name, a one-line outcome, tiny screenshot thumbnail. Arrow leads to the project detail page." },
      { id: 'journey', text: "'From first line of code in 2021 to shipping production systems' — the short story of how I got here. Arrow leads to the about page." },
    ],
  },
];

let stderr = '';
const results = {};
const order = decisions.map((d) => d.key);
let current = null;
let nextCallIndex = 0;
let done = false;
let buf = '';

const child = spawn('cmd.exe', ['/d', '/c', 'npx', '-y', '@jkudish/jev-mcp'], {
  cwd: 'D:\\FideljonPortfolio',
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env,
  windowsHide: true,
});

function write(obj) {
  child.stdin.write(JSON.stringify(obj) + '\n');
}

function extractText(msg) {
  try {
    const c = msg && msg.result && msg.result.content;
    if (Array.isArray(c)) return c.map((x) => x && x.text).filter(Boolean).join('\n');
    if (msg && msg.result && msg.result.structuredContent) return JSON.stringify(msg.result.structuredContent, null, 1);
  } catch (e) {}
  return null;
}

function callNext() {
  if (nextCallIndex >= decisions.length) return finish();
  const d = decisions[nextCallIndex];
  const id = 2 + nextCallIndex;
  nextCallIndex += 1;
  current = { id, key: d.key };
  write({
    jsonrpc: '2.0',
    id,
    method: 'tools/call',
    params: { name: 'jev_find', arguments: { query: d.query, candidates: d.candidates, top_k: d.candidates.length } },
  });
}

function finish() {
  if (done) return;
  done = true;
  const out = {
    ranAt: new Date().toISOString(),
    env: { OPENROUTER: !!process.env.OPENROUTER_API_KEY, TYPESAFE: !!process.env.TYPESAFE_API_KEY },
    results,
  };
  try {
    if (outFile) {
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
    }
  } catch (e) {
    console.error('write failed: ' + (e.message || e));
  }
  for (const key of order) {
    const r = results[key];
    console.log('==== ' + key + ' ====');
    if (!r) {
      console.log('(missing)');
      continue;
    }
    if (r.error || r.transportError) {
      console.log('ERROR: ' + JSON.stringify(r).slice(0, 400));
      continue;
    }
    const text = extractText(r);
    console.log(text ? text.slice(0, 2400) : JSON.stringify(r).slice(0, 1200));
  }
  try {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } catch (e) {}
  setTimeout(() => process.exit(0), 600);
}

child.stdout.on('data', (d) => {
  buf += d.toString('utf8');
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch (e) {
      continue;
    }
    if (msg.id === 1) {
      write({ jsonrpc: '2.0', method: 'notifications/initialized' });
      callNext();
    } else if (current && msg.id === current.id) {
      results[current.key] = msg;
      callNext();
    }
  }
});
child.stderr.on('data', (d) => {
  stderr += d.toString('utf8');
});
child.on('exit', (code) => {
  if (!done) {
    console.error('child exited early, code=' + code + (stderr ? ' stderr: ' + stderr.slice(-800) : ''));
    finish();
  }
});

write({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'jev-find-run', version: '0.1.0' } },
});

setTimeout(() => {
  if (!done) {
    console.error('TIMEOUT');
    finish();
  }
}, 150000);
