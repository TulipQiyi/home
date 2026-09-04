<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import SectionHeading from './SectionHeading.vue'
import MdiIcon from './MdiIcon.vue'
import { gsap } from '../lib/gsap'
import { projects } from '../data/content'

// 开源区改为「横向穿越史诗」(参考:滚动史诗 · Act 2 横向穿越,ScrollTrigger pin + scrub)。
const wrap = ref<HTMLElement | null>(null)
let ctx: gsap.Context | undefined

onMounted(() => {
  const el = wrap.value
  if (!el) return
  ctx = gsap.context(() => {
    const track = el.querySelector('.horizon-track') as HTMLElement | null
    if (!track) return
    const over = () => Math.max(0, track.scrollWidth - el.clientWidth)
    gsap.to(track, {
      x: () => -over(),
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'center center',
        end: () => '+=' + over() * 1.8,
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
      },
    })
  }, el)
})

onBeforeUnmount(() => ctx?.revert())
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
            'group flex w-[min(70vw,260px)] shrink-0 flex-col rounded-2xl border border-line bg-surface/70 p-6 transition-colors',
            p.href ? 'hover:border-accent/60' : 'cursor-default',
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
    </div>
  </SectionHeading>
</template>
