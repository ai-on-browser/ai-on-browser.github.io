import MAD from"../../lib/model/mad.js";var dispMAD=function(t,e){const n=function(){const n=+t.select("[name=threshold]").property("value"),a=new MAD;a.fit(e.trainInput);const p=a.predict(e.trainInput).map((t=>t>n));e.trainResult=p;const r=a.predict(e.testInput(3)).map((t=>t>n));e.testResult(r)};t.append("span").text(" threshold = "),t.append("input").attr("type","number").attr("name","threshold").attr("value",2).attr("min",0).attr("max",10).property("required",!0).attr("step",.1).on("change",(function(){n()})),t.append("input").attr("type","button").attr("value","Calculate").on("click",n)};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',dispMAD(t.setting.ml.configElement,t)}