<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap, scrollToEl } from '../lib/gsap'
import ThemeToggle from './ThemeToggle.vue'
import MdiIcon from './MdiIcon.vue'

const nav = [
  { id: 'about', label: '关于' },
  { id: 'skills', label: '技术' },
  { id: 'projects', label: '开源' },
  { id: 'server', label: '服务器' },
  { id: 'interests', label: '爱好' },
  { id: 'support', label: '心理' },
]

const root = ref<HTMLElement | null>(null)
const scrolled = ref(false)
let ctx: gsap.Context | undefined

function onScroll() {
  scrolled.value = window.scrollY > 48
}

function go(id: string) {
  scrollToEl(`#${id}`)
}

function goHome() {
  scrollToEl(0, 0)
}

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from(root.value, { y: -70, autoAlpha: 0, duration: 0.7, ease: 'power3.out' })
  }, root.value ?? undefined)
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  ctx?.revert()
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <nav
    ref="root"
    class="fixed inset-x-0 top-0 z-30 flex justify-center transition-all duration-500"
    :class="scrolled ? 'px-4 pt-3' : 'pt-1'"
  >
    <div
      class="flex items-center justify-between transition-all duration-500 text-ink"
      :class="
        scrolled
          ? 'w-full max-w-md rounded-full border border-line bg-base/85 px-5 py-2 shadow-lg backdrop-blur'
          : 'w-full max-w-4xl border-b border-line bg-base/70 px-5 py-3 backdrop-blur sm:px-6 rounded-4xl'
      "
    >
      <button type="button" class="flex items-center gap-2" aria-label="回到顶部" @click="goHome()">
        <span class="text-xl transition-all" aria-hidden="true"><MdiIcon name="flowerTulip" :size="24" /></span>
        <span class="font-display font-medium">{{ scrolled ? '柒屹' : '柒屹 Qiyi' }}</span>
      </button>

      <div v-if="!scrolled" class="hidden items-center gap-6 text-sm text-soft md:flex">
        <button
          v-for="item in nav"
          :key="item.id"
          type="button"
          class="transition-colors hover:text-accent"
          @click="go(item.id)"
        >
          {{ item.label }}
        </button>
      </div>

      <ThemeToggle />
    </div>
  </nav>
</template>
