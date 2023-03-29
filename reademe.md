## 序言：一个关于从0构建vite的项目

参考：https://www.bilibili.com/video/BV1GN4y1M7P5?p=35&spm_id_from=pageDriver&vd_source=467abf3314f0151429ff8cf49b97a8de

## 1. vite的背景

### 1.1.浏览器原生中的ESM

1. 浏览器中的import模块导入

   * `import b from "./b.js"`
   * import会响后台地址发送一个ip地址 + /b.js的 请求
2. 浏览器中支持import异步导出

   import('./b.js').then(module => {

   console.log(module);

   // 获取请求地址的元数据，包括请求地址

   console.log(import.meta)

   });
3. 浏览器不支持原生js的裸模块导入（只有名字，没有对应的路径）

   import {a} from 'b'; // 假如b是node_modules中的一个包


### 1.2 vite比较webpack的优势

​	vite相对于webpack**启动更快**

* 因为webpack支持多种模块化（import，require）【所有webpack的兼容性更好，webpack关注于服务端，vite关注于浏览器端】，会将所有的模块转换为webpack_require()，会将所有依赖文件读一遍，而vite【使用vite中要使用esm的语法】只会根据entry按需加载
* vite 使用esmodule，其预构建比webpack更快

### 1.3. vite脚手架和vite

* **脚手架**：对vue、post-css、less、babel，通过vite进行集成，形成一台开箱即用的工具
* **vite**，集合各种工具形成项目的一种整合工具

### 1.4. vite的特性

1. 使用预编译的方式，将**所有的依赖都打包到一个文件中**，减少http请求（原生浏览器不支持对node_module的导入，就是因为代码依赖层级太多，会发起多个http请求）

​	

```js
// vite.config.js中配置
optimizeDeps:{
	exclude:['引入第三方文件.js'] 
}
// 如果将引入第三方文件的js不通过预编译，可能会在浏览器中发起对所有对第三方文件中的所有模块的单个请求（参考lodash-es这个包）
```



1. 使用esbuild进行预编译，将第三方其他规范的代码转换为esm规范的代码
2. 路径问题(当看到非绝对路径和相对路径，vite开启代码补全)，在预构建时，将代码放入到vite，deps中，然后通过/vite/dps/xxx.js的方式进行访问

## 2. 使用vite

### 2.1. vite构建项目

1. 安装vite包

2. 在根目录下新建index.html模板html,和main.js入口文件
   ```html
   // index.html
   	<script type="module" src="main.js">
   ```

3. 在package.json中script中新建“run"：“vite"

4. 运行npm run dev

   

### 2.2. vite区分打包环境

```js
# 将vite代码拆分为 vite.base.config.js, vite.prod.config.js, vite.dev.config.js 三个文件

# vite.base.config.js (公共配置)

		export default defineConfig({

    })


# vite.prod.config.js (生产配置)

    export default defineConfig({

    })
	

# vite.dev.config.js （开发环境）

    export default defineConfig({

    })

# vite.config.js （主文件）

		// defineConfig是用来定义配置的 
    import {defineConfig} from 'vite'
    import viteBaseConfig from './src/config/vite.base.config'
    import viteDevConfig from './src/config/vite.dev.config'
    import viteProdConfig from './src/config/vite.prod.config'

    // 策略模式
    const envResolve = {
        "build":()=>{
            console.log("生产环境")
            return {...viteBaseConfig,...viteProdConfig}
        }, 
        "serve":()=>{
            console.log("开发环境")
            return {...viteBaseConfig,...viteDevConfig} // 记住，dev不能有base中同名的对象，否则会覆盖掉base中同名的对象

        } 
    }

    // command是用来判断当前的命令是什么的,其值["build","serve",...],对应packages.json中的dev和build

    export default defineConfig(({command})=>{ 
       return envResolve[command]()
    })

# package.json 配置开发和生产的启动命令
    "scripts": {
      "dev":"vite serve",
      "build":"vite build"
    },
```



### 2.3. vite环境变量的配置



