<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import SectionHeading from './SectionHeading.vue'
import MdiIcon from './MdiIcon.vue'
import { gsap } from '../lib/gsap'
import { skillGroups } from '../data/content'

// 动能文字网格背景:多行关键词无缝循环滚动(参考:动能文字滚动网格背景)
const words = ['JavaScript', 'TypeScript', 'C#', 'Lua', 'Rust', 'Vue', 'React', 'Tailwind', 'Vite', 'GSAP', 'Spring', 'Java', 'Python', 'Go', 'Svelte', 'Node.js', 'Express', 'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes']
const copy = words.join('  ·  ')
// 两份拷贝,滚动 -50% = 一份拷贝宽,循环无缝
const marqueeText = copy + '  ·  ' + copy

// 铺多少行动能文字(整段纵向均布)
const ROWS = 5

const root = ref<HTMLElement | null>(null)
let ctx: gsap.Context | undefined
let onWinMove: ((e: MouseEvent) => void) | undefined
let io: IntersectionObserver | null = null
let onVis: (() => void) | undefined

onMounted(() => {
  ctx = gsap.context(() => {
    const rows = gsap.utils.toArray<HTMLElement>('.marquee-line', root.value ?? undefined)

    // 每行独立无缝滚动:对整行(内含两份拷贝)做 xPercent 0→-50 循环,相邻行方向交错、时长各不同
    const loops = rows.map((el, i) => {
      const dir = i % 2 === 0 ? 1 : -1
      return gsap.fromTo(
        el,
        { xPercent: dir > 0 ? -50 : 0 },
        { xPercent: dir > 0 ? 0 : -50, duration: 20 + ((i * 13) % 12) * 4, ease: 'none', repeat: -1 }
      )
    })

    // 鼠标视差:每行随鼠标 y 轻微错动
    const quickRow = rows.map((row, i) => gsap.quickTo(row, 'y', { duration: 0.6 + i * 0.1, ease: 'power2.out' }))
    onWinMove = (e: MouseEvent) => {
      const center = window.innerHeight / 2
      const m = ((e.clientY - center) / center) * 18
      quickRow.forEach((fn, i) => fn((i % 2 === 0 ? m : -m) * (0.6 + i * 0.2)))
    }
    window.addEventListener('mousemove', onWinMove, { passive: true })

    // 滚动视差:整段滚过时,每行额外做方向交错的横向漂移,增强背景纵深
    rows.forEach((el, i) => {
      const dir = i % 2 === 0 ? 1 : -1
      gsap.fromTo(
        el,
        { x: dir * 90 },
        {
          x: -dir * 90,
          ease: 'none',
          scrollTrigger: {
            trigger: root.value,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        }
      )
    })

    // 整段离开视口时挂起 5 条无限循环 tween:它们本来全天候跑,
    // 但用户看不到 —— 滚回来再恢复,视觉完全一致
    const host = root.value
    if (host && typeof IntersectionObserver !== 'undefined') {
      let running = true
      io = new IntersectionObserver(
        (entries) => {
          const on = entries[0]?.isIntersecting ?? false
          if (on === running) return
          running = on
          loops.forEach((t) => (on ? t.play() : t.pause()))
        },
        { rootMargin: '200px' }
      )
      io.observe(host)

      onVis = () => {
        if (document.hidden) loops.forEach((t) => t.pause())
        else if (running) loops.forEach((t) => t.play())
      }
      document.addEventListener('visibilitychange', onVis)
    }
  }, root.value ?? undefined)
})

onBeforeUnmount(() => {
  ctx?.revert()
  io?.disconnect()
  io = null
  if (onVis) document.removeEventListener('visibilitychange', onVis)
  if (onWinMove) window.removeEventListener('mousemove', onWinMove)
})
</script>

<template>
  <SectionHeading id="skills" kicker="Skills" title="技术栈" align="right">
    <div ref="root">
      <!-- 动能文字网格背景:锚定整段(section 是定位上下文),多行铺满整段、横贯整屏 -->
      <div class="pointer-events-none absolute inset-0 left-1/2 w-[100vw] -translate-x-1/2 overflow-hidden opacity-[0.09]" aria-hidden="true">
        <div class="flex h-full flex-col justify-center gap-18">
          <div v-for="i in ROWS" :key="i" class="marquee-line flex h-10 w-max whitespace-nowrap">
            <span class="marquee-content font-mono text-3xl" :class="i % 2 === 0 ? 'text-accent' : 'text-accent2'">{{ marqueeText }}</span>
            <span class="marquee-content font-mono text-3xl" :class="i % 2 === 0 ? 'text-accent' : 'text-accent2'" aria-hidden="true">{{ marqueeText }}</span>
          </div>
        </div>
      </div>

      <div class="relative z-10 grid gap-8">
        <div
          v-for="group in skillGroups"
          :key="group.title"
          data-reveal
          data-reveal-from="up"
          class="rounded-2xl border border-line bg-surface/70 p-6 transition-colors hover:border-accent/40 hover:shadow-[0_0_26px_rgba(138,180,255,0.14)]"
        >
          <div class="mb-1 flex items-center gap-3">
            <span class="grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface2 text-accent" aria-hidden="true"><MdiIcon :name="group.icon" :size="26" /></span>
            <div>
              <h3 class="font-medium text-ink">{{ group.title }}</h3>
              <p class="text-sm text-faint">{{ group.note }}</p>
            </div>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="(item, j) in group.items"
              :key="item"
              class="chip-shimmer rounded-full border border-line bg-surface2 px-3 py-1 text-sm text-soft"
              :style="{ animationDelay: `${(j * 0.12).toFixed(2)}s` }"
            >
              {{ item }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </SectionHeading>
</template>

<style scoped>
/* 技能 chips:入场时逐项错峰淡入(一次性),不再常驻 infinite 呼吸 */
.chip-shimmer {
  animation: chip-in 0.5s ease-out both;
}
@keyframes chip-in {
  from {
    opacity: 0.72;
  }
  to {
    opacity: 1;
  }
}
</style>
