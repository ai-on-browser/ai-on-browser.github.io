var d=Object.defineProperty;var a=(t,e)=>d(t,"name",{value:e,configurable:!0});import u from"../../lib/model/box_cox.js";var s=a(function(t,e){e.setting.ml.reference={title:"Power transform (Wikipedia)",url:"https://en.wikipedia.org/wiki/Power_transform#Box%E2%80%93Cox_transformation"};const o=a(()=>{const p=i.property("checked"),c=+n.property("value"),r=new u(c);p&&(r.fit(e.trainOutput),n.property("value",r._lambda[0])),e.trainResult=r.predict(e.trainOutput)},"fitModel");t.append("span").text("lambda");const i=t.append("input").attr("type","checkbox").attr("name","auto").attr("title","auto").property("checked",!0).on("change",()=>{n.property("disabled",i.property("checked"))}),n=t.append("input").attr("type","number").attr("name","lambd").attr("value",.1).attr("step",.1).property("disabled",!0).on("change",o);t.append("input").attr("type","button").attr("value","Fit").on("click",o)},"dispBoxCox");export default function l(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',s(t.setting.ml.configElement,t)}a(l,"default");