```markdown

# 使用在mode判断当前的环境变量

	export default defineConfig(({command,mode})=>{
        loadEnv(mode,process.cwd(),'.env')
        return envResolve[command](mode)
})

# mode变量的来源
	
	1.可以在package.json script中定义mode
		
		"dev":"vite serve --mode development",
	
	2. 可以在命令行指定mode
	
		 yarn dev --mode development
		 
	3. mode变量如果不指定，生产环境默认为development，开发环境为production
	

# 定义环境变量存放的文件

--
	注意：要与mode的名字一样。
	1. .env,vite中默认的环境变量文件（公共的环境变量）
	2. .env.production（生产环境变量）
	3. .env.development （开发环境变量）
--

# vite如何处理环境变量

	1. 内置dotenv库: 启动项目时用来读取.env文件中的环境变量，然后将其注入到process中
	2.  envDir: .env文件所在的目录 -- > 也可以通过envDir来指定.env文件所在的目录或者文件
--end

# loadEnv的使用

1. vite考虑到和其他配置的冲突问题，不会直接注入,此时还没有放入到process中 （比如baseconfig和envconfig都配置了envDir）
	
2. 使用loadEnv手动注入：在主文件vite.config.js中，手动导入loadEnv方法，然后手动注入环境变量
		import { loadEnv } from 'vite'
    const env = loadEnv(mode, process.cwd(), '.env')
    
当使用loadEnv时候:
  1.会将.env文件中的环境变量注入到process中和import.meta.env，
   2.然后读取mode变量对应的development文件，和env文件进行拼接，一起注入到process中（所以同名的变量中.env.development中的变量会替换.env中的变量）

# 客户端访问

html：<h1>%VITE_IS_NAME%</h1>
js: import.meta.env.VITE_IS_NAME
	注意：vite做了一层拦截，如果环境变量不是以VITE_开头的,不会注入到客户端中去
	如果我们不想以VITE_开头，可以在vite.config.js中配置envPrefix: '自定义前缀'
-

# 服务端访问
	process.env.环境变量 

# 注意：vite将commonjs转换为esm，但是在脚手架(vite)启动的时候，node在读取vite.config.js的时候，会先使用commonjs取解析，如果遇到esm规范，会将其替换为commonjs规范（replace替换），也可以在项目的pakeage.json中配置type: "module"，node解析的时候，会先使用esm规范解析，如果遇到commonjs规范，会将其替换为esm规范（replace替换）

```



### 2.4 浏览器解析.vue文件

vite如何让浏览器识别vue文件的：（vite直接import .vue文件）， 相当于把.vue文件当成静态资源开放，通过/xxx.vue这种请求后缀向后台服务器发起请求这个.vue文件，这个时候的.vue是在给浏览器之前是经过编译后的（.vue性质的文件其实是编译成js‘文件的），所以浏览器是可以识别的（vite在返回给浏览器之前进行vue模板替换）



### 2.5 vite对css文件处理和使用

