import Canny from"../../lib/model/canny.js";var dispCanny=function(t,e){e.colorSpace="gray";const n=()=>{const n=+t.select("[name=th1]").property("value"),a=+t.select("[name=th2]").property("value"),p=e._step;e._step=1;const r=e.trainInput,l=new Canny(n,a);for(let t=0;t<r.length;t++)for(let e=0;e<r[t].length;e++)r[t][e]=r[t][e].reduce(((t,e)=>t+e),0)/r[t][e].length;let o=l.predict(r);e.trainResult=o.flat(),e._step=p};t.append("span").text(" big threshold "),t.append("input").attr("type","number").attr("name","th1").attr("value",200).attr("min",0).attr("max",255).on("change",n),t.append("span").text(" small threshold "),t.append("input").attr("type","number").attr("name","th2").attr("value",80).attr("min",0).attr("max",255).on("change",n),t.append("input").attr("type","button").attr("value","Fit").on("click",n)};export default function(t){t.setting.ml.usage='Click "Fit" button.',dispCanny(t.setting.ml.configElement,t)}