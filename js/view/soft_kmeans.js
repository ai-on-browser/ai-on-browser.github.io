var m=Object.defineProperty;var r=(t,n)=>m(t,"name",{value:n,configurable:!0});import b from"../../lib/model/soft_kmeans.js";import x from"../../lib/util/matrix.js";import y from"../controller.js";var f=r(function(t,n){const s=new y(n);let e=null;const c=r((a,i)=>{a&&e.fit();const u=x.fromArray(e.predict());n.trainResult=u.argmax(1).value.map(d=>d+1),n.centroids(e._c,e._c.map((d,l)=>l+1),{line:!0}),i&&i()},"fitModel");t.append("span").text("beta"),t.append("input").attr("type","number").attr("name","b").attr("max",1e3).attr("min",0).attr("step",.1).attr("value",10);const o=r(()=>{e.add(),t.select("[name=clusternumber]").text(e._c.length+" clusters"),n.centroids(e._c,e._c.map((a,i)=>i+1),{line:!0}),c(!1)},"addCentroid"),p=s.stepLoopButtons().init(()=>{const a=+t.select("[name=b]").property("value");e=new b(a),e.init(n.trainInput),n.init(),o()});t.append("input").attr("type","button").attr("value","Add centroid").on("click",o),t.append("span").attr("name","clusternumber").style("padding","0 10px").text("0 clusters"),p.step(a=>{c(!0,a)}).epoch()},"dispFuzzyCMeans");export default function g(t){t.setting.ml.usage='Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.',f(t.setting.ml.configElement,t)}r(g,"default");
