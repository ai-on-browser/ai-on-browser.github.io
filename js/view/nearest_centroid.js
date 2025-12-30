var d=Object.defineProperty;var n=(t,e)=>d(t,"name",{value:e,configurable:!0});import o from"../../lib/model/nearest_centroid.js";var l=n((t,e)=>{const c=n(()=>{const a=t.select("[name=metric]").property("value"),i=new o(a);i.fit(e.trainInput,e.trainOutput.map(r=>r[0]));const s=i.predict(e.testInput(4));e.testResult(s)},"calcNearestCentroid");t.append("select").attr("name","metric").selectAll("option").data(["euclid","manhattan","chebyshev"]).enter().append("option").attr("value",a=>a).text(a=>a),t.append("input").attr("type","button").attr("value","Calculate").on("click",c)},"dispNearestCentroid");export default function u(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',l(t.setting.ml.configElement,t),t.setting.ml.detail=`
For each category $ C_k $, the centroid $ c_k $ is defined as
$$
c_k = \\frac{1}{|C_k|} \\sum_{x \\in C_k} x
$$
The category of data $ x $ is estimated as
$$
\\argmin_k \\| x - c_k \\|^2
$$
`}n(u,"default");
