<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap, magneticHover } from '../lib/gsap'

const props = defineProps<{
  id: string
  kicker: string
  title: string
  align?: 'left' | 'right' | 'center'
  glow?: string[]
}>()

const align = computed(() => props.align ?? 'left')

const kickerBlock = computed(() => {
  const base = 'mb-4 flex items-center gap-3'
  if (align.value === 'center') return `${base} justify-center`
  if (align.value === 'right') return `${base} justify-end`
  return base
})
const titleBlock = computed(() => {
  if (align.value === 'center') return 'text-center'
  if (align.value === 'right') return 'text-right'
  return 'text-left'
})

// 标题逐字:拆成独立字符供磁吸;glow 内的字符加蓝光。整体呼吸由 .heading-title 统一负责
const titleChars = computed(() => Array.from(props.title))
const glowSet = computed(() => new Set(props.glow ?? []))

const titleEl = ref<HTMLElement | null>(null)
let undoMag: Array<() => void> = []

onMounted(() => {
  gsap.utils
    .toArray<HTMLElement>('.heading-char', titleEl.value ?? undefined)
    .forEach((el) => {
      undoMag.push(magneticHover(el, { strength: 0.35, radius: 50 }))
    })
})

onBeforeUnmount(() => {
  undoMag.forEach((fn) => fn())
  undoMag = []
})
</script>

<template>
  <section :id="id" class="relative mx-auto w-full max-w-4xl px-6 py-24 sm:py-28">
    <div data-reveal data-reveal-from="up" :class="kickerBlock">
      <span v-if="align !== 'right'" class="h-px w-10 shrink-0 bg-accent"></span>
      <span class="heading-kicker text-xs uppercase tracking-[0.35em] text-accent2">{{ kicker }}</span>
      <span v-if="align !== 'left'" class="h-px w-10 shrink-0 bg-accent"></span>
    </div>
    <h2 ref="titleEl" data-reveal data-reveal-from="up" :class="['font-display text-3xl font-medium text-ink sm:text-4xl', titleBlock]">
      <slot name="title">
        <span class="heading-title inline-flex flex-wrap">
          <span v-for="(c, i) in titleChars" :key="i" class="heading-char inline-block">
            <span
              class="heading-char-inner inline-block"
              :class="{ 'heading-glow': glowSet.has(c) }"
              >{{ c }}</span
            >
          </span>
        </span>
      </slot>
    </h2>
    <div class="mt-12">
      <slot />
    </div>
  </section>
</template>

<style scoped>
/* 整体呼吸:整行标题统一纵向起伏 + 轻微缩放,带一点呼吸感 */
.heading-title {
  position: relative;
  animation: heading-breathe 5.5s ease-in-out infinite;
}
@keyframes heading-breathe {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-4px) scale(1.02);
  }
}

.heading-char-inner {
  display: inline-block;
}

/* glow 指定字符的柔和蓝光:静态阴影(此前逐帧重绘 text-shadow,是样式重算的主要来源之一) */
.heading-glow {
  color: #8ab4ff;
  text-shadow:
    0 0 8px rgba(138, 180, 255, 0.55),
    0 0 20px rgba(138, 180, 255, 0.3);
}
</style>
