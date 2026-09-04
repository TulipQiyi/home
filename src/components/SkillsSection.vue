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

onMounted(() => {
  ctx = gsap.context(() => {
    // 每行独立无缝滚动:对整行(内含两份拷贝)做 xPercent 0→-50 循环,相邻行方向交错、时长各不同
    gsap.utils.toArray<HTMLElement>('.marquee-line', root.value ?? undefined).forEach((el, i) => {
      const dir = i % 2 === 0 ? 1 : -1
      gsap.fromTo(
        el,
        { xPercent: dir > 0 ? -50 : 0 },
        { xPercent: dir > 0 ? 0 : -50, duration: 20 + ((i * 13) % 12) * 4, ease: 'none', repeat: -1 }
      )
    })

    // 鼠标视差:每行随鼠标 y 轻微错动
    const rows = gsap.utils.toArray<HTMLElement>('.marquee-line', root.value ?? undefined)
    const quickRow = rows.map((row, i) => gsap.quickTo(row, 'y', { duration: 0.6 + i * 0.1, ease: 'power2.out' }))
    onWinMove = (e: MouseEvent) => {
      const center = window.innerHeight / 2
      const m = ((e.clientY - center) / center) * 18
      quickRow.forEach((fn, i) => fn((i % 2 === 0 ? m : -m) * (0.6 + i * 0.2)))
    }
    window.addEventListener('mousemove', onWinMove)

    // 滚动视差:整段滚过时,每行额外做方向交错的横向漂移,增强背景纵深
    gsap.utils.toArray<HTMLElement>('.marquee-line', root.value ?? undefined).forEach((el, i) => {
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
  }, root.value ?? undefined)
})

onBeforeUnmount(() => {
  ctx?.revert()
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
          class="rounded-2xl border border-line bg-surface/70 p-6"
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
              v-for="item in group.items"
              :key="item"
              class="rounded-full border border-line bg-surface2 px-3 py-1 text-sm text-soft"
            >
              {{ item }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </SectionHeading>
</template>
