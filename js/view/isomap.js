import Isomap from"../../lib/model/isomap.js";var dispIsomap=function(t,n){t.append("span").text(" neighbors = "),t.append("input").attr("type","number").attr("name","neighbors").attr("value",10).attr("min",0).attr("max",1e4),t.append("input").attr("type","button").attr("value","Fit").on("click",(()=>(e=>{const a=+t.select("[name=neighbors]").property("value"),i=n.dimension,p=new Isomap(a).predict(n.trainInput,i);n.trainResult=p})()))};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',dispIsomap(t.setting.ml.configElement,t)}