var b=Object.defineProperty;var o=(t,s)=>b(t,"name",{value:s,configurable:!0});import g from"../../lib/model/association_analysis.js";var y=o(function(t,s){let n=null;const d=o(()=>{const p=+t.select("[name=support]").property("value");n=new g(p);const a=s.datas._feature_names,v=s.trainInput.map(e=>e.map((m,A)=>a[A]+":"+m));n.fit(v);const u=[...n.items()].map(e=>e[0]);u.sort(),c.selectAll("*").remove(),c.selectAll("option").data(u).enter().append("option").attr("value",e=>e).text(e=>e),i.selectAll("*").remove(),i.selectAll("option").data(u).enter().append("option").attr("value",e=>e).text(e=>e),r()},"fitModel"),r=o(()=>{if(!n)return;const p=c.property("value"),a=i.property("value");l.text(`a=${n.support(p)}, b=${n.support(a)}, a&b=${n.support(p,a)}`),x.text(n.confidence(p,a)),f.text(n.lift(p,a))},"calcRel");t.append("span").text("min support"),t.append("input").attr("type","number").attr("name","support").attr("min",0).attr("max",1).attr("step",.1).attr("value",.1),t.append("input").attr("type","button").attr("value","Fit").on("click",d);const c=t.append("select").on("change",r);t.append("span").text(" => ");const i=t.append("select").on("change",r);t.append("span").text(" support: ");const l=t.append("span").text(0);t.append("span").text(" confidence: ");const x=t.append("span").text(0);t.append("span").text(" lift: ");const f=t.append("span").text(0)},"dispAA");export default function k(t){t.setting.ml.usage='Click and add data point. Click "fit" to update.',y(t.setting.ml.configElement,t)}o(k,"default");
