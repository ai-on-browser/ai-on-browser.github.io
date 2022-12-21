import AODE from"../../lib/model/aode.js";var dispAODE=function(t,e){e.setting.ml.reference={title:"Averaged one-dependence estimators (Wikipedia)",url:"https://en.wikipedia.org/wiki/Averaged_one-dependence_estimators"};const n=()=>{const n=+t.select("[name=discrete]").property("value"),a=new AODE(n);a.fit(e.trainInput,e.trainOutput.map((t=>t[0])));const i=a.predict(e.testInput(3));e.testResult(i.map((t=>t??-1)))};t.append("span").text(" Discrete "),t.append("input").attr("type","number").attr("name","discrete").attr("max",100).attr("min",1).attr("value",10).on("change",n),t.append("input").attr("type","button").attr("value","Calculate").on("click",n)};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',dispAODE(t.setting.ml.configElement,t)}