import Thompson from"../../lib/model/thompson.js";var dispThompson=function(t,n){const a=function(){const a=+t.select("[name=alpha]").property("value"),e=new Thompson(a).predict(n.trainInput);n.trainResult=e};t.append("span").text(" alpha = "),t.append("input").attr("type","number").attr("name","alpha").attr("value",1).attr("min",0).attr("max",50).on("change",a),t.append("input").attr("type","button").attr("value","Calculate").on("click",a)};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',dispThompson(t.setting.ml.configElement,t)}