<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{ phrases: string[]; speed?: number }>()

const typeSpeed = props.speed ?? 75
const deleteSpeed = 45
const holdMs = 1700

const text = ref('')
let phase: 'type' | 'hold' | 'delete' = 'type'
let phrase = 0
let alive = true
let timer: ReturnType<typeof setTimeout> | undefined

// 单链条状态机:type → hold → delete → 下一句 …，同一时刻只有一条定时器链，
// 避免「反复删除 / 只删最后一个字」的重叠现象。
function tick() {
  if (!alive) return
  const cur = props.phrases[phrase] ?? ''

  if (phase === 'type') {
    if (text.value.length < cur.length) {
      text.value = cur.slice(0, text.value.length + 1)
      timer = setTimeout(tick, typeSpeed)
    } else {
      phase = 'hold'
      timer = setTimeout(tick, holdMs)
    }
  } else if (phase === 'hold') {
    phase = 'delete'
    timer = setTimeout(tick, deleteSpeed)
  } else if (text.value.length === 0) {
    phrase = (phrase + 1) % props.phrases.length
    phase = 'type'
    timer = setTimeout(tick, typeSpeed)
  } else {
    text.value = cur.slice(0, text.value.length - 1)
    timer = setTimeout(tick, deleteSpeed)
  }
}

timer = setTimeout(tick, 600)

onBeforeUnmount(() => {
  alive = false
  if (timer) clearTimeout(timer)
})

const caretHidden = computed(() => !alive)
</script>

<template>
  <span class="inline-flex whitespace-nowrap">
    <span>{{ text }}</span>
    <span class="caret" :class="{ hide: caretHidden }">▍</span>
  </span>
</template>

<style scoped>
.caret {
  margin-left: 1px;
  color: var(--accent);
  animation: blink 1s step-end infinite;
}
.caret.hide {
  animation: none;
  opacity: 0.4;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}
</style>
