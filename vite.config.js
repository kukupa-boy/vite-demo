// defineConfig是用来定义配置的 
import {defineConfig} from 'vite'
import viteBaseConfig from './src/config/vite.base.config'
import viteDevConfig from './src/config/vite.dev.config'
import viteProdConfig from './src/config/vite.prod.config'
import { loadEnv } from 'vite'

// 策略模式
const envResolve = {
    "build":(mode)=>{
        
        return {...viteBaseConfig,...viteProdConfig}
    }, 
    "serve":(mode)=>{
        console.log({...viteBaseConfig,...viteDevConfig})
       return ({...viteBaseConfig,...viteDevConfig})
    
    } 
}
// command是用来判断当前的命令行命令是什么的,其值["build","serve",...],对应packages.json中的dev和build
// mode是用来判断当前的环境是什么的，--mode = ”环境名“
// 可以通过 --mode来指定环境 
export default defineConfig(({command,mode})=>{
        // 开始进行环境变量的注入
        loadEnv(mode,process.cwd(),'.env')
        return envResolve[command](mode)
})













