import CumSum from"../../lib/model/cumulative_sum.js";var dispCumSum=function(t,e){const a=function(){e.fit(((e,a,n)=>{let u=new CumSum;const l=e.map((t=>t[0])),m=+t.select("[name=threshold]").property("value");n(u.predict(l),m)}))};t.append("span").text(" threshold = "),t.append("input").attr("type","number").attr("name","threshold").attr("value",10).attr("min",0).attr("max",100).property("required",!0).on("change",a),t.append("input").attr("type","button").attr("value","Calculate").on("click",a)};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',dispCumSum(t.setting.ml.configElement,t)}