import LogarithmicInterpolation from"../../lib/model/logarithmic_interpolation.js";var dispLI=function(t,i){t.append("input").attr("type","button").attr("value","Calculate").on("click",(function(){i.fit(((t,a)=>{let n=new LogarithmicInterpolation;n.fit(t.map((t=>t[0])),a.map((t=>t[0]))),i.predict(((t,i)=>{i(n.predict(t.map((t=>t[0]))))}),1)}))}))};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',dispLI(t.setting.ml.configElement,t)}