import BIRCH from"../../lib/model/birch.js";var dispBIRCH=function(t,e){t.append("span").text(" b "),t.append("input").attr("type","number").attr("name","b").attr("min",2).attr("max",1e3).attr("value",10),t.append("span").text(" t "),t.append("input").attr("type","number").attr("name","t").attr("min",.01).attr("max",10).attr("step",.01).attr("value",.2),t.append("span").text(" l "),t.append("input").attr("type","number").attr("name","l").attr("min",2).attr("max",1e4).attr("value",1e4),t.append("span").text(" sub algorithm "),t.append("select").attr("name","subalgo").selectAll("option").data(["none"]).enter().append("option").attr("value",(t=>t)).text((t=>t));t.append("input").attr("type","button").attr("value","Fit").on("click",(a=>{e.fit(((e,n,p)=>{const r=+t.select("[name=b]").property("value"),l=+t.select("[name=t]").property("value"),i=+t.select("[name=l]").property("value"),s=new BIRCH(null,r,l,i);s.fit(e);const u=s.predict(e);p(u.map((t=>t+1))),t.select("[name=clusters]").text(new Set(u).size),a&&a()}))}));return t.append("span").text(" Clusters: "),t.append("span").attr("name","clusters"),()=>{}};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Fit" button.',t.setting.terminate=dispBIRCH(t.setting.ml.configElement,t)}