<script setup lang="ts">
import SectionHeading from './SectionHeading.vue'
import bambooImg from '../assets/images/bamboopixel.avif'

const features = [
  { label: '公益', dot: 'bg-accent' },
  { label: '周目制', dot: 'bg-accent2' },
  { label: '新手友好', dot: 'bg-accent' },
  { label: '特色鲜明', dot: 'bg-accent2' },
]

// 玩家说过的话 —— 随滚动一句句浮现
const quotes = [
  { text: '这里很安静，像回家的感觉。', who: '—— 一位常驻老玩家' },
  { text: '第一次来就喜欢上这个服，大家都很好相处。', who: '—— 新来的玩家' },
  { text: '慢节奏生存，是下了班最想去的地方。', who: '—— 打工党' },
  { text: '一起造房子，build 到天黑。', who: '—— 建筑玩家' },
  { text: '服务器的氛围真好，来了就不想走。', who: '—— 周末党' },
]
</script>

<template>
  <SectionHeading id="server" kicker="Server" title="「竹像素」公益服" align="right">
    <!-- 宽幅电影感的展示面板:字幕压在图底;仅用 data-reveal 淡入上移(与全站一致),不做滚动缩放 -->
    <div
      data-reveal
      data-reveal-from="up"
      class="relative overflow-hidden rounded-2xl border border-line bg-surface/60 shadow-lg"
    >
      <img
        :src="bambooImg"
        alt="「竹像素」服务器展示图"
        class="block aspect-video w-full object-cover"
      />
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-t from-base/85 via-base/25 to-transparent"
        aria-hidden="true"
      ></div>
      <div class="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <a
          href="https://mczxs.cn"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs uppercase tracking-[0.3em] text-accent2 transition-colors hover:text-accent"
        >Bamboo Pixel</a>
        <h3 class="mt-1 font-display text-2xl text-ink sm:text-3xl">竹像素</h3>
        <div class="mt-1.5 flex flex-wrap gap-3">
          <span
            v-for="f in features"
            :key="f.label"
            class="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1 text-sm text-soft"
          >
            <span class="h-2 w-2 rounded-full" :class="f.dot"></span>
            {{ f.label }}
          </span>
        </div>
        <p class="mt-1.5 max-w-lg text-sm leading-relaxed text-soft">
          半公益MC服务器。绿色、安静、像竹林一样让人安心 —— 人虽然不多,但也够了
        </p>
      </div>
    </div>

    <!-- 玩家说过的话:随滚动一句句浮现 -->
    <div class="mt-8 space-y-5 border-l border-accent/30 pl-5">
      <blockquote
        v-for="q in quotes"
        :key="q.who"
        data-reveal
        data-reveal-from="up"
        class="border-b border-line pb-4"
      >
        <p class="font-display text-base italic leading-relaxed text-ink">「{{ q.text }}」</p>
        <footer class="mt-1 text-xs text-faint">{{ q.who }}</footer>
      </blockquote>
    </div>
  </SectionHeading>
</template>
