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

// 标题逐字:拆成独立字符,每字磁吸 + 呼吸式摇晃;glow 内的字符加蓝光
const titleChars = computed(() => Array.from(props.title))
const glowSet = computed(() => new Set(props.glow ?? []))

// 每字给一套不规则的「周期/幅度/相位」,避免整齐划一的规则摆动
function charSway(i: number) {
  return {
    animationDuration: `${(3.2 + ((i * 37) % 5) * 0.55).toFixed(2)}s`,
    animationDelay: `${(i * 0.24).toFixed(2)}s`,
    '--amp': `${(1.6 + ((i * 13) % 4) * 0.7).toFixed(2)}deg`,
    '--amp2': `${(0.9 + ((i * 29) % 3) * 0.55).toFixed(2)}deg`,
  } as Record<string, string>
}

const titleEl = ref<HTMLElement | null>(null)
let undoMag: Array<() => void> = []

onMounted(() => {
  gsap.utils
    .toArray<HTMLElement>('.heading-char', titleEl.value ?? undefined)
    .forEach((el) => {
      undoMag.push(magneticHover(el, { strength: 0.35, radius: 170 }))
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
      <span class="text-xs uppercase tracking-[0.35em] text-accent2">{{ kicker }}</span>
      <span v-if="align !== 'left'" class="h-px w-10 shrink-0 bg-accent"></span>
    </div>
    <h2 ref="titleEl" data-reveal data-reveal-from="up" :class="['font-display text-3xl font-medium text-ink sm:text-4xl', titleBlock]">
      <slot name="title">
        <span class="heading-title inline-flex flex-wrap">
          <span
            v-for="(c, i) in titleChars"
            :key="i"
            class="heading-char inline-block"
          >
            <span
              class="heading-char-inner inline-block"
              :class="{ 'heading-glow': glowSet.has(c) }"
              :style="charSway(i)"
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
/* 每个字的呼吸式摇晃:左右轻微摆动(内层承载,不干扰外层磁吸的 x/y) */
.heading-char-inner {
  display: inline-block;
  animation: heading-sway 3.4s ease-in-out infinite; /* 周期会被每字内联覆盖 */
}
@keyframes heading-sway {
  0%,
  100% {
    transform: rotate(calc(-1 * var(--amp, 2.4deg)));
  }
  26% {
    transform: rotate(calc(var(--amp2, 1.2deg) * -1.4));
  }
  62% {
    transform: rotate(calc(var(--amp, 2.4deg) * 0.9));
  }
}

/* glow 指定字符的柔和蓝光:呼吸式脉动 */
.heading-glow {
  color: #8ab4ff;
  animation: heading-glow-pulse 2.6s ease-in-out infinite;
}
@keyframes heading-glow-pulse {
  0%,
  100% {
    text-shadow: 0 0 6px rgba(138, 180, 255, 0.5), 0 0 16px rgba(138, 180, 255, 0.28);
  }
  50% {
    text-shadow: 0 0 12px rgba(138, 180, 255, 0.8), 0 0 28px rgba(138, 180, 255, 0.45);
  }
}
</style>
