import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { loadEnv } from 'vite'
import svgLoader from 'vite-svg-loader'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [
      vue(),
      vueDevTools(),
      svgLoader({
        svgo: true, // 是否使用 SVGO 优化（推荐开启）
        svgoConfig: {
          plugins: [
            { name: 'removeViewBox', active: false }, // 保留 viewBox
            { name: 'removeDimensions', active: true },
          ],
        },
        defaultImport: 'component', // 默认作为 Vue 组件导入（推荐）
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_TARGET_SERVER_URL, // 使用加载到的环境变量
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
