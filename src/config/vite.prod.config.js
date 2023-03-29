// 生产环境配置
import { defineConfig } from 'vite'

export default defineConfig({
    // 生产环境的配置(打包后的文件存在hash值就是为了解决打包后的文件重名)
    build:{
        minify:false, // 压缩代码
        rollupOptions:{ // 配置rollup的构建策略，详细配置参考https://rollupjs.org/command-line-interface/
           output:{
            assetFileNames: "[hash].[name].[ext]", // 配置静态资源的文件名
            manualChunks(id){ // id就是每个文件的路径,这个时候对文件路径进行单独打包处理，不把文件生成可以变化的hash文件
                if(id.includes('node_modules')){
                    return 'vendor' // 表示把所有的node_modules文件打包到一个vender文件中，这个这些文件就不会经常请求了
                }
           }}
        },
        assetsInlineLimit:40960,// 低于40k的图片都会被打包成为base64位的图片打包后的静态资源目录名
        // outDir:"testdir", // 打包后的文件目录名
        // assetsDir:"static"   // 打包后静态资源存放的位置
    }
})