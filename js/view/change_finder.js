import ChangeFinder from"../../lib/model/change_finder.js";var dispChangeFinder=function(t,e){let a=null;const n=(n=!0)=>{t.select("[name=method]").property("value");const p=+t.select("[name=p]").property("value"),r=+t.select("[name=r]").property("value"),l=+t.select("[name=smooth]").property("value"),i=+t.select("[name=threshold]").property("value");e.fit(((t,e,m)=>{a&&!n||(a=new ChangeFinder(p,r,l),t=t.map((t=>t[0])),a.fit(t));m(a.predict(),i)}))};t.append("select").attr("name","method").selectAll("option").data(["sdar"]).enter().append("option").attr("value",(t=>t)).text((t=>t)),t.append("span").text("p"),t.append("input").attr("type","number").attr("name","p").attr("min",1).attr("max",1e3).attr("value",2),t.append("span").text("r"),t.append("input").attr("type","number").attr("name","r").attr("min",0).attr("max",1).attr("value",.5).attr("step",.1),t.append("span").text("smooth"),t.append("input").attr("type","number").attr("name","smooth").attr("min",1).attr("max",100).attr("value",10),t.append("input").attr("type","button").attr("value","Fit").on("click",n),t.append("span").text(" threshold = "),t.append("input").attr("type","number").attr("name","threshold").attr("value",.8).attr("min",0).attr("max",100).attr("step",.1).on("change",(()=>{n(!1)}))};export default function(t){t.setting.ml.draft=!0,t.setting.ml.usage='Click and add data point. Click "fit" to update.',dispChangeFinder(t.setting.ml.configElement,t)}