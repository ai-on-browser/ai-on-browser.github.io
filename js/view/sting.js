var a=Object.defineProperty;var e=(t,n)=>a(t,"name",{value:n,configurable:!0});import o from"../../lib/model/sting.js";var s=e(function(t,n){n.setting.ml.reference={author:"W. Wang, J. Yang, R. R. Muntz",title:"STING : A Statistical Information Grid Approach to Spatial Data Mining",year:1997};const i=e(()=>{new o().fit(n.trainInput)},"fitModel"),c=t.append("input").attr("type","button").attr("value","Fit").on("click",i);return t.append("span").text(" Clusters: "),t.append("span").attr("name","clusters"),()=>{}},"dispSTING");export default function r(t){t.setting.ml.usage='Click and add data point. Then, click "Fit" button.',t.setting.terminate=s(t.setting.ml.configElement,t)}e(r,"default");
