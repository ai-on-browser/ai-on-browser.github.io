import IsotonicRegression from"../../lib/model/isotonic.js";var dispIsotonic=function(t,i){i.task;t.append("input").attr("type","button").attr("value","Fit").on("click",(()=>(t=>{i.datas.dimension;const n=new IsotonicRegression;n.fit(i.trainInput.map((t=>t[0])),i.trainOutput.map((t=>t[0]))),i.testResult(n.predict(i.testInput(1).map((t=>t[0]))))})()))};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',t.setting.ml.require={dimension:1},dispIsotonic(t.setting.ml.configElement,t)}