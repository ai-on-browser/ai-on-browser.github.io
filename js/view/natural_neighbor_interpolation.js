import NaturalNeighborInterpolation from"../../lib/model/natural_neighbor_interpolation.js";var dispLerp=function(t,i){i.setting.ml.reference={title:"Natural neighbor interpolation (Wikipedia)",url:"https://en.wikipedia.org/wiki/Natural_neighbor_interpolation"};t.append("input").attr("type","button").attr("value","Calculate").on("click",(function(){const t=new NaturalNeighborInterpolation;t.fit(i.trainInput,i.trainOutput);const n=t.predict(i.testInput(1===i.datas.dimension?1:4));i.testResult(n.map((t=>t??-1)))}))};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',t.setting.ml.require={dimension:[1,2]},dispLerp(t.setting.ml.configElement,t)}