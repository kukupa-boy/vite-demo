//  方式一：把svg当成图片使用
import dealSvg1 from "@/assets/svg/illustration.svg";
import dealSvg2 from "@/assets/svg/illustration.svg?raw";
let svg1 = document.createElement("img")
svg1.src = dealSvg1
svg1.style.width= "100px"
svg1.style.height= "100px"
document.body.appendChild(svg1);

//  方式二：把svg当成图标使用
let svg2 = document.createElement("div")
svg2.style.width= "100px"
svg2.style.height= "100px"
svg2.innerHTML = dealSvg2

document.body.appendChild(svg2);