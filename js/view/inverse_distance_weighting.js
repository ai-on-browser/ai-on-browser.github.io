import InverseDistanceWeighting from"../../lib/model/inverse_distance_weighting.js";var dispIDW=function(t,e){e.setting.ml.reference={title:"Inverse distance weighting (Wikipedia)",url:"https://en.wikipedia.org/wiki/Inverse_distance_weighting"};const n=function(){const n=t.select("[name=metric]").property("value"),a=+t.select("[name=k]").property("value"),i=+t.select("[name=p]").property("value"),p=e.datas.dimension,r=new InverseDistanceWeighting(a,i,n);r.fit(e.trainInput,e.trainOutput.map((t=>t[0])));const s=r.predict(e.testInput(1===p?1:4));e.testResult(s)};t.append("select").attr("name","metric").on("change",n).selectAll("option").data(["euclid","manhattan","chebyshev"]).enter().append("option").attr("value",(t=>t)).text((t=>t)),t.append("span").text(" k = "),t.append("input").attr("type","number").attr("name","k").attr("value",2).attr("min",1).attr("max",100).on("change",n),t.append("span").text(" p = "),t.append("input").attr("type","number").attr("name","p").attr("value",2).attr("min",0).attr("max",100).on("change",n),t.append("input").attr("type","button").attr("value","Calculate").on("click",n)};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',dispIDW(t.setting.ml.configElement,t)}