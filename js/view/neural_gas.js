var l=Object.defineProperty;var s=(t,n)=>l(t,"name",{value:n,configurable:!0});import c from"../../lib/model/neural_gas.js";import m from"../controller.js";var g=s(function(t,n){n.setting.ml.reference={title:"Neural gas (Wikipedia)",url:"https://en.wikipedia.org/wiki/Neural_gas"};const u=new m(n);let e=new c;const p=s(()=>{const r=e.predict(n.testInput(4));n.testResult(r.map(a=>a+1)),t.select("[name=l]").property("value",e._l)},"fitPoints"),d=u.stepLoopButtons().init(()=>{const r=+t.select("[name=l]").property("value"),a=+t.select("[name=m]").property("value");e=new c(r,a),t.select("[name=clusternumber]").text(e.size+" clusters"),n.init()});t.append("input").attr("type","button").attr("value","Add centroid").on("click",()=>{e.add(n.trainInput);const r=e.predict(n.trainInput);n.trainResult=r.map(a=>a+1),n.centroids(e.centroids,e.centroids.map((a,i)=>i+1),{line:!0}),p(),t.select("[name=clusternumber]").text(e.size+" clusters")}),t.append("span").attr("name","clusternumber").style("padding","0 10px").text("0 clusters"),t.append("span").text(" l "),t.append("input").attr("type","number").attr("name","l").attr("max",10).attr("step",.1).attr("value",1).on("change",()=>{const r=+t.select("[name=l]").property("value");e._l=r}),t.append("span").text("*="),t.append("input").attr("type","number").attr("name","m").attr("max",1).attr("min",.01).attr("step",.01).attr("value",.99).on("change",()=>{const r=+t.select("[name=m]").property("value");e._m=r}),d.step(r=>{if(e.size===0){r&&r();return}e.fit(n.trainInput);const a=e.predict(n.trainInput);n.trainResult=a.map(i=>i+1),n.centroids(e.centroids,e.centroids.map((i,o)=>o+1),{line:!0,duration:100}),p(),r&&setTimeout(r,100)})},"dispNeuralGas");export default function y(t){t.setting.ml.usage='Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.',g(t.setting.ml.configElement,t)}s(y,"default");
