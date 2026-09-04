import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

export type ThemeMode = 'dark' | 'light' | 'system'

const STORAGE_KEY = 'qiyi-theme'
const media = window.matchMedia('(prefers-color-scheme: dark)')

function resolve(mode: ThemeMode): 'dark' | 'light' {
  return mode === 'system' ? (media.matches ? 'dark' : 'light') : mode
}

function storedMode(): ThemeMode {
  const v = localStorage.getItem(STORAGE_KEY)
  if (v === 'dark' || v === 'light' || v === 'system') return v
  return 'dark' // 默认静谧暗色
}

const mode = ref<ThemeMode>(storedMode())

function apply(m: ThemeMode) {
  const resolved = resolve(m)
  const root = document.documentElement
  root.dataset.theme = resolved
  // 允许亮色主题下覆盖 dark 模式(例如滚动条、表单控件)
  root.style.colorScheme = resolved
}

// 跟随系统的变化
function onMediaChange() {
  apply(mode.value)
}

watch(mode, (m) => {
  localStorage.setItem(STORAGE_KEY, m)
  apply(m)
}, { immediate: true })

onMounted(() => media.addEventListener('change', onMediaChange))
onBeforeUnmount(() => media.removeEventListener('change', onMediaChange))

export function useTheme() {
  return { mode }
}
