var c=Object.defineProperty;var s=(e,t)=>c(e,"name",{value:t,configurable:!0});import g from"../../lib/model/som.js";import v from"../controller.js";var y=s(function(e,t){t.setting.ml.reference={title:"Self-organizing map (Wikipedia)",url:"https://en.wikipedia.org/wiki/Self-organizing_map"};const u=new v(t),p=t.task;let i=null;const o=s(n=>{if(!i){n&&n();return}if(p==="CT"){i.fit(t.trainInput);const a=i.predict(t.trainInput);t.trainResult=a.map(r=>r[0]+1);const d=i.predict(t.testInput(4));t.testResult(d.map(r=>r[0]+1)),t.centroids(i._y,i._y.map((r,l)=>l+1)),n&&n()}else{i.fit(t.trainInput);const a=i.predict(t.trainInput);t.trainResult=a,n&&n()}},"fitModel");e.append("select").selectAll("option").data([{value:"batch"}]).enter().append("option").attr("value",n=>n.value).text(n=>n.value),p!="DR"?(e.append("span").text(" Size "),e.append("input").attr("type","number").attr("name","resolution").attr("value",10).attr("min",1).attr("max",100).property("required",!0)):(e.append("span").text(" Resolution "),e.append("input").attr("type","number").attr("name","resolution").attr("max",100).attr("min",1).attr("value",20)),u.stepLoopButtons().init(()=>{if(t.init(),t.datas.length===0)return;const n=t.dimension||1,a=+e.select("[name=resolution]").property("value");i=new g(2,n,a)}).step(o).epoch()},"dispSOM");export default function k(e){e.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.',y(e.setting.ml.configElement,e)}s(k,"default");
