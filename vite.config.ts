import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// https://vite.dev/config/
export default defineConfig({
  base: './',   // 关键！所有资源用相对路径，适配任何部署子目录,./相对路径表示从当前目录寻找,/绝对路径表示从根目录寻找
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        // 这里注入你的全局变量文件。
        // 注意：路径别名 @ 需要在 resolve.alias 中配置（Vite项目通常已默认配置）。
        additionalData: `@use "@/styles/variables.scss" as *;`
        // 如果使用 @import 语法，则写：
        // additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      '/geocoder': {
        target: 'https://apis.map.qq.com/ws',
        changeOrigin: true,
        //rewrite: (path) => path.replace(/^\/geocoder/, '')  // 根据需要保留或移除
      }
    }
  }
})
