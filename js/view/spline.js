import{SmoothingSpline}from"../../lib/model/spline.js";var dispSpline=function(t,n){const e=function(){const t=+a.property("value");n.fit(((e,a)=>{let i=new SmoothingSpline(t);const p=e.map((t=>t[0]));i.fit(p,a.map((t=>t[0]))),n.predict(((t,n)=>{n(i.predict(t.map((t=>t[0]))))}),2)}))},a=t.append("input").attr("type","number").attr("name","lambda").attr("min",0).attr("value",.01).attr("step",.01).on("change",e);t.append("input").attr("type","button").attr("value","Calculate").on("click",e)};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate". This model works with 1D data only.',dispSpline(t.setting.ml.configElement,t)}