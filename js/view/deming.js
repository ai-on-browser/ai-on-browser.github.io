import DemingRegression from"../../lib/model/deming.js";var dispDeming=function(t,e){const n=()=>{e.fit(((n,i)=>{const a=+t.select("[name=d]").property("value"),p=new DemingRegression(a);p.fit(n.map((t=>t[0])),i.map((t=>t[0]))),e.predict(((t,e)=>{e(p.predict(t.map((t=>t[0]))))}),1)}))};t.append("span").text(" d "),t.append("input").attr("type","number").attr("name","d").attr("value",1).attr("min",0).attr("step",.1).on("change",n),t.append("input").attr("type","button").attr("value","Fit").on("click",n)};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',t.setting.ml.require={dimension:1},dispDeming(t.setting.ml.configElement,t)}