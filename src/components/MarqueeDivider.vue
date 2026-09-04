<script setup lang="ts">
// 「公告条」动能滚动:轨道 = 两份完全相同的文本 span(w-max),位移 -50% = 恰好一份,
// 两半逐字一致 → 无缝循环,无重复跳变。每份重复多段公告,保证比视口宽。

const props = defineProps({
  unit: { type: String, default: "欢迎来到柒屹的小屋" },
  repeats: { type: Number, default: 6 },
  direction: { type: String, default: 'left' }, // 'left' | 'right'
})

const text = Array.from({ length: props.repeats }, () => props.unit).join(' · ')
</script>

<template>
  <div class="relative overflow-hidden border-y border-line bg-surface/60 py-1" aria-hidden="true">
    <div
      class="marquee-mover flex w-max items-center whitespace-nowrap will-change-transform"
      :class="props.direction === 'right' ? 'dir-right' : 'dir-left'"
    >
      <span class="px-8 tracking-[0.5em] text-accent2">{{ text }}</span>
      <span class="px-8 tracking-[0.5em] text-accent2" aria-hidden="true">{{ text }}</span>
    </div>
  </div>
</template>

<style scoped>
/* 轨道位移 -50% = 一份文本宽,两份完全一致 → 无缝,无 repeat 跳变 */
@keyframes left {
  from {
    transform: translateX(-50%);
  }
  to {
    transform: translateX(0%);
  }
}
@keyframes right {
  from {
    transform: translateX(0%);
  }
  to {
    transform: translateX(-50%);
  }
}
.marquee-mover.dir-left {
  animation: left 18s linear infinite;
}
.marquee-mover.dir-right {
  animation: right 18s linear infinite;
}
</style>
