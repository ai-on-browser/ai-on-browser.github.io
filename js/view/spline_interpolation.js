import SplineInterpolation from"../../lib/model/spline_interpolation.js";var dispSI=function(t,n){t.append("input").attr("type","button").attr("value","Calculate").on("click",(function(){n.fit(((t,i)=>{let e=new SplineInterpolation;const l=t.map((t=>t[0]));e.fit(l,i.map((t=>t[0]))),n.predict(((t,n)=>{n(e.predict(t.map((t=>t[0]))))}),1)}))}))};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',t.setting.ml.require={dimension:1},dispSI(t.setting.ml.configElement,t)}