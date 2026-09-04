<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const glow = ref<HTMLElement | null>(null)

let raf = 0
let targetX = -9999
let targetY = -9999
let x = -9999
let y = -9999
let finePointer = false

function tick() {
  // 缓动跟随,营造「柔和光」而不是生硬追踪
  x += (targetX - x) * 0.09
  y += (targetY - y) * 0.09
  if (glow.value) {
    glow.value.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
  }
  raf = requestAnimationFrame(tick)
}

function onMove(e: MouseEvent) {
  targetX = e.clientX
  targetY = e.clientY
}

onMounted(() => {
  finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (finePointer) {
    glow.value?.classList.add('enabled')
    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(tick)
  }
})

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
  window.removeEventListener('mousemove', onMove)
})
</script>

<template>
  <div ref="glow" class="cursor-glow" aria-hidden="true"></div>
</template>
