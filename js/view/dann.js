var p=Object.defineProperty;var i=(t,e)=>p(t,"name",{value:e,configurable:!0});import o from"../../lib/model/dann.js";var d=i(function(t,e){e.setting.ml.reference={author:"T. Hastie, R. Tibshirani",title:"Discriminant Adaptive Nearest Neighbor Classification",year:1996};const a=i(()=>{const r=e.trainOutput.map(u=>u[0]),c=+t.select("[name=iter]").property("value"),n=new o;n.fit(e.trainInput,r);const s=n.predict(e.testInput(10),c);e.testResult(s)},"calc");t.append("span").text(" iteration "),t.append("input").attr("type","number").attr("name","iter").attr("min",0).attr("max",100).attr("value",1),t.append("input").attr("type","button").attr("value","Calculate").on("click",a)},"dispDANN");export default function l(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',d(t.setting.ml.configElement,t)}i(l,"default");