vite对css的处理是默认支持的，不需要安装任何插件， 浏览器并不直接支持css_module，需要借助插件来实现，vite默认使用的是vite-plugin-css-modules,webpack默认使用的是css-loader



 1. 处理过程（这样存在全局变量污染的问题）

    * 1.当vite遇见css，通过fs模块获取其内容

    * 2.将css内容转换为js脚本

      类似这样的形式

      import { createHotContext as __vite__createHotContext }

      export default __vite__css

    * 创建style标签，将其插入到index.html中

      <style type="text/css" data-vite-dev-id="/vue-demo/node_modules/animate.css/animate.css"></style>

 2. 解决全局变量污染

    * 运行时隔离【手动给css都加上前缀，保证每个css变量都是唯一的】
    * 编译时隔离【css文件进行模块化，每个css文件都是一个模块【典型：scoped，css_module】】

 3. Scoped【vue-loader中的解决方案，将变量和应用都加上data-xxx，保证唯一性】

    * ```html
      <!--编译前-->
      <style scoped> 
      .guang { 
          color: red; 
      } 
      </style>  
      <template>  
          <div class="guang">hi</div>  
      </template>
      ```

      

    

    * ```html
      <!-- 编译后 -->
      <style> 
      .guang[data-v-f3f3eg9] 
      { 
          color: red; 
      } 
      </style> 
      <template> 
          <div class="guang" data-v-f3f3eg9>hi</div> 
      </template>
      ```

      

 4. Css_module

    * ```html
      <!-- 编译前 -->
      <style module> 
      .guang {
          color: red; 
      } 
      </style>  
      <template>
          <p :class="$style.guang">hi</p>  
      </template>
      ```

      

    * ```html
      <!-- 编译后 -->
      <style module>
      ._1yZGjg0pYkMbaHPr4wT6P__1 { 
          color: red; 
      } 
      </style> 
      <template> 
          <p class="_1yZGjg0pYkMbaHPr4wT6P__1">hi</p> 
      </template>
      ```

 5. Css_module原理

    * ```js
      // 通过特殊语法处理，将编译后的变量名进行导出
      
      :local(.continueButton) {
        color: green;
      }
      编译成
      
      :export {
        continueButton: __buttons_continueButton_djd347adcxz9;
      }
      .__buttons_continueButton_djd347adcxz9 {
        color: green;
      }
      ```

      

 6. vite对css文件的相关使用

    * vite默认是开启css_module，不需要默认引入css_module的相关插件（需要定义css文件为.module.css结尾）

      #### 	使用module.css的结果

      * ```css
        text1渲染为粉色，text2渲染为红色
        /*text1.css*/
          .divOne{
              background-color: pink;
              color: #fff;
              padding: 10px;
              margin: 10px;
              border: 1px solid #000;
          }
        
        /*text2.css*/
          .divOne{
              background-color: red;
              color: #fff;
              padding: 10px;
              margin: 10px;
              border: 1px solid #000;
          }
        
        /* text1.js */
          import * as style from "../css/test1.module.css";
          const div1 = document.createElement("div");
          div1.className = style.divOne;
          document.body.appendChild(div1);
        
        /*text2.js*/
          import * as style from "../css/test2.module.css";
          const div2 = document.createElement("div");
          div2.className = style.divOne;
          document.body.appendChild(div2);
        
        /* mains.js */
          import  "./src/js/test1.js"
          import   "./src/js/test2.js"
        ```

        

      #### 	 不使用module.css的结果

      * ```css
        如果不用.module.css结尾，最后渲染出来的两个div的背景颜色都为red，这就是变量污染
        
        /*text1.css*/
          .divOne{
              background-color: pink;
              color: #fff;
              padding: 10px;
              margin: 10px;
              border: 1px solid #000;
          }
        
        /*text2.css*/
          .divOne{
              background-color: red;
              color: #fff;
              padding: 10px;
              margin: 10px;
              border: 1px solid #000;
          }
        
        /* text1.js */
          import "../css/test1.css";
          const div1 = document.createElement("div");
          div1.className = "divOne";
          document.body.appendChild(div1);
        
        /*text2.js*/
          import "../css/test2.css";
          const div2 = document.createElement("div");
          div2.className = "divOne";
          document.body.appendChild(div2);
        
        /* mains.js */
          import  "./src/js/test1.js"
          import   "./src/js/test2.js"
        ```

        

        

        

    * vite默认是支持less等语法的，（需要安装less相关包）（需要定义css文件为.module.less结尾）

    

## 3. vite中对css的配置

### 3.1. css.modules

​	

```js
export default defineConfig({
    css:{ // 对css默认行为的配置
      modules:{ // 配置css模块化
        	localsConvention: "camelCase", // 将css类名转换为驼峰命名(保留原来的属性名)
            scopeBehaviour: "local", // 配置当前的模块化是全局还是局部（local，global）
            generateScopedName: "[name]__[local]___[hash:base64:5]", // 配置生成的类名【name: 文件名 // local: 类名】
            hashPrefix: "my-custom-hash", // 给生成的hash前面加上自定义的前缀
            globalModulePaths: [], // 配置哪些文件是全局的(不想让这些文件参与到模块化中)  例如：[/node_modules/]
      }
    }
}) 
```

​	

### 3.2. css.preprocssOptions

```js
 preprocessorOptions: { // 配置其他的css框架
            less:{ // 如果没有使用构建工具，也可以单独使用lessc编译less文件。配置less以参考https://less.bootcss.com/usage/#less-options官网进行配置
                math: "always" // 配置less的数学运算
                globalVars: { // 配置全局变量
                    primary: "#333" // 配置全局颜色，然后使用@primary进行引用
                },
                
            },
            sass:{},
        },
```

