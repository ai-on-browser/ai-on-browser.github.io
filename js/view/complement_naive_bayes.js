import ComplementNaiveBayes from"../../lib/model/complement_naive_bayes.js";var dispComplementNaiveBayes=function(t,e){let a=new ComplementNaiveBayes;const n=t=>{a.fit(e.trainInput,e.trainOutput.map((t=>t[0]))),e.testResult(a.predict(e.testInput(3))),t&&t()};t.append("span").text("Distribution "),t.append("select").attr("name","distribution").on("change",n).selectAll("option").data(["gaussian"]).enter().append("option").attr("value",(t=>t)).text((t=>t)),t.append("input").attr("type","button").attr("value","Calculate").on("click",n)};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',dispComplementNaiveBayes(t.setting.ml.configElement,t)}