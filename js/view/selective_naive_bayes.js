import SelectiveNaiveBayes from"../../lib/model/selective_naive_bayes.js";var dispSelectiveNaiveBayes=function(t,e){let a=new SelectiveNaiveBayes;const i=()=>{a.fit(e.trainInput,e.trainOutput.map((t=>t[0]))),e.testResult(a.predict(e.testInput(3)))};t.append("span").text("Distribution "),t.append("select").attr("name","distribution").on("change",i).selectAll("option").data(["gaussian"]).enter().append("option").attr("value",(t=>t)).text((t=>t)),t.append("input").attr("type","button").attr("value","Calculate").on("click",i)};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',dispSelectiveNaiveBayes(t.setting.ml.configElement,t)}