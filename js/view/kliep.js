import{KLIEPCPD}from"../../lib/model/kliep.js";var dispKLIEP=function(t,e){let a=null;t.append("span").text(" window = "),t.append("input").attr("type","number").attr("name","window").attr("value",20).attr("min",1).attr("max",100),t.append("span").text(" threshold = "),t.append("input").attr("type","number").attr("name","threshold").attr("value",.01).attr("min",0).attr("max",1e3).attr("step",.01).on("change",(()=>{const e=+t.select("[name=threshold]").property("value");a&&a(e)})),t.append("input").attr("type","button").attr("value","Calculate").on("click",(function(){e.fit(((e,n,l,p)=>{const r=+t.select("[name=window]").property("value");let i=new KLIEPCPD(r);const o=+t.select("[name=threshold]").property("value"),d=i.predict(e);for(let t=0;t<3*r/4;t++)d.unshift(0);a=p,l(d,o)}))}))};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',dispKLIEP(t.setting.ml.configElement,t)}