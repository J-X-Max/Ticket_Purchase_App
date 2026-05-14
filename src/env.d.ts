declare module 'swiper/css' {
  const css: any;
  export default css;
}
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
// 为 import.meta.env 添加类型声明
interface ImportMetaEnv {
  readonly VITE_TENCENT_MAP_KEY: string
  // 如果有其他环境变量，可以继续添加
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}