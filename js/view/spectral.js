import SpectralClustering from"../../lib/model/spectral.js";var dispSpectral=function(t,e){let a=null;t.append("select").attr("name","method").on("change",(function(){const t=d3.select(this).property("value");n.selectAll("*").style("display","none"),n.selectAll(`.${t}`).style("display","inline")})).selectAll("option").data(["rbf","knn"]).enter().append("option").attr("value",(t=>t)).text((t=>t));const n=t.append("span");n.append("span").classed("rbf",!0).text("s ="),n.append("input").attr("type","number").attr("name","sigma").classed("rbf",!0).attr("min",.01).attr("max",100).attr("step",.01).property("value",1),n.append("span").classed("knn",!0).text("k ="),n.append("input").attr("type","number").attr("name","k_nearest").classed("knn",!0).attr("min",1).attr("max",100).property("value",10),n.selectAll(`:not(.${t.select("[name=method]").property("value")})`).style("display","none");const l=e.setting.ml.controller.stepLoopButtons().init((()=>{const l=t.select("[name=method]").property("value"),s={sigma:+n.select("[name=sigma]").property("value"),k:+n.select("[name=k_nearest]").property("value")};a=new SpectralClustering(l,s),a.init(e.datas.x),t.select("[name=clusternumber]").text(a.size),p.selectAll("input").attr("disabled",null)})),p=t.append("span");p.append("input").attr("type","button").attr("value","Add cluster").on("click",(()=>{a.add(),e.fit(((t,e,n)=>{n(a.predict().map((t=>t+1)))})),t.select("[name=clusternumber]").text(a.size)})),p.append("span").attr("name","clusternumber").text("0"),p.append("span").text(" clusters"),p.append("input").attr("type","button").attr("value","Clear cluster").on("click",(()=>{a.clear(),t.select("[name=clusternumber]").text("0")})),l.step((t=>{0!==a.size&&(e.fit(((t,e,n)=>{a.fit(),n(a.predict().map((t=>t+1)))})),t&&t())})).epoch((()=>a.epoch)),p.selectAll("input").attr("disabled",!0)};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Initialize". Then, click "Add cluster". Finally, click "Step" button repeatedly.',dispSpectral(t.setting.ml.configElement,t)}