import DelaunayInterpolation from"../../lib/model/delaunay_interpolation.js";var dispDelaunay=function(t,a){t.append("input").attr("type","button").attr("value","Calculate").on("click",(function(){a.fit(((t,n)=>{let e=new DelaunayInterpolation;e.fit(t.map((t=>[t[0],t[1]])),n.map((t=>t[0]))),a.predict(((t,a)=>{a(e.predict(t.map((t=>[t[0],t[1]]))).map((t=>t??-1)))}),1)}))}))};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',t.setting.ml.require={dimension:2},dispDelaunay(t.setting.ml.configElement,t)}