​	****

### 3.3. css.devSourceMap

​	**sourceMap用于调试，如果不需要调试，可以不配置，如果不设置sourcemap，无法定位正确的报错信息，如果配置了可以查看到源文件的报错**

### 3.4. css.postcss

```markdown

# 使用它的原因
 
 	1.postcss（vite天生对postcss有和好的支持）
 	2.css预处理器（less，sass，stylus）不能处理（兼容性）的问题
 	3. 嵌套，变量，函数处理为原生css【less可以做】
	4. 处理css降级的问题
	5. 前缀补全
	注意：postcss不能处理less,sass,stylus等语法，需要less转换后的css，然后交给postcss处理
#  postcss的使用1
	安装：npm i postcss-cli postcss
 	配置：postcss:{ // 配置postcss的插件
            plugins:[postcssPresetEnv()] 
         }
  	}，
# postcss的使用2
 	    你也可以在vite.config.js中配置postcss(优先级postcss.config.js高)
-- 注意importFrom已经失效
      
# autoprefix,它和postcss-preset-env区别
   
	1.postcss-preset-env 和 autoprefixer 都是 PostCSS 插件，用于对 CSS 进行处理。
	2.autoprefixer 主要用于自动添加浏览器前缀，例如将 CSS 中的 display: flex 自动转换为 -webkit-display: flex 和 -ms-display: flex 等等，以确保在不同浏览器下的兼容性。
	3.postcss-preset-env 的功能比 autoprefixer 更加强大，它支持使用最新的 CSS 语法，例如 CSS Variables、nesting、@apply 等等。除此之外，它还支持更广泛的浏览器兼容性，支持更多的 CSS 特性，因为它的功能不仅仅是添加前缀，还包括将不支持的 CSS 特性转换为浏览器能够理解的语法。
	4.因此，如果只需要处理浏览器前缀，那么使用 autoprefixer 就可以了；如果需要更加完整地支持最新的 CSS 语法，并且希望兼容更多的浏览器，那么可以使用 postcss-preset-env


```



## 4. vite处理静态资源

```js
// 1.vite处理图片的打包
import a from "./src/image.png" ==>a是一个图片路径
import a from "./src/image.png?raw" ==> a是一个二进制的buffer（svg中会使用）

 	// vite对svg的处理1
		// 这样的引入不是一个字体图标
   import dealSvg1 from "../assets/svg/illustration.svg"
  
    let svg1 = document.createElement("img")
    svg1.src = dealSvg1
    svg1.style.width= "100px"
    svg1.style.height= "100px"
    document.body.appendChild(svg1)
  
  //  vite对svg的处理2
	  import dealSvg2 from "../assets/svg/illustration.svg?raw";
  let svg2 = document.createElement("div")
  svg2.style.width= "100px"
  svg2.style.height= "100px"
  svg2.innerHTML = dealSvg2
  document.body.appendChild(svg2);

	


// 2.vite加载json会自动处理为json对象
import dealJson from "../../package.json"
-- 这样写利于treesharking（打包工具会自动帮你不需要的变量进行移除），不需要将json文件里面的东西全部导入



// 3.resolve.alias配置别名对象(解决目录层级深嵌套的问题)
resolve:{
  alias:{
    "@":path.resolve(__dirname,"./src")
  }
}

resolve.alias的原理：拿取viteconfig中的alias，当请求的时候将@替换为alias中的@的路径，然后拼接后面的路径（形成一个完整的路径），然后返回


 // 4.生产环境的配置(打包后的文件存在hash值就是为了解决打包后的文件重名)

    build:{
        rollupOptions:{ // 配置rollup的构建策略，详细配置参考https://rollupjs.org/command-line-interface/
           output:{
            assetFileNames: "[hash].[name].[ext]", // 配置静态资源的文件名
           }
        },
        assetsInlineLimit:40960,// 低于40k的图片都会被打包成为base64位的图片打包后的静态资源目录名
        outDir:"testdir", // 打包后的文件目录名
        assetsDir:"static"   // 打包后静态资源存放的位置
    }
```



