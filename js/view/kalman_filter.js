var o=Object.defineProperty;var e=(t,n)=>o(t,"name",{value:n,configurable:!0});import u from"../../lib/model/kalman_filter.js";var d=e(function(t,n){const a=n.task,i=e(()=>{const c=new u,p=c.fit(n.trainInput);if(a==="TP"){const r=+t.select("[name=c]").property("value"),s=c.predict(r);n.trainResult=s}else n.trainResult=p},"fitModel");t.append("input").attr("type","button").attr("value","Fit").on("click",i),a==="TP"&&(t.append("span").text("predict count"),t.append("input").attr("type","number").attr("name","c").attr("min",1).attr("max",100).attr("value",100).on("change",i))},"dispKalmanFilter");export default function l(t){t.setting.ml.usage='Click and add data point. Click "fit" to update.',d(t.setting.ml.configElement,t)}e(l,"default");
