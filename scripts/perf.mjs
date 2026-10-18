// scripts/perf.mjs — Edge headless + CDP：量化滚动 / 鼠标移动两种负载下的主线程开销
// 用法: node scripts/perf.mjs <url> [标签] [注入CSS文件] [端口偏移]
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const URL_TARGET = process.argv[2] || 'http://localhost:4173/'
const LABEL = process.argv[3] || 'run'
const CSS_FILE = process.argv[4] && process.argv[4] !== '-' ? process.argv[4] : null
const PORT = 9334 + Number(process.argv[5] || 0)
const CPU_THROTTLE = Number(process.argv[6] || 1)
const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const userDataDir = mkdtempSync(join(tmpdir(), 'edge-perf-'))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const child = spawn(EDGE, [
  '--headless=new', '--hide-scrollbars', '--mute-audio', '--no-first-run',
  '--no-default-browser-check', '--disable-extensions', '--window-size=1440,900',
  '--remote-debugging-port=' + PORT, '--user-data-dir=' + userDataDir, 'about:blank',
], { stdio: 'ignore' })

async function getJson(path) {
  for (let i = 0; i < 80; i++) {
    try { const res = await fetch('http://127.0.0.1:' + PORT + path); return await res.json() }
    catch { await sleep(250) }
  }
  throw new Error('CDP not reachable')
}

let ws, msgId = 0
const pending = new Map()
function send(method, params = {}) {
  const id = ++msgId
  ws.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }))
}
async function metrics() {
  const r = await send('Performance.getMetrics')
  const m = {}
  for (const x of r.metrics) m[x.name] = x.value
  return m
}
async function delta(fn) {
  const a = await metrics()
  const extra = await fn()
  const b = await metrics()
  const out = {}
  for (const k of ['TaskDuration', 'ScriptDuration', 'LayoutDuration', 'RecalcStyleDuration', 'LayoutCount', 'RecalcStyleCount', 'JSHeapUsedSize']) {
    out[k] = +(((b[k] || 0) - (a[k] || 0)) * (k.endsWith('Duration') ? 1000 : 1)).toFixed(1)
  }
  return Object.assign(out, extra || {})
}

const SETUP = `(async () => {
  window.__frames = [];
  window.__long = [];
  if (window.__po) window.__po.disconnect();
  window.__po = new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long.push(e.duration) });
  try { window.__po.observe({ entryTypes: ['longtask'] }) } catch (e) {}
  return 1;
})()`

function workloadSource(kind) {
  if (kind === 'scroll') return `(async () => {
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    window.__frames = []; window.__long = [];
    const sc = document.scrollingElement;
    const max = sc.scrollHeight - innerHeight;
    let running = true;
    const loop = (t) => { window.__frames.push(t); if (running) requestAnimationFrame(loop) };
    requestAnimationFrame(loop);
    let dir = 1, y = sc.scrollTop;
    const t0 = performance.now();
    while (performance.now() - t0 < 5000) {
      y += dir * 16;
      if (y >= max) { y = max; dir = -1 }
      if (y <= 0) { y = 0; dir = 1 }
      window.scrollTo(0, y);
      await new Promise(r => requestAnimationFrame(r));
    }
    running = false;
    await sleep(200);
    window.scrollTo(0, 0);
    await sleep(300);
    return window.__frames.length;
  })()`
  return `(async () => {
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    window.__frames = []; window.__long = [];
    window.scrollTo(0, 600);
    await sleep(400);
    const w = innerWidth, h = innerHeight;
    let i = 0;
    const t0 = performance.now();
    while (performance.now() - t0 < 4000) {
      const x = (i * 37) % w, y = 120 + ((i * 53) % (h - 240));
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y, bubbles: true }));
      i++;
      await sleep(8);
    }
    return i;
  })()`
}

const SUMMARY = `(() => {
  const d = [];
  const f = window.__frames;
  for (let i = 1; i < f.length; i++) d.push(f[i] - f[i - 1]);
  d.sort((a, b) => a - b);
  const q = (p) => d.length ? +d[Math.min(d.length - 1, Math.floor(d.length * p))].toFixed(1) : 0;
  const sum = d.reduce((a, b) => a + b, 0);
  const longTasks = window.__long || [];
  return JSON.stringify({
    frames: d.length,
    avgFps: d.length ? +(1000 / (sum / d.length)).toFixed(1) : 0,
    p50: q(0.5), p95: q(0.95), p99: q(0.99),
    over33: d.filter(x => x > 33.4).length,
    longTasks: longTasks.length,
    longTaskMs: +longTasks.reduce((a, b) => a + b, 0).toFixed(0),
  });
})()`

try {
  const targets = await getJson('/json/list')
  const page = targets.find((t) => t.type === 'page')
  ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data)
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id); pending.delete(m.id)
      m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result)
    }
  }
  await send('Page.enable'); await send('Runtime.enable'); await send('Performance.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
  // headless Edge 默认 prefers-reduced-motion: reduce!不强制成 no-preference 的话,
  // 测到的永远是「减弱动态」分支(reveal/磁吸/ScrollSmoother 全被短路),数据没意义。
  await send('Emulation.setEmulatedMedia', {
    features: [
      { name: 'prefers-reduced-motion', value: 'no-preference' },
      { name: 'prefers-color-scheme', value: 'dark' },
    ],
  })
  if (CPU_THROTTLE > 1) await send('Emulation.setCPUThrottlingRate', { rate: CPU_THROTTLE })
  await send('Page.navigate', { url: URL_TARGET })
  await sleep(4000)
  if (CSS_FILE) {
    const css = readFileSync(CSS_FILE, 'utf8')
    await send('Runtime.evaluate', { expression: `(() => { const s = document.createElement('style'); s.id='__perf_inject'; s.textContent = ${JSON.stringify(css)}; document.head.appendChild(s); return 1 })()`, returnByValue: true })
    await sleep(800)
  }
  await send('Runtime.evaluate', { expression: SETUP, awaitPromise: true })

  const asyncEval = async (src) => {
    const r = await send('Runtime.evaluate', { expression: src, awaitPromise: true, returnByValue: true })
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 300))
    return r.result && r.result.value
  }

  const results = {}
  for (const kind of ['scroll', 'mousemove']) {
    const m = await delta(async () => {
      const v = await asyncEval(workloadSource(kind))
      return { iterations: v }
    })
    const s = await asyncEval(SUMMARY)
    results[kind] = Object.assign(m, JSON.parse(s))
  }
  console.log(JSON.stringify({ label: LABEL, url: URL_TARGET, throttle: CPU_THROTTLE, injected: CSS_FILE ? true : false, ...results }, null, 2))
} catch (e) {
  console.error('PERF ERROR:', e.message)
  process.exitCode = 1
} finally {
  try { if (ws) ws.close() } catch (e) {}
  child.kill()
  await sleep(400)
  try { rmSync(userDataDir, { recursive: true, force: true }) } catch (e) {}
}
