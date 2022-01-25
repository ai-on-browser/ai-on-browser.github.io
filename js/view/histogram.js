import Matrix from"../../lib/util/matrix.js";import Histogram from"../../lib/model/histogram.js";var dispHistogram=function(t,e){const a=a=>{const n=t.select("[name=method]").property("value"),i=+t.select("[name=bins]").property("value"),o=e.width,r=e.height;e.fit(((t,a)=>{const l=new Histogram({domain:e.datas.domain,count:"manual"!==n?null:i,binMethod:n}).fit(t);e.predict(((t,e)=>{let a=Matrix.fromArray(l);a.div(a.max()),a=a.value.map(specialCategory.density),e(a)}),[o/l.length,r/l[0].length])}))};t.append("select").attr("name","method").on("change",(()=>{const e=t.select("[name=method]").property("value");t.select("[name=bins]").property("disabled","manual"!==e),a()})).selectAll("option").data(["manual","fd","scott","rice","sturges","doane","sqrt"]).enter().append("option").attr("value",(t=>t)).text((t=>t)),t.append("span").text("bins "),t.append("input").attr("type","number").attr("name","bins").attr("min",2).attr("value",10).on("change",a),t.append("input").attr("type","button").attr("value","Fit").on("click",(()=>a()))};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',dispHistogram(t.setting.ml.configElement,t)}