## 5. vite插件生命周期config

```markdown
# vite内置了很多插件，用户不用配加很多配置（比如不需要配置css_loader,ts-loader这些）

# 什么是插件:将代码处理成想要的结果，vite会在不同的生命周期执行插件的不同方法

# vite扩展了rollup，所以插件的生命周期和rollup的生命周期是一样的：rollup文档：https://rollupjs.org/plugin-development

# vite-aliases使用（这里的生命周期是先于vite.config.js之前执行）
帮助我们自动生成别名：检查当前目录下所有文件夹，并生成别名(就可以不在vite.config.js中配置别名了（resolve:{alias:{}}）)
1.安装：npm i vite-aliases -D

# vite插件必须要返回一个配置对象，插件返回的对象和vite.config.js返回的对象都不是最只终的配置对象，vite会将这些配置对象进行合并

export default ()=>{
    return {
        // config会在解析vite配置前调用
        config:(config,env)=>({  // config是一个vite.config.js的配置对象，env是中的command是命令，mode是模式，和vite.config.js中的配置对象是一样的
            // 返回一个配置对象(会合并到vite.config.js中的配置对象)
            resolve:{
                alias:{
                    "@": Path.resolve(__dirname, "/src"),
                }
            }
        })
    }
}
```

### 5.1.手写的aliases插件

```js
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


// 在vue.config.js中使用
import myFirstPlugins from '../js/myFirstPlugins.js'
 plugins:[myFirstPlugins()],
```





## 6.vite插件生命周期transformIndexHtml

```markdown
# vite-plugin-html的使用
	npm i -D vite-plugin-html
	1. 可以在html中使用ejs语法，例如<%= title %>,其会在node服务端动态的去修改index.html中的内容，就是像vue一样将模版替换成数据
	2. vite-plugin-html注入变量（让其可以在html文件中使用）
  /**
    import {createHtmlPlugin} from "vite-plugin-html"

    // 注入变量
    createHtmlPlugin({
     inject:{
    data:{
     title:"vite-plugin-html"
    }

     }
    })
  */

# 手写vite-plugin-html(读取html文件，用用户输入的数据替换html文件中的内容)，可以使用正则进行替换

export default (options)=>{
    const data = options.inject.data
    const entry = Object.keys(data)
    console.log('entry',entry)
    let regs = /<%=\s*([\w]*)\s*%>/g  // 生成正则表达式,匹配名称
    return {
        // transformIndexHtml(转换html的专用钩子,返回一个html模版文件)
        transformIndexHtml:{
            enforce: 'pre', // 优先级,先于其他插件执行,不然其他的插件先给你转换了html,那么你就拿不到html了
            handler(html,ctx){ // html是一个html模版文件，ctx是一个(包含配置信息和node相关的信息)
                console.log("-----------------------------------")
                return html.replace(regs,(match,name)=>{
                console.log("name",name)
                    return data[name]
                }) 
            }
        }
    }
}
```



## 7. Mock.js

### 7.1. mock.js使用

```js
1.文档参考：https://github.com/nuysoft/Mock/wiki/Getting-Started
2.安装：npm install  mock.js -D
3.作用，用于生成用于需要的数据
```

### 7.2. vite-plugin-mock的使用【依赖于mockjs】

```js
# 安装
	1. npm install vite-plugin-mock -D
	2. import { viteMockServe } from "vite-plugin-mock"
	3. viteMockServe({}) // 自动找更目录下面的mock文件
	4. mock目录下要写一个导出文件（index.js），导出要使用的方法和响应
    module.exports = [
        {
          methods:"post",
          url:"/api/users",
          response:({body})=>{
            return {
              msg:"success"
              data:[],
              status:200
            }
          }
        }
      ]
    // 调取接口
    fetch("/api/users",{method:"post"}).then(data=>{console.log("data",data)}).catch(err=
  {console.log("err",err)}) 
    
  5. 使用mock.js生成用户需要的数据

	import mockS from "mockjs"
	const list = mockJS.mock({
    'list|1-10':[{
      name:"@name",
      address:"@address",
    }]
  })
  
  
```



### 7.3. vite-mock-plugin的实现,以及其使用的生命周期

