import Path from "path";
import fs from "fs";
// 写一个类似vite-aliases的插件,将src所有目录进行别名控制



function getFiles(dir) {
    const files = fs.readdirSync(dir)
    return files.filter(file => {
        // 可以防止mac系统的.DS_Store文件出现和文件的出现,statSync会返回一个对象，isFile()是判断是否是文件
      return file !== '.DS_Store'  &&  !fs.statSync(Path.resolve(__dirname,"../",file)).isFile()
    })
}

export default ()=>{
    let srcDir = getFiles(Path.resolve(__dirname, "../"))
    let obj = {
        '@': Path.resolve(__dirname, '../'),
    }
    srcDir.map(item=>{
        let name = `@${item}`
         obj[name]=Path.resolve(__dirname, "../", item)
    })
    //将对象组装成这样的形式
    /**
     * {
        '@': '/Users/yanzhenyu/Desktop/vue3基础学习/vite-demo/src',
        '@assets': '/Users/yanzhenyu/Desktop/vue3基础学习/vite-demo/src/assets',
        '@config': '/Users/yanzhenyu/Desktop/vue3基础学习/vite-demo/src/config',
        '@css': '/Users/yanzhenyu/Desktop/vue3基础学习/vite-demo/src/css',
        '@js': '/Users/yanzhenyu/Desktop/vue3基础学习/vite-demo/src/js',
        '@views': '/Users/yanzhenyu/Desktop/vue3基础学习/vite-demo/src/views'
        }
     */
    return {
        // config会在解析vite配置前调用，config是一个vite.config.js的配置对象，env是中的command是命令，mode是模式，和vite.config.js中的配置对象是一样的
        // 返回一个配置对象(会合并到vite.config.js中的配置对象)
       
        config:(config,env)=>({ 
            resolve:{
                alias:obj
            }
        })
    }
}