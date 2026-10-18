import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const PORT = 9411
const proc = spawn(EDGE, ['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run','--user-data-dir=' + process.env.TEMP + '/edge-p9-' + Date.now(),'--remote-debugging-port=' + PORT,'--window-size=1440,900','about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
async function getWs(){for(let i=0;i<60;i++){try{const r=await fetch('http://127.0.0.1:'+PORT+'/json/list');const l=await r.json();const p=l.find(t=>t.type==='page');if(p)return p.webSocketDebuggerUrl}catch{}await sleep(250)}throw new Error('no cdp')}
const ws = new WebSocket(await getWs())
await new Promise(r => ws.onopen = r)
let id=0; const pending=new Map(); const warns=[]
ws.onmessage = ev => { const m=JSON.parse(ev.data); if(m.id&&pending.has(m.id)){pending.get(m.id)(m.result);pending.delete(m.id)}
  if(m.method==='Runtime.consoleAPICalled' && (m.params.type==='warning'||m.params.type==='error')) warns.push(m.params.type+': '+m.params.args.map(a=>a.value??a.description??'').join(' ').slice(0,200))
  if(m.method==='Runtime.exceptionThrown') warns.push('EXC: '+(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text).slice(0,200)) }
function send(method, params={}) { const mid=++id; return new Promise((res)=>{pending.set(mid,res); ws.send(JSON.stringify({id:mid,method,params}))}) }
await send('Page.enable'); await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }, { name: 'prefers-color-scheme', value: 'dark' }] })
await send('Page.navigate', { url: 'http://localhost:4173/' })
await sleep(3500)
const ev = async (e, awaitP) => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: !!awaitP }); return r.exceptionDetails ? 'ERR ' + JSON.stringify(r.exceptionDetails).slice(0,300) : r.result.value }

console.log('MEDIA ' + await ev("JSON.stringify({reduce: matchMedia('(prefers-reduced-motion: reduce)').matches, wrapper: !!document.querySelector('#smooth-wrapper')})"))

const magnetExpr = [
  '(async () => {'
  , '  const el = document.querySelector(".hero-char")'
  , '  if (!el) return "no .hero-char"'
  , '  const r = el.getBoundingClientRect()'
  , '  const cx = r.left + r.width / 2, cy = r.top + r.height / 2'
  , '  const before = getComputedStyle(el).transform'
  , '  window.dispatchEvent(new MouseEvent("mousemove", { clientX: cx + 12, clientY: cy + 8, bubbles: true }))'
  , '  await new Promise(q => setTimeout(q, 400))'
  , '  const during = getComputedStyle(el).transform'
  , '  window.dispatchEvent(new MouseEvent("mousemove", { clientX: 5, clientY: 5, bubbles: true }))'
  , '  await new Promise(q => setTimeout(q, 1000))'
  , '  const after = getComputedStyle(el).transform'
  , '  return JSON.stringify({ before, during, after, moved: before !== during, restored: after === before })'
  , '})()'
].join('\n')
console.log('MAGNET ' + await ev(magnetExpr, true))

const cursorExpr = [
  '(async () => {'
  , '  const dot = document.querySelector(".cursor-dot") || document.querySelector("#cursor-dot")'
  , '  if (!dot) return "no cursor dot: " + document.body.innerHTML.slice(0,200)'
  , '  window.dispatchEvent(new MouseEvent("mousemove", { clientX: 700, clientY: 400, bubbles: true }))'
  , '  await new Promise(q => setTimeout(q, 600))'
  , '  const a = dot.style.transform'
  , '  window.dispatchEvent(new MouseEvent("mousemove", { clientX: 900, clientY: 300, bubbles: true }))'
  , '  await new Promise(q => setTimeout(q, 800))'
  , '  const b = dot.style.transform'
  , '  return JSON.stringify({ a, b, follows: a !== b })'
  , '})()'
].join('\n')
console.log('CURSOR ' + await ev(cursorExpr, true))

const scrollExpr = [
  '(async () => {'
  , '  const H = document.querySelector("#smooth-content").scrollHeight'
  , '  for (let y = 0; y < H; y += 350) { window.scrollTo(0, y); await new Promise(q => setTimeout(q, 50)) }'
  , '  window.scrollTo(0, H); await new Promise(q => setTimeout(q, 1300))'
  , '  const els = [...document.querySelectorAll("[data-reveal]")]'
  , '  return JSON.stringify({ h: H, hidden: els.filter(e => +getComputedStyle(e).opacity === 0).length, total: els.length })'
  , '})()'
].join('\n')
console.log('SCROLL ' + await ev(scrollExpr, true))

await ev('window.scrollTo(0, 0)')
await sleep(1300)
let shot = await send('Page.captureScreenshot', { format: 'png' })
writeFileSync('scripts/v-hero.png', Buffer.from(shot.data, 'base64'))
const stops = [[1500,'v-1500'],[3400,'v-3400'],[5600,'v-5600'],[7600,'v-7600']]
for (const s of stops) {
  await ev('window.scrollTo(0, ' + s[0] + ')')
  await sleep(1200)
  shot = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync('scripts/' + s[1] + '.png', Buffer.from(shot.data, 'base64'))
}
console.log('SHOTS ok')
console.log('WARNS ' + JSON.stringify(warns.slice(0, 12)))
ws.close(); proc.kill(); process.exit(0)