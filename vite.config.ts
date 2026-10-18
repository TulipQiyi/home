import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // GSAP 与图标集体积大、变更频率低,拆成独立 chunk:
        // 业务代码改动时这两个 vendor 包仍能命中浏览器缓存
        manualChunks(id: string) {
          if (id.includes('node_modules/gsap')) return 'gsap'
          if (id.includes('node_modules/@mdi/js') || id.includes('node_modules/@jamescoyle'))
            return 'icons'
          // vue 运行时单独一块,保证上面两块升级时它不用重新下载
          if (id.includes('node_modules/vue') || id.includes('node_modules/@vue/'))
            return 'vue'
        },
      },
    },
  },
})
