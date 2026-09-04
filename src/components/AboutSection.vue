<script setup lang="ts">
import SectionHeading from './SectionHeading.vue'
import MarqueeDivider from './MarqueeDivider.vue'
import MdiIcon from './MdiIcon.vue'

const points = [
  {
    icon: 'puzzleOutline',
    title: '把复杂的事变简单',
    body: '我享受自己学习和写代码的过程,不喜欢过于花里胡哨的东西。够用,才是真理。',
  },
  {
    icon: 'messageText',
    title: '安静,但懂得相处',
    body: '我是男生,然而心思细腻。平时话不多,一旦遇到知己,就会变得非常健谈。',
  },
  {
    icon: 'sprout',
    title: '热爱生活,也习惯跌倒',
    body: '我热爱生活,却常常被生活的琐事打倒。一次次重新站起来,是我成长的经历。',
  },
]
</script>

<template>
  <SectionHeading id="about" kicker="About" title="你好,我是柒屹" :glow="['柒', '屹']" align="left">
    <p data-reveal data-reveal-from="up" class="max-w-3xl text-lg leading-relaxed text-soft">
      一名<span class="text-ink">在读学生</span>,在互联网上较为活跃,网名「
      <span class="text-ink">柒屹</span>(Qiyi) 」,是<span class="text-accent">云术工作室(Cloudery Studio)</span>的核心成员。
      我擅长多种编程语言与框架,也喜欢把复杂的问题简单化。
    </p>

    <div class="mt-10 grid gap-6 sm:grid-cols-3">
      <article
        v-for="p in points"
        :key="p.title"
        data-reveal
        data-reveal-from="up"
        class="rounded-2xl border border-line bg-surface/60 p-6"
      >
        <div class="mb-3 text-accent2" aria-hidden="true">
          <MdiIcon :name="p.icon" :size="28" />
        </div>
        <h3 class="mb-2 font-medium text-ink">{{ p.title }}</h3>
        <p class="text-sm leading-relaxed text-soft">{{ p.body }}</p>
      </article>
    </div>
  </SectionHeading>
  <div class="inset-x-0 bottom-0">
    <MarqueeDivider direction="right" unit="了解你自己，也是成长的一步"/>
  </div>
</template>
