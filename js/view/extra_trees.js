var c=Object.defineProperty;var p=(t,n)=>c(t,"name",{value:n,configurable:!0});import{ExtraTreesClassifier as l,ExtraTreesRegressor as o}from"../../lib/model/extra_trees.js";var x=p(function(t,n){const u=n.task;let e=null,s=4;const r=p(function(){let a=e.predict(n.testInput(s));n.testResult(a)},"dispRange");t.append("span").text(" Tree #"),t.append("input").attr("type","number").attr("name","tree_num").property("value",50).attr("min",1).attr("max",200),t.append("span").text(" Sampling rate "),t.append("input").attr("type","number").attr("name","srate").property("value",1).attr("min",.1).attr("max",1).attr("step",.1),t.append("input").attr("type","button").attr("value","Initialize").on("click",()=>{if(n.datas.length===0){e=null,t.select("[name=depthnumber]").text("0");return}const a=+t.select("input[name=tree_num]").property("value"),i=+t.select("input[name=srate]").property("value");u==="CF"?e=new l(a,i):e=new o(a,i),e.init(n.trainInput,n.trainOutput.map(d=>d[0])),r(),t.select("[name=depthnumber]").text(e.depth)}),t.append("input").attr("type","button").attr("value","Separate").on("click",()=>{e&&(e.fit(),r(),t.select("[name=depthnumber]").text(e.depth))}),t.append("span").attr("name","depthnumber").text("0"),t.append("span").text(" depth ")},"dispExtraTrees");export default function m(t){t.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Separate".',x(t.setting.ml.configElement,t)}p(m,"default");
