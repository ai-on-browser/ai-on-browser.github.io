import ButterworthFilter from"../../lib/model/butterworth.js";var dispButterworth=function(t,e){const a=()=>{const a=+t.select("[name=n]").property("value"),n=+t.select("[name=c]").property("value"),r=e.trainInput,p=new ButterworthFilter(a,n),l=[];for(let t=0;t<r.length;l[t++]=[]);for(let t=0;t<r[0].length;t++){const e=r.map((e=>e[t])),a=p.predict(e);for(let e=0;e<l.length;e++)l[e][t]=a[e]}e.trainResult=l};t.append("span").text("n"),t.append("input").attr("type","number").attr("name","n").attr("min",1).attr("max",100).attr("value",2).on("change",a),t.append("span").text("cutoff rate"),t.append("input").attr("type","number").attr("name","c").attr("min",0).attr("max",1).attr("value",.9).attr("step",.01).on("change",a),t.append("input").attr("type","button").attr("value","Calculate").on("click",a)};export default function(t){t.setting.ml.usage='Click and add data point. Click "Calculate" to update.',dispButterworth(t.setting.ml.configElement,t)}