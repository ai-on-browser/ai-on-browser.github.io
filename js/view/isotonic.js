var o=Object.defineProperty;var e=(t,n)=>o(t,"name",{value:n,configurable:!0});import d from"../../lib/model/isotonic.js";var u=e(function(t,n){const p=n.task,c=e(g=>{const k=n.datas.dimension,s=new d;s.fit(n.trainInput.map(i=>i[0]),n.trainOutput.map(i=>i[0])),n.testResult(s.predict(n.testInput(1).map(i=>i[0])))},"fitModel");t.append("input").attr("type","button").attr("value","Fit").on("click",()=>c())},"dispIsotonic");export default function a(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',t.setting.ml.require={dimension:1},u(t.setting.ml.configElement,t)}e(a,"default");
