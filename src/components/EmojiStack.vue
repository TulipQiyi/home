<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import MdiIcon from './MdiIcon.vue'
import { gsap } from '../lib/gsap'

defineProps<{
  icons: string[]
  size?: string
  tile?: string
}>()

const root = ref<HTMLElement | null>(null)
let ctx: gsap.Context | undefined

onMounted(() => {
  ctx = gsap.context(() => {
    const tiles = gsap.utils.toArray<HTMLElement>('.emoji-tile', root.value ?? undefined)
    tiles.forEach((tile) => {
      tile.addEventListener('mouseenter', () =>
        gsap.to(tile, { y: -8, scale: 1.16, duration: 0.3, overwrite: 'auto', ease: 'power2.out' }),
      )
      tile.addEventListener('mouseleave', () =>
        gsap.to(tile, { y: 0, scale: 1, duration: 0.4, overwrite: 'auto', ease: 'power2.out' }),
      )
    })
  }, root.value ?? undefined)
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <div ref="root" class="flex items-center" aria-hidden="true">
    <span
      v-for="(ic, i) in icons"
      :key="i"
      class="emoji-tile flex items-center justify-center rounded-full border border-line bg-surface2 text-ink shadow-sm transition-colors hover:border-accent/60"
      :style="{
        width: tile ?? '3.2rem',
        height: tile ?? '3.2rem',
        marginLeft: i ? '-0.85rem' : '0',
        zIndex: icons.length - i,
      }"
    >
      <MdiIcon :name="ic" :size="size ?? '1.5rem'" />
    </span>
  </div>
</template>

<style scoped>
/* 图标块:hover 位移由 GSAP 负责,不再常驻呼吸动画 */
</style>
