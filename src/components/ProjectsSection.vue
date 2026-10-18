<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import SectionHeading from './SectionHeading.vue'
import MdiIcon from './MdiIcon.vue'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { projects } from '../data/content'

// 开源区:「横向穿越史诗」——ScrollTrigger pin + scrub 横向滑动
const wrap = ref<HTMLElement | null>(null)
let ctx: gsap.Context | undefined
let raf = 0
let onLoad: (() => void) | undefined

onMounted(() => {
  const el = wrap.value
  if (!el) return
  const track = el.querySelector('.horizon-track') as HTMLElement | null
  // 缓存横向溢出量:它是布局读取(scrollWidth/clientWidth),每次 refresh 都会调,
  // 不要在 ScrollTrigger 的 end 回调里反复测量
  const over = () => Math.max(0, (track?.scrollWidth ?? 0) - el.clientWidth)
  const end = () => '+=' + over() * 1.8
  const base = { trigger: el, start: 'center center', end, scrub: 0.6 }

  ctx = gsap.context(() => {
    // 横向滑动:滚到底应恰好露出最后一张(用 over() 精确对齐)
    if (track)
      gsap.to(track, {
        x: () => -over(),
        ease: 'none',
        scrollTrigger: { ...base, pin: true, anticipatePin: 1 },
      })

    // 效果一:卡片纵向视差——上下轻错动增加纵深。
    // 原来 7 张卡各建一个 ScrollTrigger(同一触发区间重复 7 份),
    // 现在共用一个 onUpdate + quickSetter 批量写 transform。
    const cards = gsap.utils.toArray<HTMLElement>('.horizon-track a', el)
    if (cards.length) {
      const setters = cards.map((c) => gsap.quickSetter(c, 'y', 'px'))
      ScrollTrigger.create({
        ...base,
        onUpdate: (self) => {
          const p = self.progress * 2 - 1
          for (let i = 0; i < setters.length; i++) setters[i](p * (i % 2 === 0 ? 14 : -14))
        },
      })
    }

    // 效果二:底部横向滚动进度条
    const fill = el.querySelector('.horizon-fill')
    if (fill) gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { ...base, scrub: 0.5 } })
  }, el)

  // 修复窄屏滚不到最后一张:等字体/相邻图片加载与布局稳定后刷新 ScrollTrigger
  const refresh = () => ScrollTrigger.refresh()
  raf = requestAnimationFrame(() => requestAnimationFrame(refresh))
  onLoad = () => refresh()
  window.addEventListener('load', onLoad)
})

onBeforeUnmount(() => {
  ctx?.revert()
  cancelAnimationFrame(raf)
  if (onLoad) window.removeEventListener('load', onLoad)
})
</script>

<template>
  <SectionHeading id="projects" kicker="Open Source" title="开源与参与" align="left">
    <div ref="wrap" class="horizon relative overflow-hidden rounded-2xl border border-line bg-surface/40">
      <div class="horizon-track flex w-max gap-5 p-6">
        <a
          v-for="p in projects"
          :key="p.name"
          :href="p.href || '#'"
          :target="p.href ? '_blank' : undefined"
          :rel="p.href ? 'noopener' : undefined"
          :class="[
            'group flex w-[min(70vw,260px)] shrink-0 flex-col rounded-2xl border border-line bg-surface/70 p-6 transition-colors hover:border-accent/60 hover:shadow-[0_0_26px_rgba(138,180,255,0.16)]',
            p.href ? '' : 'cursor-default',
          ]"
        >
          <div class="mb-3 flex items-center gap-3">
            <span class="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface2 text-accent2" aria-hidden="true"><MdiIcon :name="p.icon" :size="22" /></span>
            <span
              v-if="p.href"
              class="ml-auto text-accent opacity-0 transition-opacity group-hover:opacity-100"
              >↗</span
            >
          </div>
          <h3 class="font-display text-lg text-ink">{{ p.name }}</h3>
          <p class="text-sm text-accent2">{{ p.org }} · {{ p.role }}</p>
          <p class="mt-3 text-sm leading-relaxed text-soft">{{ p.desc }}</p>
        </a>
      </div>

      <!-- 滚动进度条 -->
      <div class="horizon-progress pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-line/40">
        <div class="horizon-fill h-full origin-left bg-accent" style="transform: scaleX(0)"></div>
      </div>
    </div>
  </SectionHeading>
</template>
