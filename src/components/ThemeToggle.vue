<script setup lang="ts">
import { useTheme } from '../composables/useTheme'
import type { ThemeMode } from '../composables/useTheme'

const { mode } = useTheme()

const options: { value: ThemeMode; label: string }[] = [
  { value: 'dark', label: '暗' },
  { value: 'system', label: '自动' },
  { value: 'light', label: '亮' },
]
</script>

<template>
  <div
    class="flex items-center gap-1 rounded-full border border-line bg-surface/70 p-1 text-xs backdrop-blur"
    role="radiogroup"
    aria-label="主题切换"
  >
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      role="radio"
      :aria-checked="mode === opt.value"
      @click="mode = opt.value"
      class="rounded-full px-3 py-1 transition-colors"
      :class="mode === opt.value ? 'bg-accent text-base' : 'text-soft hover:text-ink'"
    >
      {{ opt.label }}
    </button>
  </div>
</template>
