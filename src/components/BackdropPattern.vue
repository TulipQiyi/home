<script setup lang="ts">
import MdiIcon from './MdiIcon.vue'
// 背景「花纹」:细点阵 + 顶部柔光 + 几朵远虚的郁金香。
// 郁金香的滚动视差由 App 里的 animateTulips 统一控制(单独 scrub tween,不会回弹)。
</script>

<template>
  <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
    <!-- 细点阵纹理 -->
    <div
      class="absolute inset-0 opacity-[0.16]"
      :style="{
        backgroundImage:
          'radial-gradient(var(--line) 1px, transparent 1px), radial-gradient(var(--line) 1px, transparent 1px)',
        backgroundSize: '26px 26px, 26px 26px',
        backgroundPosition: '0 0, 13px 13px',
      }"
    ></div>

    <!-- 顶部一抹柔光 -->
    <div
      class="absolute inset-x-0 top-0 h-80"
      :style="{
        background: 'linear-gradient(to bottom, var(--accent2), transparent)',
        opacity: '0.10',
      }"
    ></div>

    <!-- 远虚的郁金香花纹(单独做滚动视差) -->
    <MdiIcon name="flowerTulip" :size="'9rem'" class="tulip absolute -left-8 top-[12%] opacity-[0.08] blur-[2px]" :style="{ color: 'var(--accent)' }" />
    <MdiIcon name="flowerTulip" :size="'11rem'" class="tulip absolute -right-10 top-[42%] opacity-[0.06] blur-[3px]" :style="{ color: 'var(--accent2)' }" />
    <MdiIcon name="flowerTulip" :size="'7rem'" class="tulip absolute bottom-[8%] left-[16%] opacity-[0.07] blur-[2px]" :style="{ color: 'var(--accent)' }" />
    <MdiIcon name="flowerTulip" :size="'5rem'" class="tulip absolute right-[12%] bottom-[18%] opacity-[0.05]" :style="{ color: 'var(--accent2)' }" />
  </div>
</template>
