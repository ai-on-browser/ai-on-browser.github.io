import CosineInterpolation from"../../lib/model/cosine_interpolation.js";var dispCosineInterpolation=function(t,n){t.append("input").attr("type","button").attr("value","Calculate").on("click",(function(){n.fit(((t,i)=>{let e=new CosineInterpolation;e.fit(t.map((t=>t[0])),i.map((t=>t[0]))),n.predict(((t,n)=>{n(e.predict(t.map((t=>t[0]))))}),1)}))}))};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',t.setting.ml.require={dimension:1},dispCosineInterpolation(t.setting.ml.configElement,t)}