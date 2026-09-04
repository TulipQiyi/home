<script setup lang="ts"></script>

<template>
  <footer class="border-t border-line">
    <div class="mx-auto flex max-w-4xl flex-col items-center gap-5 px-6 py-12 text-center text-sm text-faint">
      <!-- 站内链接:博客 · 工作室官网 · 竹像素官网 -->
      <nav class="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
        <a
          href="https://qiyisblog.cldery.com"
          target="_blank"
          rel="noopener noreferrer"
          class="font-medium text-soft transition-colors hover:text-accent"
        >博客 Blog</a>
        <a
          href="https://cldery.com"
          target="_blank"
          rel="noopener noreferrer"
          class="font-medium text-soft transition-colors hover:text-accent"
        >云术工作室 Cloudery Studio</a>
        <a
          href="https://mczxs.cn"
          target="_blank"
          rel="noopener noreferrer"
          class="font-medium text-soft transition-colors hover:text-accent"
        >竹像素官网</a>
      </nav>

      <p class="text-soft">
        柒屹 Qiyi <span class="accent-dot">·</span> © {{ new Date().getFullYear() }} All rights reserved
      </p>
      <p>· 使生如夏花之绚烂，死如秋叶之静美 ·</p>
      <p class="text-xs">Designed with ♥ · Powered by
        <a href="https://vitejs.dev/" target="_blank" rel="noopener noreferrer" class="text-accent">Vite</a>
      </p>
    </div>
  </footer>
</template>

<style scoped>
.accent-dot {
  color: var(--accent);
}
</style>
