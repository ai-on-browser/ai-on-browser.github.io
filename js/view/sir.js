import SlicedInverseRegression from"../../lib/model/sir.js";var dispSIR=function(t,e){const n=()=>{const n=+t.select("[name=s]").property("value");e.fit(((t,i,a)=>{const s=e.dimension;a(new SlicedInverseRegression(n).predict(t,i.map((t=>t[0])),s))}))};t.append("span").text(" s "),t.append("input").attr("type","number").attr("name","s").attr("value",10).attr("min",1).attr("max",100).on("change",n),t.append("input").attr("type","button").attr("value","Fit").on("click",n)};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',dispSIR(t.setting.ml.configElement,t)}