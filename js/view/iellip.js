var m=Object.defineProperty;var l=(t,a)=>m(t,"name",{value:a,configurable:!0});import{CELLIP as y,IELLIP as v}from"../../lib/model/iellip.js";import o from"../../lib/model/ensemble_binary.js";var L=l(function(t,a){a.setting.ml.reference={author:"L. Yang, R. Jin, K. Ye",title:"Online Learning by Ellipsoid Method.",year:2009};const i=l(()=>{const e=t.select("[name=method]").property("value"),u=t.select("[name=type]").property("value");let n;if(u==="CELLIP"){const p=+t.select("[name=gamma]").property("value"),c=+t.select("[name=a]").property("value");n=new o(function(){return new y(p,c)},e)}else{const p=+t.select("[name=b]").property("value"),c=+t.select("[name=c]").property("value");n=new o(function(){return new v(p,c)},e)}n.init(a.trainInput,a.trainOutput.map(p=>p[0])),n.fit();const d=n.predict(a.testInput(3));a.testResult(d)},"calc");t.append("select").attr("name","method").selectAll("option").data(["oneone","onerest"]).enter().append("option").property("value",e=>e).text(e=>e),t.append("select").attr("name","type").on("change",()=>{const e=t.select("[name=type]").property("value");t.selectAll(".params").style("display","none"),t.selectAll(`.${e.toLowerCase()}`).style("display",null)}).selectAll("option").data(["CELLIP","IELLIP"]).enter().append("option").property("value",e=>e).text(e=>e);const r=t.append("span").classed("params",!0).classed("cellip",!0);r.append("span").text(" gamma = "),r.append("input").attr("type","number").attr("name","gamma").attr("min",0).attr("max",10).attr("value",1).attr("step",.1),r.append("span").text(" a = "),r.append("input").attr("type","number").attr("name","a").attr("min",0).attr("max",1).attr("value",.5).attr("step",.1);const s=t.append("span").classed("params",!0).classed("iellip",!0).style("display","none");s.append("span").text(" b = "),s.append("input").attr("type","number").attr("name","b").attr("min",0).attr("max",1).attr("value",.5).attr("step",.1),s.append("span").text(" c = "),s.append("input").attr("type","number").attr("name","c").attr("min",0).attr("max",1).attr("value",.5).attr("step",.1),t.append("input").attr("type","button").attr("value","Calculate").on("click",i)},"dispCELLIP");export default function g(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',L(t.setting.ml.configElement,t)}l(g,"default");
