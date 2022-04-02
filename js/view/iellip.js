import{CELLIP,IELLIP}from"../../lib/model/iellip.js";import EnsembleBinaryModel from"../../lib/model/ensemble_binary.js";var dispCELLIP=function(t,e){t.append("select").attr("name","method").selectAll("option").data(["oneone","onerest"]).enter().append("option").property("value",(t=>t)).text((t=>t)),t.append("select").attr("name","type").on("change",(()=>{const e=t.select("[name=type]").property("value");t.selectAll(".params").style("display","none"),t.selectAll(`.${e.toLowerCase()}`).style("display",null)})).selectAll("option").data(["CELLIP","IELLIP"]).enter().append("option").property("value",(t=>t)).text((t=>t));const a=t.append("span").classed("params",!0).classed("cellip",!0);a.append("span").text(" gamma = "),a.append("input").attr("type","number").attr("name","gamma").attr("min",0).attr("max",10).attr("value",1).attr("step",.1),a.append("span").text(" a = "),a.append("input").attr("type","number").attr("name","a").attr("min",0).attr("max",1).attr("value",.5).attr("step",.1);const n=t.append("span").classed("params",!0).classed("iellip",!0).style("display","none");n.append("span").text(" b = "),n.append("input").attr("type","number").attr("name","b").attr("min",0).attr("max",1).attr("value",.5).attr("step",.1),n.append("span").text(" c = "),n.append("input").attr("type","number").attr("name","c").attr("min",0).attr("max",1).attr("value",.5).attr("step",.1),t.append("input").attr("type","button").attr("value","Calculate").on("click",(a=>{const n=t.select("[name=method]").property("value");let p;if("CELLIP"===t.select("[name=type]").property("value")){const e=+t.select("[name=gamma]").property("value"),a=+t.select("[name=a]").property("value");p=new EnsembleBinaryModel((function(){return new CELLIP(e,a)}),n)}else{const e=+t.select("[name=b]").property("value"),a=+t.select("[name=c]").property("value");p=new EnsembleBinaryModel((function(){return new IELLIP(e,a)}),n)}p.init(e.trainInput,e.trainOutput.map((t=>t[0]))),p.fit();const l=p.predict(e.testInput(3));e.testResult(l),a&&a()}))};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',dispCELLIP(t.setting.ml.configElement,t)}