```js
  # mock.js
 		浏览器请求，在开发环境中请求会被vite-serve服务器接管
 		使用configServer函数，可以获取浏览器中的请求，然后进行处理
    
  export default ()=>{
    	return {
         configServer:(server)=>{
            // server: vite-serve服务器的相关配置 server.middlewares(自定义中间件)
            // req: 请求相关的配置
            // res: 响应相关的配置
            // next: 下一个中间件
            server.middlewares.use((req,res,next)=>{ // 这个是你构建的一个中间件【用于处理事物的一个函数】
                if(req.url === "/api/users"){
                    res.end(JSON.stringify({ // 这里可以使用mock.js，返回对应的mock数据
                        msg:"success",
                        data:data,
                        status:200
                    }))
                }else{
                    next() // next()是一个函数，用于执行下一个中间件(这里的req后于next()执行，就可能会报错,所以要放在else中)
                }

            })
          }
      }
  }
 
```



### 7.4 其他的vite钩子函数

```js
// configResolved
	configResolved插件钩子可以查看所有配置文件配置完成后的状态

// configurePreviewServer
  
	1.使用live-server启动打包后的项目
 	2.或者使用npm run preview查看打包后的项目（注意，vite默认是启动dist目录下的index.html文件，如果你设置了其他的文件，可能会没有效果）
 3.你也可以在package.json中配置scripts，然后使用npm run preview查看打包后的项目 
 4.在vite插件中可以使用configurePreviewServer配置vite preview启动的服务的请求

// handleHotUpdate 热更新的钩子


// rollup和vite通用的钩子 https://cn.vitejs.dev/guide/api-plugin.html


```

## 8. vite和ts

```markdown
# vite对ts是天生支持的（vite只会对ts编译，不会去进行检查），但是对于ts的配置，需要在根目录下创建一个tsconfig.json文件

# 使用vite-plugin-checker插件前准备

1. npm install vite-plugin-checker -D 【为你的vite项目提供typescript，eslint等类型的检查】
2. npm install typescript -D 
3. 新建tsconfig.json文件

# 使用vite-plugin-checker插件

1. import checker from 'vite-plugin-checker'
2. checker({typescript:true})



  # env.d.ts（vite约定俗成的文件命名，要保证根更目录下）解决import.meta不存在env报错的办法
  # 作用
  1.<reference types="vite/client" /> 是 TypeScript 中的一个指令，它告诉 TypeScript 在编译时包含 vite/client 类型定义文件（Type Declarations），以便在代码中使用 vite 内置的一些类型和接口。

  2.具体来说，在使用 vite 开发时，我们可能需要使用一些 vite 内置的全局变量，例如 import.meta.env、import.meta.hot 等。这些变量的类型定义文件通常是通过 vite/client 模块提供的，因此需要在代码中添加 <reference types="vite/client" /> 来获取类型定义。
  
  3. 需要注意的是，<reference types="vite/client" /> 只在 TypeScript 项目中使用，如果是 JavaScript 项目则不需要。同时，如果使用的是 VS Code 等支持自动完成和类型提示的编辑器，在导入 vite 内置变量时也可以通过自动导入的方式获取类型定义文件，无需手动添加 <reference types="vite/client" />

  # env.d.ts定义自己的变量
  你可以env.d.ts中定义你自己的全局变量，这样就不会报错了，你定义的全局变量会和vite的全局变量进行合并
  /*
    interface ImportMetaEnv {
      VITE_IS_NAME:string // 这样在你的编辑器中就有VITE_IS_NAME的提示了
    }
  */
```



## 9. 代码优化

### 9.1 . vite性能优化

1. 开发时候的构建速度的优化 ，vite按需加载（tree-shaking：去除无用的代码，减少打包体积,cdn的优化,分包，图片压缩

2. 页面性能优化：1.http优化：（强缓存，协商缓存），2.懒加载，3.js的代码逻辑（副作用：settimeout,）

### 9.2. 分包

**分包的必要性**

