import CAST from"../../lib/model/cast.js";var dispCAST=function(t,e){const n=n=>{const a=+t.select("[name=t]").property("value"),p=new CAST(a);p.fit(e.trainInput);const s=p.predict();e.trainResult=s.map((t=>t+1)),t.select("[name=clusters]").text(p.size),n&&n()};t.append("span").text(" t "),t.append("input").attr("type","number").attr("name","t").attr("min",0).attr("max",1).attr("value",.95).attr("step",.01).on("change",n),t.append("input").attr("type","button").attr("value","Fit").on("click",n),t.append("span").text(" Clusters: "),t.append("span").attr("name","clusters")};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Fit" button.',dispCAST(t.setting.ml.configElement,t)}