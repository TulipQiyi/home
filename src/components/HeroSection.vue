<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Typewriter from './Typewriter.vue'
import EmojiStack from './EmojiStack.vue'
import Starfield from './Starfield.vue'
import { gsap, scrollToEl, magneticHover } from '../lib/gsap'
import { roles } from '../data/content'
import heroBg from '../assets/images/background.avif'

// 逐字标题字符(空格用不换行空格保证 inline-block 宽度)
const nameChars = ['柒', '屹', '\u00A0', '·', '\u00A0', 'Q', 'i', 'y', 'i']

// 左侧半透明竖向关键词列
const keywords = ['Cloudery', 'Open Source', 'Terra', '竹像素', '栖所', '心灵驿站', 'HSP']

const arrow = ref<HTMLElement | null>(null)
let ctx: gsap.Context | undefined
let undoMag: Array<() => void> = []
let innerEl: HTMLElement | null = null

onMounted(() => {
  ctx = gsap.context(() => {
    // 首屏文案进入
    gsap.from('.hero-el', {
      autoAlpha: 0,
      y: 26,
      duration: 0.9,
      delay: 0.25,
      stagger: 0.16,
      ease: 'power3.out',
    })
    // 左侧字列淡入
    gsap.from('.hero-rail span', {
      autoAlpha: 0,
      y: -14,
      duration: 0.8,
      delay: 0.6,
      stagger: 0.06,
      ease: 'power3.out',
    })

    // 壁纸视差:滚动离开首屏时,背景缓慢错动,增加纵深
    gsap.to('.hero-bg', {
      yPercent: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
      },
    })

    // 逐字标题
    gsap.from('.hero-char', {
      y: 40,
      autoAlpha: 0,
      duration: 0.7,
      delay: 0.45,
      stagger: 0.05,
      ease: 'back.out(1.7)',
    })

    // 逐字磁吸:靠近标题字即被吸向光标(复用 magneticHover)
    gsap.utils.toArray<HTMLElement>('.hero-char').forEach((el) => {
      undoMag.push(magneticHover(el, { strength: 0.35, radius: 70 }))
    })

    // 磁吸交互:「向下探索」箭头
    if (arrow.value) {
      innerEl = arrow.value.querySelector('span') as HTMLElement | null
      undoMag.push(magneticHover(arrow.value, { strength: 0.4, radius: 80, inner: innerEl }))
    }
  }, document.getElementById('hero') as HTMLElement)
})

onBeforeUnmount(() => {
  ctx?.revert()
  undoMag.forEach((fn) => fn())
  undoMag = []
})

function scrollTo(id: string) {
  scrollToEl(`#${id}`)
}
</script>

<template>
  <header id="hero" class="relative min-h-svh overflow-hidden">
    <!-- 动漫壁纸铺底(hero-bg 用于视差) -->
    <img
      :src="heroBg"
      alt=""
      aria-hidden="true"
      class="hero-bg absolute inset-0 h-full w-full object-cover will-change-transform scale-120"
    />
    <!-- 深色遮罩:左下最实,保证文字可读又保持氛围 -->
    <div
      class="pointer-events-none absolute inset-0 bg-gradient-to-t from-base/85 via-base/45 to-transparent"
      aria-hidden="true"
    ></div>
    <div
      class="pointer-events-none absolute inset-0 bg-gradient-to-r from-base/70 via-transparent to-transparent"
      aria-hidden="true"
    ></div>

    <!-- 星空粒子:浮在遮罩之上、文字之下 -->
    <Starfield
      :count="140"
      color="#ffffff"
      :max-alpha="0.7"
      :speed="4"
      :drift="3"
      class="pointer-events-none absolute inset-0 z-[5] h-full w-full"
    />

    <!-- 左侧半透明竖向关键词列 -->
    <div
      class="hero-rail pointer-events-none absolute bottom-1/2 left-5 z-10 flex flex-col items-center gap-6 text-faint/50 [writing-mode:vertical-rl] sm:left-14"
      aria-hidden="true"
    >
      <span v-for="k in keywords" :key="k" class="text-xs tracking-[0.5em]">{{ k }}</span>
    </div>

    <!-- 左下主信息 -->
    <div
      class="relative z-10 flex min-h-svh flex-col justify-end px-6 pb-20 text-left sm:px-14"
    >
      <p class="hero-el mb-3 text-xs tracking-[0.4em] text-faint">CLOUDERY · QIYI</p>

      <!-- 逐字标题:整体呼吸(hero-title) + 逐字磁吸(hero-char) + 逐字微光(hero-char-inner) -->
      <h1 class="hero-title relative inline-flex font-display text-5xl font-medium tracking-wide text-ink sm:text-6xl">
        <span
          v-for="(ch, i) in nameChars"
          :key="i"
          class="hero-char inline-block"
        >
          <span
            class="hero-char-inner inline-block"
            :class="ch === '·' ? 'text-accent' : ''"
            :style="{ animationDelay: `${(i * 0.22).toFixed(2)}s` }"
            >{{ ch }}</span
          >
        </span>
      </h1>

      <p class="hero-el mt-4 h-8 text-lg text-soft sm:text-xl">
        <Typewriter :phrases="roles" />
      </p>

      <p class="hero-el mt-5 max-w-xl text-base leading-relaxed text-soft">
        一个喜欢把复杂问题变简单的学生。
        <br class="hidden sm:block" />
        在代码里安静地成长,为同样走得辛苦的人留一盏灯。
      </p>

      <div class="hero-el mt-8 flex flex-wrap items-center gap-6">
        <EmojiStack :icons="['laptop', 'flowerTulip', 'gamepad', 'pickaxe']" />
        <a
          ref="arrow"
          href="#about"
          @click.prevent="scrollTo('about')"
          class="group inline-flex items-center gap-2 text-sm text-faint transition-colors hover:text-soft"
        >
          <span class="tracking-widest">向下探索</span>
          <span class="arrow-glow text-xl leading-none transition-transform duration-500 group-hover:translate-y-1">↓</span>
        </a>
      </div>
    </div>

    <!-- 动能滚动条已移到 App(首屏与 about 之间) -->
  </header>
</template>

<style scoped>
/* 整体呼吸:标题整行统一纵向起伏 + 轻微缩放,像活着 */
.hero-title {
  position: relative;
  animation: hero-breathe 5.5s ease-in-out infinite;
}
@keyframes hero-breathe {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-4px) scale(1.015);
  }
}

/* 逐字微光:每个字各自错峰点亮,藏着微光 */
.hero-char-inner {
  display: inline-block;
  animation: hero-shimmer 4.4s ease-in-out infinite;
}
@keyframes hero-shimmer {
  0%,
  100% {
    opacity: 0.94;
  }
  50% {
    opacity: 1;
  }
}

/* 向下探索箭头:呼吸式淡蓝光晕,指引感 */
.arrow-glow {
  color: #8ab4ff;
  animation: arrow-glow 2.8s ease-in-out infinite;
}
@keyframes arrow-glow {
  0%,
  100% {
    text-shadow: 0 0 4px rgba(138, 180, 255, 0.4), 0 2px 10px rgba(138, 180, 255, 0.25);
    transform: translateY(0);
  }
  50% {
    text-shadow: 0 0 10px rgba(138, 180, 255, 0.85), 0 3px 18px rgba(138, 180, 255, 0.5);
    transform: translateY(3px);
  }
}
</style>
