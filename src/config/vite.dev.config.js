// 开发环境配置
import { defineConfig } from 'vite'

export default defineConfig({
    optimizeDeps: {
        exclude: [] // 配置不需要预构建的依赖
    }
})