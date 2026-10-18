<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import SectionHeading from './SectionHeading.vue'
import MarqueeDivider from './MarqueeDivider.vue'
import MdiIcon from './MdiIcon.vue'
import { gsap } from '../lib/gsap'
import { games } from '../data/content'

// 郁金香照片(1–5)
import tulip1 from '../assets/images/tulip/1.avif'
import tulip2 from '../assets/images/tulip/2.avif'
import tulip3 from '../assets/images/tulip/3.avif'
import tulip4 from '../assets/images/tulip/4.avif'
import tulip5 from '../assets/images/tulip/5.avif'
const tulips = [tulip1, tulip2, tulip3, tulip4, tulip5]

// 最爱(我的世界)置顶,其余双列
const favorite = games.find((g) => g.highlight) ?? games[0]
const others = games.filter((g) => g !== favorite)

const gallery = ref<HTMLElement | null>(null)
let ctx: gsap.Context | undefined

onMounted(() => {
  const el = gallery.value
  if (!el) return
  ctx = gsap.context(() => {
    // 逐张淡入;clearProps 使结束时不残留内联 transform,让 CSS 悬停正常生效
    gsap.from('.tulip-img', {
      autoAlpha: 0,
      y: 24,
      duration: 0.2,
      stagger: 0.02,
      ease: 'power2.out',
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    })
  }, el)
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <SectionHeading id="interests" kicker="Interests" title="游戏与喜欢的事" align="left">
    <div class="grid gap-10">
      <div class="grid gap-6">
        <!-- 最爱置顶卡片:我的世界 -->
        <div
          data-reveal
          data-reveal-from="up"
          class="flex items-center gap-4 rounded-2xl border border-accent/40 bg-accent/5 p-5 sm:p-6"
        >
          <span class="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-accent/30 bg-surface/60 text-accent" aria-hidden="true"><MdiIcon :name="favorite.icon" :size="30" /></span>
          <div class="min-w-0">
            <p class="text-xs uppercase tracking-[0.3em] text-accent2">最爱 · Favorite</p>
            <h3 class="mt-0.5 font-display text-xl text-ink sm:text-2xl">{{ favorite.name }}</h3>
            <p class="mt-1 text-sm leading-relaxed text-soft">{{ favorite.note }}</p>
          </div>
        </div>

        <!-- 其余游戏:双列卡片 -->
        <div class="grid gap-4 sm:grid-cols-2">
          <div
            v-for="g in others"
            :key="g.name"
            data-reveal
            data-reveal-from="up"
            class="group flex items-center gap-4 rounded-2xl border border-line bg-surface/60 p-4 transition-transform hover:-translate-y-1 hover:border-accent/50 sm:p-5"
          >
            <span class="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-line bg-surface2 text-ink" aria-hidden="true"><MdiIcon :name="g.icon" :size="26" /></span>
            <div class="min-w-0">
              <h4 class="font-medium text-ink">{{ g.name }}</h4>
              <p class="text-sm text-faint">{{ g.note }}</p>
            </div>
          </div>
        </div>
      </div>

      <div
        data-reveal
        data-reveal-from="up"
        class="rounded-2xl border border-line bg-surface/60 p-6"
      >
        <div class="flex items-center gap-6">
          <div class="text-4xl" aria-hidden="true"><MdiIcon name="flowerTulipOutline" :size="48" /></div>
          <div>
            <h3 class="font-medium text-ink">我还喜欢...郁金香</h3>
            <p class="mt-1 text-sm leading-relaxed text-soft">
              安静、克制、不张扬,却认真,也是我眼中的爱 —— 像我想成为的样子。整个主页的基调就是一朵郁金香。
            </p>
          </div>
        </div>

        <!-- 郁金香照片展示:5 宫格缩略图 -->
        <div ref="gallery" class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <img
            v-for="(t, i) in tulips"
            :key="i"
            :src="t"
            :alt="`郁金香照片 ${i + 1}`"
            loading="lazy"
            decoding="async"
            class="tulip-img aspect-square w-full rounded-xl border border-line object-cover shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.04] hover:border-accent/50"
          />
        </div>
      </div>
    </div>
  </SectionHeading>
  <div class="inset-x-0 bottom-0">
    <MarqueeDivider direction="right" unit="与真心共赏"/>
  </div>
</template>

<style scoped>
/* 郁金香照片:揭示动画已负责淡入,这里不再常驻呼吸 */
.tulip-img {
  display: block;
}
</style>
