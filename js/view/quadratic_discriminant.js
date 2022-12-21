import QuadraticDiscriminant from"../../lib/model/quadratic_discriminant.js";var dispQuadraticDiscriminant=function(t,i){i.setting.ml.reference={author:"B. Ghojogh, M. Crowley",title:"Linear and Quadratic Discriminant Analysis: Tutorial",year:2010};t.append("input").attr("type","button").attr("value","Calculate").on("click",(()=>{const t=new QuadraticDiscriminant;t.fit(i.trainInput,i.trainOutput.map((t=>t[0])));const a=t.predict(i.testInput(3));i.testResult(a)}))};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',dispQuadraticDiscriminant(t.setting.ml.configElement,t)}