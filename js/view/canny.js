import Canny from"../../lib/model/canny.js";var dispCanny=function(t,e){e.colorSpace="gray";const n=()=>{e.fit(((e,n,a)=>{const r=+t.select("[name=th1]").property("value"),p=+t.select("[name=th2]").property("value"),l=new Canny(r,p);for(let t=0;t<e.length;t++)for(let n=0;n<e[t].length;n++)e[t][n]=e[t][n].reduce(((t,e)=>t+e),0)/e[t][n].length;a(l.predict(e).flat())}),1)};t.append("span").text(" big threshold "),t.append("input").attr("type","number").attr("name","th1").attr("value",200).attr("min",0).attr("max",255).on("change",n),t.append("span").text(" small threshold "),t.append("input").attr("type","number").attr("name","th2").attr("value",80).attr("min",0).attr("max",255).on("change",n),t.append("input").attr("type","button").attr("value","Fit").on("click",n)};export default function(t){t.setting.ml.usage='Click "Fit" button.',dispCanny(t.setting.ml.configElement,t)}