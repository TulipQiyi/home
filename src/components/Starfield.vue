<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

// 星空粒子:canvas 原生 rAF,闪烁 + 缓慢下飘(不依赖 GSAP,轻量流畅)。
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

function initStars() {
  stars = Array.from({ length: props.count }, () => ({
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
  const parent = el?.parentElement
  if (!el || !parent) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  W = parent.clientWidth
  H = parent.clientHeight
  el.width = Math.round(W * dpr)
  el.height = Math.round(H * dpr)
  el.style.width = W + 'px'
  el.style.height = H + 'px'
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  initStars()
}

function frame(now: number) {
  const dt = Math.min((now - last) / 1000, 0.05)
  last = now
  t += dt
  if (ctx) {
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
      ctx.globalAlpha = Math.max(0, Math.min(1, a))
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }
  raf = requestAnimationFrame(frame)
}

onMounted(() => {
  ctx = canvas.value?.getContext('2d') ?? null
  resize()
  window.addEventListener('resize', resize)
  raf = requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <canvas ref="canvas" aria-hidden="true"></canvas>
</template>
