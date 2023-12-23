var d=Object.defineProperty;var a=(t,e)=>d(t,"name",{value:e,configurable:!0});import o from"../../lib/model/nearest_centroid.js";var u=a(function(t,e){const c=a(function(){const n=t.select("[name=metric]").property("value");let i=new o(n);i.fit(e.trainInput,e.trainOutput.map(s=>s[0]));const r=i.predict(e.testInput(4));e.testResult(r)},"calcNearestCentroid");t.append("select").attr("name","metric").selectAll("option").data(["euclid","manhattan","chebyshev"]).enter().append("option").attr("value",n=>n).text(n=>n),t.append("input").attr("type","button").attr("value","Calculate").on("click",c)},"dispNearestCentroid");export default function l(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',u(t.setting.ml.configElement,t),t.setting.ml.detail=`
For each category $ C_k $, the centroid $ c_k $ is defined as
$$
c_k = \\frac{1}{|C_k|} \\sum_{x \\in C_k} x
$$
The category of data $ x $ is estimated as
$$
\\argmin_k \\| x - c_k \\|^2
$$
`}a(l,"default");
