import GTM from"../../lib/model/gtm.js";import Controller from"../controller.js";var dispGTM=function(t,e){const n=e.task,i=new Controller(e);let r=null;"DR"!=n?(t.append("span").text(" Size "),t.append("input").attr("type","number").attr("name","resolution").attr("value",10).attr("min",1).attr("max",100).property("required",!0)):(t.append("span").text(" Resolution "),t.append("input").attr("type","number").attr("name","resolution").attr("max",100).attr("min",1).attr("value",20)),i.stepLoopButtons().init((()=>{if(e.init(),0===e.datas.length)return;const n=e.dimension||1,i=+t.select("[name=resolution]").property("value");r=new GTM(2,n,i)})).step((t=>{r?e.fit(((i,a,p)=>{if(r.fit(i),"CT"===n){p(r.predictIndex(i).map((t=>t+1))),e.predict(((t,e)=>{e(r.predictIndex(t).map((t=>t+1)))}),4)}else{p(r.predict(i))}t&&t()})):t&&t()})).epoch()};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.',dispGTM(t.setting.ml.configElement,t)}