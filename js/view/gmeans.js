var r=Object.defineProperty;var i=(t,e)=>r(t,"name",{value:e,configurable:!0});import u from"../../lib/model/gmeans.js";var p=i(function(t,e){const n=new u;t.append("input").attr("type","button").attr("value","Step").on("click",()=>{n.fit(e.trainInput,1);const s=n.predict(e.trainInput);e.trainResult=s.map(c=>c+1),e.centroids(n.centroids,n.centroids.map((c,a)=>a+1),{line:!0}),t.select("[name=clusternumber]").text(n.size+" clusters")}),t.append("span").attr("name","clusternumber").style("padding","0 10px").text("0 clusters"),t.append("input").attr("type","button").attr("value","Clear centroid").on("click",()=>{n.clear(),e.init(),t.select("[name=clusternumber]").text(n.size+" clusters")})},"dispGMeans");export default function d(t){t.setting.ml.usage='Click and add data point. Then, click "Step" button repeatedly.',p(t.setting.ml.configElement,t)}i(d,"default");
