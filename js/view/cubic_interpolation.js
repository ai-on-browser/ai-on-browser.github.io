import CubicInterpolation from"../../lib/model/cubic_interpolation.js";var dispCubicInterpolation=function(t,i){t.append("input").attr("type","button").attr("value","Calculate").on("click",(function(){i.fit(((t,n)=>{let e=new CubicInterpolation;e.fit(t.map((t=>t[0])),n.map((t=>t[0]))),i.predict(((t,i)=>{i(e.predict(t.map((t=>t[0]))))}),1)}))}))};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',t.setting.ml.require={dimension:1},dispCubicInterpolation(t.setting.ml.configElement,t)}