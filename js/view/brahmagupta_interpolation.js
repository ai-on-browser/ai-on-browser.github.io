import BrahmaguptaInterpolation from"../../lib/model/brahmagupta_interpolation.js";var dispBrahmagupta=function(t,a){t.append("input").attr("type","button").attr("value","Calculate").on("click",(function(){a.fit(((t,n)=>{const i=new BrahmaguptaInterpolation;i.fit(t.map((t=>t[0])),n.map((t=>t[0]))),a.predict(((t,a)=>{a(i.predict(t.map((t=>t[0]))))}),1)}))}))};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',dispBrahmagupta(t.setting.ml.configElement,t)}