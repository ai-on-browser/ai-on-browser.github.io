var p=Object.defineProperty;var i=(t,n)=>p(t,"name",{value:n,configurable:!0});import l from"../../lib/model/affinity_propagation.js";import d from"../controller.js";var u=i(function(t,n){const a=new d(n);let e=null;const c=i(o=>{e||(e=new l,e.init(n.trainInput)),e.fit();const r=e.predict();n.trainResult=r.map(s=>s+1),t.select("[name=clusters]").text(e.size),n.centroids(e.centroids,e.categories.map(s=>s+1)),o&&o()},"fitModel");a.stepLoopButtons().init(()=>{e=null,t.select("[name=clusters]").text(0),n.init()}).step(c).epoch(),t.append("span").text(" Clusters: "),t.append("span").attr("name","clusters")},"dispAffinityPropagation");export default function f(t){t.setting.ml.usage='Click and add data point. Then, click "Step" button repeatedly.',u(t.setting.ml.configElement,t)}i(f,"default");
