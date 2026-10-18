<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

// 星空粒子:canvas 原生 rAF,闪烁 + 缓慢下飘(不依赖 GSAP,轻量流畅)。
// 性能要点:
// - 只在「可见 + 页面未隐藏 + 未开启减弱动态」时跑 rAF,滚出视口立即暂停(此前全程 60fps 空转)。
// - resize 用 ResizeObserver + 元素自身尺寸(此前读 parentElement.clientHeight,对 absolute canvas 会得到 0)。
const props = withDefaults(
  defineProps<{
    count?: number
    color?: string
    maxAlpha?: number // 0–1
    speed?: number // 闪烁速率倍率
    drift?: number // 每秒下飘像素
  }>(),
  {
    count: 90,
    color: '#ffffff',
    maxAlpha: 0.9,
    speed: 1,
    drift: 4,
  }
)

const canvas = ref<HTMLCanvasElement | null>(null)

type Star = {
  x: number
  y: number
  r: number
  base: number
  phs: number
  tw: number
}

let ctx: CanvasRenderingContext2D | null = null
let raf = 0
let stars: Star[] = []
let W = 0
let H = 0
let dpr = 1
let t = 0
let last = 0
let visible = true
let reduced = false
let ro: ResizeObserver | null = null
let io: IntersectionObserver | null = null

function initStars() {
  // 小屏/低 DPR 时按面积缩减粒子数,避免手机端 400+ 个 arc 铺满屏
  const area = (W * H) / (1440 * 900)
  const n = Math.max(12, Math.round(props.count * Math.min(1, Math.max(0.35, area))))
  stars = Array.from({ length: n }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 0.4 + Math.random() * 1.4,
    base: 0.25 + Math.random() * 0.75,
    phs: Math.random() * Math.PI * 2,
    tw: 0.4 + Math.random() * 1.6,
  }))
}

function resize() {
  const el = canvas.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const nw = Math.max(1, Math.round(rect.width))
  const nh = Math.max(1, Math.round(rect.height))
  // 尺寸没变就不要重建(ResizeObserver 抖动时避免每帧重算粒子)
  if (nw === W && nh === H && stars.length) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  W = nw
  H = nh
  el.width = Math.round(W * dpr)
  el.height = Math.round(H * dpr)
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  initStars()
}

function frame(now: number) {
  raf = 0
  const dt = Math.min((now - last) / 1000, 0.05)
  last = now
  t += dt
  if (ctx && W > 0 && H > 0) {
    ctx.clearRect(0, 0, W, H)
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = props.color
    for (const s of stars) {
      const a = props.maxAlpha * s.base * (0.6 + 0.4 * Math.sin(t * s.tw * props.speed + s.phs))
      s.y += props.drift * dt
      if (s.y > H + 2) {
        s.y = -2
        s.x = Math.random() * W
      }
      ctx.globalAlpha = a < 0 ? 0 : a > 1 ? 1 : a
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }
  schedule()
}

function schedule() {
  if (raf || !visible || reduced || !stars.length) return
  last = performance.now()
  raf = requestAnimationFrame(frame)
}

function stop() {
  if (raf) {
    cancelAnimationFrame(raf)
    raf = 0
  }
}

function onVisibility() {
  if (document.hidden) stop()
  else schedule()
}

onMounted(() => {
  const el = canvas.value
  if (!el) return
  ctx = el.getContext('2d', { alpha: true }) ?? null
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resize()

  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => {
      resize()
      schedule()
    })
    ro.observe(el)
  }

  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? false
        if (visible) schedule()
        else stop()
      },
      { rootMargin: '120px' }
    )
    io.observe(el)
  }

  document.addEventListener('visibilitychange', onVisibility)
  if (!reduced) {
    // 静态帧:即使不跑动画也画出一次,避免 reduced-motion 下整片空白
    if (ctx) {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = props.color
      for (const s of stars) {
        ctx.globalAlpha = props.maxAlpha * s.base * 0.8
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }
    schedule()
  }
})

onBeforeUnmount(() => {
  stop()
  ro?.disconnect()
  ro = null
  io?.disconnect()
  io = null
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<template>
  <canvas ref="canvas" aria-hidden="true"></canvas>
</template>
