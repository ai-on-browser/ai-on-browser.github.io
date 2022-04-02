import{ExponentialMovingAverage,ModifiedMovingAverage}from"../../lib/model/exponential_average.js";var dispMovingAverage=function(e,t){const n=()=>{const n=e.select("[name=method]").property("value"),a=+e.select("[name=k]").property("value");let o;switch(n){case"exponential":o=new ExponentialMovingAverage;break;case"modified":o=new ModifiedMovingAverage}const i=t.trainInput,l=[];for(let e=0;e<i.length;l[e++]=[]);for(let e=0;e<i[0].length;e++){const t=i.map((t=>t[e])),n=o.predict(t,a);for(let t=0;t<l.length;t++)l[t][e]=n[t]}t.trainResult=l};e.append("select").attr("name","method").on("change",(()=>{n()})).selectAll("option").data(["exponential","modified"]).enter().append("option").attr("value",(e=>e)).text((e=>e)),e.append("span").text("k"),e.append("input").attr("type","number").attr("name","k").attr("min",1).attr("max",100).attr("value",5).on("change",n),e.append("input").attr("type","button").attr("value","Calculate").on("click",n)};export default function(e){e.setting.ml.usage='Click and add data point. Click "Calculate" to update.',dispMovingAverage(e.setting.ml.configElement,e)}