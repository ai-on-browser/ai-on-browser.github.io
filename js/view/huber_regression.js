import HuberRegression from"../../lib/model/huber_regression.js";import Controller from"../controller.js";var dispHR=function(t,e){const n=new Controller(e);let a=null;t.append("select").attr("name","method").on("change",(()=>{const e=t.select("[name=method]").property("value");r.style("display","gd"===e?null:"none")})).selectAll("option").data(["rls","gd"]).enter().append("option").attr("value",(t=>t)).text((t=>t)),t.append("span").text(" e "),t.append("input").attr("type","number").attr("name","e").attr("value",1).attr("min",0).attr("max",100).attr("step",.1);const r=t.append("span").text(" rate ").style("display","none");r.append("input").attr("type","number").attr("name","lr").attr("value",1).attr("min",0).attr("max",10).attr("step",.01),n.stepLoopButtons().init((()=>{a=null,e.init()})).step((()=>{if(!a){const e=t.select("[name=method]").property("value"),n=+t.select("[name=e]").property("value"),r=+t.select("[name=lr]").property("value");a=new HuberRegression(n,e,r)}a.fit(e.trainInput,e.trainOutput);let n=a.predict(e.testInput(4));e.testResult(n)})).epoch()};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',dispHR(t.setting.ml.configElement,t)}