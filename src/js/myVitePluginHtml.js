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