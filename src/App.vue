<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import CursorDot from './components/CursorDot.vue'
import BackdropPattern from './components/BackdropPattern.vue'
import TopBar from './components/TopBar.vue'
import HeroSection from './components/HeroSection.vue'
import MarqueeDivider from './components/MarqueeDivider.vue'
import AboutSection from './components/AboutSection.vue'
import SkillsSection from './components/SkillsSection.vue'
import ProjectsSection from './components/ProjectsSection.vue'
import ServerSection from './components/ServerSection.vue'
import InterestsSection from './components/InterestsSection.vue'
import SupportSection from './components/SupportSection.vue'
import FooterSection from './components/FooterSection.vue'
import Starfield from './components/Starfield.vue'

import { initReveals, animateTulips, initSmoothScroll } from './lib/gsap'

let smoother: ReturnType<typeof initSmoothScroll> | undefined

onMounted(() => {
  smoother = initSmoothScroll()
  initReveals()
  animateTulips()
})

onBeforeUnmount(() => {
  smoother?.kill()
})
</script>

<template>
  <CursorDot />
  <BackdropPattern />
  <TopBar />

  <!-- ScrollSmoother 的滚动容器:content 会被自动包进 #smooth-wrapper 做平滑滚动 -->
  <div id="smooth-content">
    <main>
      <HeroSection />
            <!-- 柔和星空:浮在内容背后 -->
      <Starfield
        :count="280"
        color="#f2e6d8"
        :max-alpha="0.5"
        :speed="0.8"
        :drift="2"
        class="pointer-events-none absolute inset-0 h-full w-full"
      />
      <MarqueeDivider direction="left" />
      <div class="pt-14">
        <div class="divide-y divide-line">
          <AboutSection />
          <SkillsSection />
          <ProjectsSection />
          <ServerSection />
          <InterestsSection />
          <SupportSection />
        </div>
      </div>
    </main>

    <FooterSection />
  </div>
</template>
