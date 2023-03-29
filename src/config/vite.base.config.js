// 生产和开发环境共有的配置
import { defineConfig } from 'vite'
import Path from 'path'
import postcssPresetEnv from "postcss-preset-env"
import myFirstPlugins from '../js/myFirstPlugins.js'
import { createHtmlPlugin } from 'vite-plugin-html'
import myVitePluginHtml from '../js/myVitePluginHtml.js'
import { viteMockServe } from "vite-plugin-mock"
import checker from 'vite-plugin-checker'
export default defineConfig({
    envPrefix: 'VITE_', // 自定义环境变量的前缀
    css:{
        modules:{ // css模块化的配置
            localsConvention:'camelCaseOnly',// css模块化的命名规则
            // scopeBehaviour: "local", // 配置当前的模块化是全局还是局部（local，global）
            generateScopedName: "[name]__[local]___[hash:base64:5]",// 配置生成的类名【name: 文件名 // local: 类名】【可以为函数形式】
            hashPrefix: "my-custom-hash", // 给生成的hash前面加上自定义的前缀
            // globalModulePaths: [], // 配置哪些文件是全局的(不想让这些文件参与到模块化中)  例如：[/node_modules/]
            
        },
        preprocessorOptions:{ // 预处理器的配置(less、sass、stylus)
            less:{ // 如果没有使用构建工具，也可以单独使用lessc编译less文件。配置less以参考 https://less.bootcss.com/usage/#less-options 官网进行配置
                math: "always", // 配置less的数学运算
                globalVars: { // 配置全局变量
                    minColor: "#1DA57A" // 配置全局颜色，然后使用 @{primary}进行引用
                },
                
            },
            sass:{},
        },
        postcss:{
            plugins: [postcssPresetEnv()]
        
        },
        devSourcemap: true
       
    },
    // resolve:{
    //     alias:{ // 配置别名(解决文件深层次嵌套的问题)
    //         "@": Path.resolve(__dirname, "/src"),
    //     }
    // },
    plugins:[
        myFirstPlugins(),
        // createHtmlPlugin({ // 想index.html中注入一些数据的官方插件
        //     inject: {
        //         data:{
        //             title:'vite-demo'
        //         }
        //     }
        // }),
        myVitePluginHtml({ // 想index.html中注入一些数据的自定义插件
            inject: {
                data:{
                    title:'vite-demo',
                    name:'kukupa'
                }
            }
        }),
       viteMockServe(),
       checker({ typescript:true })
    ],
}) 