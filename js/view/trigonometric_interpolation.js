import TrigonometricInterpolation from"../../lib/model/trigonometric_interpolation.js";var dispTrigonometric=function(t,i){i.setting.ml.reference={title:"Trigonometric interpolation (Wikipedia)",url:"https://en.wikipedia.org/wiki/Trigonometric_interpolation"};t.append("input").attr("type","button").attr("value","Calculate").on("click",(function(){const t=new TrigonometricInterpolation;t.fit(i.trainInput.map((t=>t[0])),i.trainOutput.map((t=>t[0])));const n=t.predict(i.testInput(1).map((t=>t[0])));i.testResult(n)}))};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',t.setting.ml.require={dimension:1},dispTrigonometric(t.setting.ml.configElement,t)}