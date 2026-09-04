<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import SectionHeading from './SectionHeading.vue'
import EmojiStack from './EmojiStack.vue'
import MarqueeDivider from './MarqueeDivider.vue'
import { gsap, magneticHover } from '../lib/gsap'

// 结尾引言:逐字出现 + 发蓝色光;整段仍带磁吸。
const QUOTE = '“生活的琐事会把我击倒，然而，我已经很熟练去重新站起来了。”'
// 空格转不换行空格,保证每个 inline-block 字符都保留宽度
const quoteChars = [...QUOTE].map((c) => (c === ' ' ? '\u00A0' : c))

const quoteEl = ref<HTMLElement | null>(null)
let ctx: gsap.Context | undefined
let undoMag: (() => void) | undefined

onMounted(() => {
  const q = quoteEl.value
  if (!q) return
  undoMag = magneticHover(q, { xStrength: 0.3, yStrength: 0.8, radius: 500 })

  ctx = gsap.context(() => {
    // 逐字淡入(duration 错开小,顺滑不抢戏)
    gsap.from('.q-char', {
      autoAlpha: 0,
      y: 6,
      duration: 0.45,
      stagger: 0.05,
      ease: 'power2.out',
      scrollTrigger: { trigger: q, start: 'top 85%', once: true },
    })
  }, q)
})

onBeforeUnmount(() => {
  ctx?.revert()
  undoMag?.()
})
</script>

<template>
  <SectionHeading id="support" kicker="Heart" title="关于高敏感与心理" align="center">
    <div class="relative">
    <div class="grid gap-6 sm:grid-cols-2">
      <div data-reveal data-reveal-from="up" class="rounded-2xl border border-line bg-surface/60 p-6">
        <h3 class="mb-2 font-medium text-ink">我自己,也是其中之一</h3>
        <p class="text-sm leading-relaxed text-soft">
          我属于<span class="text-ink">高敏感人群(HSP)</span>,也正经历着
          <span class="text-ink">中度抑郁</span>与<span class="text-ink">中度焦虑</span>。
          这些不是标签,是真实的生活。我懂那种「明明用力生活,却一次次被打倒」的感受。
        </p>
      </div>
      <div data-reveal data-reveal-from="up" class="rounded-2xl border border-accent/40 bg-accent/5 p-6">
        <h3 class="mb-2 font-medium text-ink">所以,我想做点什么</h3>
        <p class="text-sm leading-relaxed text-soft">
          我用实际行动,去支持和我相似的心理障碍人群 ——
          比如云术工作室的「<span class="text-accent">qisoul · 栖所</span>」「
          <span class="text-accent">psychology · 心灵驿站</span>」。
          如果你也需要一盏灯,我在这里。
        </p>
      </div>
    </div>

    <div data-reveal data-reveal-from="up" class="mt-8 flex justify-center">
      <EmojiStack :icons="['flowerTulip', 'heart', 'gift']" />
    </div>

    <p
      ref="quoteEl"
      class="mt-8 text-center font-display text-lg italic text-soft"
    >
      <span
        v-for="(c, i) in quoteChars"
        :key="i"
        class="q-char q-glow inline-block"
        >{{ c }}</span
      >
    </p>
      </div>
  </SectionHeading>
  <div class="inset-x-0 bottom-0">
    <MarqueeDivider direction="left" unit="人会说谎，心灵不会说谎"/>
  </div>
</template>

<style scoped>
/* 蓝色光晕:柔和呼吸 */
@keyframes q-glow-pulse {
  0%,
  100% {
    text-shadow: 0 0 5px rgba(120, 168, 255, 0.35), 0 0 12px rgba(120, 168, 255, 0.2);
  }
  50% {
    text-shadow: 0 0 12px rgba(120, 168, 255, 0.85), 0 0 26px rgba(120, 168, 255, 0.45);
  }
}
.q-glow {
  animation: q-glow-pulse 2.6s ease-in-out infinite;
}
</style>