```markdown
# 打包项目 --> js文件被压缩了
	import { forEach } from 'lodash' 

# 不想要被压缩，配置如下代码

	build:{
    minify: false // 将打包的文件不进行压缩成一行
  }
	
# 浏览器缓存策略，只要静态资源名字没有变化，就不会重新进行请求（可以更改浏览器缓存策略）

	这个时候每次lodash的代码都会进行请求（因为打包后每次的名字都不一样）


# 这个时候就要分包了，把不需要更改的第三方模块单独打入到一个包中，这样浏览器就会节约性能了
 	build:{
   	rollupOptions:{
    output:{   
       manualChunks(id){ // id就是每个文件的路径,这个时候对文件路径进行单独打包处理，不把文件生成可以变化的hash文件
            if(id.includes('node_modules')){
                return 'vendor' // 表示把所有的node_modules文件打包到一个vender文件中，这个这些文件就不会经常请求了
            }
      }
   }

```





### 9.3. gzip压缩

```markdown
# 使用原因
	 文件太大了，需要进行压缩，将所有的静态文件进行压缩，来达到减少体积的作用
# 如何压缩
	使用vite-plugin-compression2 插件进行压缩[https://www.npmjs.com/package/vite-plugin-compression2]
# 压缩注意
	 1.压缩后为.gz文件，需要在服务器上进行配置，配置响应透：content-encoding:gzip（告诉浏览器这个文件是gz文件，浏览器会进行解压）
	 
	2.浏览器解压需要时间，如果文件不大，不要使用gzip压缩
```



### 9.4. 动态导入

```markdown
# 什么是动态导入
	动态导入和懒加载是一样的，都是在需要的时候才进行加载
  import('./a.png').then(({a}) => {
     console.log(a)
  })
  
# 注意
	这个时候会单独打包出来一个文件（代码分割），当使用的时候才会去加载单独分割的这个文件【这个经常用于路由系统中】，这个时候浏览器不会全部加载还不会使用的代码，只会在使用的时候才会去使用这个代码分割后的文件
```



### 9.5. cdn加速

```markdown
# 什么是cdn加速（content delivery network）
 	1.将静态资源上传到cdn服务器上
	2.在服务器上进行配置，将静态资源的请求地址指向cdn服务器上的地址
	3.浏览器会去cdn服务器上进行请求，cdn服务器会将静态资源返回给浏览器
	4.这样就减少了打包后的体积，减少了服务器的压力（比如你在中国访问美国的服务器，网络就会很慢，这个时候你项目小一点（因为你不需要将第三方包进行打包），访问的速度就会快一点）
# 配置cdn加速
	vite-plugin-cdn-import（这个插件可以将第三方包进行cdn加速，这个插件只能在生产环境下使用，因为开发环境下不需要进行cdn加速）
# 第三方包的cdn地址
	jsdeliver内容分发地址，这个使用的比较多
```



## 10. vite中的跨域

```markdown
	
# 浏览器同源策略：
		http只能在协议，域名，端口号都相同的情况下进行
	  所以a地址想去拿b地址的数据，b地址需要设置允许a地址进行访问，如果b地址没有允许其访问
# 什么是跨域
	 
	跨域（跨域只发生在浏览器）：a拿b的数据（不满足同源策略），就会产生跨域，跨域默认会被阻止，需要b地址允许a地址进行访问
# 跨域已经访问成功【跨域发生在浏览器端】
跨域的时候你其实已经访问成功了，只是浏览器阻止了你的访问，所以你会看到一个跨域的错误

# vite中如何处理跨域
vite中进行代理(浏览器看的时候，请求的还是本身的地址，只是将请求的地址进行了代理，代理到了另一个地址)（欺骗浏览器我是同源的）
      server:{
        proxy:{
            '/api':{
                target: 'http://localhost:3000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
      }

# 处理跨域的原理
	工作流程：浏览器会给我们做一次拼接（比如我们请求的是/api/user）,浏览器拼接为http://localhost:3000/user,然后交给vite，vite发现这个地址是进行过代理的（在node端中偷偷将要访问的服务器地址进行换过来），请求到http://localhost:3000/user，然后将拿到的数据返回，相当于node做了一次中间层服务器

# 后端如何处理跨域
	生产时一般交给后端处理：ngnix进行代理，或者配置身份标记（allow-control-allow-origin配置允许跨域的域名）




```





























​	















