<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const glow = ref<HTMLElement | null>(null)

let raf = 0
let targetX = -9999
let targetY = -9999
let x = -9999
let y = -9999
let finePointer = false
let lastFrame = 0

function tick(now: number) {
  raf = 0
  // 帧率无关的缓动:60Hz 与 120Hz 上跟随速度一致
  const dt = Math.min((now - lastFrame) / 16.667, 3)
  lastFrame = now
  const k = 1 - Math.pow(1 - 0.09, dt)
  x += (targetX - x) * k
  y += (targetY - y) * k
  if (glow.value) {
    glow.value.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
  }
  // 已经贴合光标就停掉 rAF,等下一次 mousemove 再唤醒(此前是永久 60fps 空转)
  if (Math.abs(targetX - x) > 0.15 || Math.abs(targetY - y) > 0.15) schedule()
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(tick)
}

function onMove(e: MouseEvent) {
  targetX = e.clientX
  targetY = e.clientY
  if (x < -9000) {
    // 首次进入:直接落到光标位置,避免从屏幕外滑进来
    x = targetX
    y = targetY
  }
  lastFrame = performance.now()
  schedule()
}

onMounted(() => {
  finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (finePointer) {
    glow.value?.classList.add('enabled')
    window.addEventListener('mousemove', onMove, { passive: true })
  }
})

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  window.removeEventListener('mousemove', onMove)
})
</script>

<template>
  <div ref="glow" class="cursor-glow" aria-hidden="true"></div>
</template>
