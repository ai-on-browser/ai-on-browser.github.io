import BesselFilter from"../../lib/model/bessel.js";var dispButterworth=function(t,e){e.setting.ml.reference={title:"Bessel filter (Wikipedia)",url:"https://en.wikipedia.org/wiki/Bessel_filter"};const a=()=>{const a=+t.select("[name=n]").property("value"),n=+t.select("[name=c]").property("value"),r=e.trainInput,l=new BesselFilter(a,n),i=[];for(let t=0;t<r.length;i[t++]=[]);for(let t=0;t<r[0].length;t++){const e=r.map((e=>e[t])),a=l.predict(e);for(let e=0;e<i.length;e++)i[e][t]=a[e]}e.trainResult=i};t.append("span").text("n"),t.append("input").attr("type","number").attr("name","n").attr("min",0).attr("max",100).attr("value",2).on("change",a),t.append("span").text("cutoff rate"),t.append("input").attr("type","number").attr("name","c").attr("min",0).attr("max",1).attr("value",.9).attr("step",.01).on("change",a),t.append("input").attr("type","button").attr("value","Calculate").on("click",a)};export default function(t){t.setting.ml.usage='Click and add data point. Click "Calculate" to update.',dispButterworth(t.setting.ml.configElement,t)}