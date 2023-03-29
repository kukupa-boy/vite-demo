import  "./src/js/test1.js"
import   "./src/js/test2.js"
import "./src/js/dealImage.js"
import "./src/js/dealSvg"
import "./src/js/dealJson.js"
import "./mock/index.js"
import {_} from "lodash"
let arr = [1,2,3,4,5,6,7,8,9,10]
_.forEach(arr,(item,index)=>{
    console.log(item,index)
})

fetch("/api/users",{method:"post"})
.then(data=>{console.log("data",data)})
.catch(err=>{console.log("err",err)}) 













