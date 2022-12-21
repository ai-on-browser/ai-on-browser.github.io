import DemingRegression from"../../lib/model/deming.js";var dispDeming=function(t,e){e.setting.ml.reference={title:"Deming regression (Wikipedia)",url:"https://en.wikipedia.org/wiki/Deming_regression"};const n=()=>{const n=+t.select("[name=d]").property("value"),i=new DemingRegression(n);i.fit(e.trainInput.map((t=>t[0])),e.trainOutput.map((t=>t[0]))),e.testResult(i.predict(e.testInput(1).map((t=>t[0]))))};t.append("span").text(" d "),t.append("input").attr("type","number").attr("name","d").attr("value",1).attr("min",0).attr("step",.1).on("change",n),t.append("input").attr("type","button").attr("value","Fit").on("click",n)};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',t.setting.ml.require={dimension:1},dispDeming(t.setting.ml.configElement,t)}