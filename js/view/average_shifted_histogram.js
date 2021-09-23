import{Matrix}from"../../lib/util/math.js";import averageShiftedHistogram from"../../lib/model/average_shifted_histogram.js";var dispAverageShiftedHistogram=function(t,a){const e=e=>{const i=+t.select("[name=bin]").property("value"),n=+t.select("[name=aggregate]").property("value");a.fit(((t,e)=>{const r=averageShiftedHistogram(t,{domain:a.datas.domain,size:i*a.datas.scale},n);let p=Matrix.fromArray(r).value;const o=Math.max(...p);p=p.map((t=>specialCategory.density(t/o))),a.predict(((t,a)=>{a(p)}),i)}))};t.append("span").text("bin size "),t.append("input").attr("type","number").attr("name","bin").attr("min",1).attr("max",100).attr("value",10).on("change",e),t.append("span").text("aggregate "),t.append("input").attr("type","number").attr("name","aggregate").attr("min",1).attr("max",100).attr("value",10).on("change",e),t.append("input").attr("type","button").attr("value","Fit").on("click",(()=>e()))};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',dispAverageShiftedHistogram(t.setting.ml.configElement,t)}