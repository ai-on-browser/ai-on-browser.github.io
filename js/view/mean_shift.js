import MeanShift from"../../lib/model/mean_shift.js";var dispMeanShift=function(t,e){const a=e.svg.insert("g",":first-child").attr("class","centroids").attr("opacity",.8);let r=[],n=new MeanShift(50,10);const s=e.datas.scale;e.datas.scale=1;const i=()=>{e.fit(((t,e,a)=>{const s=n.predict();a(s.map((t=>t+1)));for(let t=0;t<r.length;t++)r[t].attr("stroke",getCategoryColor(s[t]+1)).attr("cx",n._centroids[t][0]).attr("cy",n._centroids[t][1])}))};return t.append("input").attr("type","number").attr("name","h").attr("value",100).attr("min",10).attr("max",200),e.setting.ml.controller.stepLoopButtons().init((()=>{n.h=+t.select("[name=h]").property("value"),n.threshold=+t.select("[name=threshold]").property("value"),e.fit(((t,s)=>{"SG"===e.task&&(t=t.flat()),n.init(t),"SG"!==e.task&&(r.forEach((t=>t.remove())),r=e.datas.points.map((t=>a.append("circle").attr("cx",t.at[0]).attr("cy",t.at[1]).attr("r",n.h).attr("stroke","black").attr("fill-opacity",0).attr("stroke-opacity",.5)))),i()})),t.select("[name=clusternumber]").text(n.categories)})).step((e=>{null!==n&&(n.fit(),i(),t.select("[name=clusternumber]").text(n.categories),e&&e())})),t.append("input").attr("type","number").attr("name","threshold").attr("value",10).attr("min",1).attr("max",100).on("change",(function(){n.threshold=d3.select(this).property("value"),i(),t.select("[name=clusternumber]").text(n.categories)})),t.append("span").attr("name","clusternumber").text("0"),t.append("span").text(" clusters "),()=>{a.remove(),e.datas.scale=s}};export default function(t){t.setting.ml.usage='Click and add data point. Finally, click "Step" button repeatedly.',t.setting.terminate=dispMeanShift(t.setting.ml.configElement,t)}