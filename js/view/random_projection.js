import RandomProjection from"../../lib/model/random_projection.js";var dispRandomProjection=function(t,n){t.append("select").attr("name","init").selectAll("option").data(["uniform","normal","root3"]).enter().append("option").attr("value",(t=>t)).text((t=>t)),t.append("input").attr("type","button").attr("value","Fit").on("click",(()=>(e=>{const o=t.select("[name=init]").property("value"),i=n.dimension,a=new RandomProjection(o).predict(n.trainInput,i);n.trainResult=a})()))};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',dispRandomProjection(t.setting.ml.configElement,t)}