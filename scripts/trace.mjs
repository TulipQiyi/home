// scripts/trace.mjs — 抓滚动负载下的真实事件耗时分布(script/layout/paint/composite)
import { spawn } from 'node:child_process'
const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const PORT = 9421
const URL_TARGET = process.argv[2] || 'http://localhost:4173/'
const proc = spawn(EDGE, ['--headless=new','--hide-scrollbars','--no-first-run','--user-data-dir=' + process.env.TEMP + '/edge-tr-' + Date.now(),'--remote-debugging-port=' + PORT,'--window-size=1440,900','about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
async function getWs(){for(let i=0;i<60;i++){try{const r=await fetch('http://127.0.0.1:'+PORT+'/json/list');const l=await r.json();const p=l.find(t=>t.type==='page');if(p)return p.webSocketDebuggerUrl}catch{}await sleep(250)}throw new Error('no cdp')}
const ws = new WebSocket(await getWs())
await new Promise(r => ws.onopen = r)
let id=0; const pending=new Map(); let collected=[]
ws.onmessage = ev => { const m=JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id) }
  if (m.method === 'Tracing.dataCollected') collected.push(...m.params.value)
}
function send(method, params={}) { const mid=++id; return new Promise((res)=>{pending.set(mid,res); ws.send(JSON.stringify({id:mid,method,params}))}) }
await send('Page.enable'); await send('Runtime.enable')
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
await send('Emulation.setCPUThrottlingRate', { rate: 4 })
await send('Page.navigate', { url: URL_TARGET })
await sleep(4500)
const ev = async (e, awaitP) => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: !!awaitP }); return r.exceptionDetails ? 'ERR ' + JSON.stringify(r.exceptionDetails).slice(0,400) : r.result.value }
await send('Tracing.start', { categories: 'devtools.timeline,blink,cc', transferMode: 'ReportEvents' })
await ev(`(async () => {
  const sc = document.scrollingElement; const max = sc.scrollHeight - innerHeight;
  let dir = 1, y = sc.scrollTop; const t0 = performance.now();
  while (performance.now() - t0 < 4000) {
    y += dir * 16; if (y >= max) { y = max; dir = -1 } if (y <= 0) { y = 0; dir = 1 }
    window.scrollTo(0, y);
    await new Promise(r => requestAnimationFrame(r));
  }
  return 1
})()`, true)
await send('Tracing.end')
await sleep(2500)
const agg = {}
let frameCount = 0
for (const e of collected) {
  if (!e.name || e.ph !== 'X' || !e.dur) continue
  if (e.name === 'DrawFrame') frameCount++
  agg[e.name] = (agg[e.name] || 0) + e.dur / 1000
}
const top = Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, 25)
console.log('events=' + collected.length + ' frames=' + frameCount)
console.log('TOP-EVENTS(ms)')
for (const [n, v] of top) console.log('  ' + n.padEnd(44) + v.toFixed(1))
ws.close(); proc.kill(); process.exit(0)
