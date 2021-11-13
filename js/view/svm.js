import SVM from"../../lib/model/svm.js";import EnsembleBinaryModel from"../../lib/util/ensemble.js";var dispSVM=function(e,t){let n=null,a=0;e.append("select").attr("name","method").selectAll("option").data(["oneone","onerest"]).enter().append("option").property("value",(e=>e)).text((e=>e)),e.select("[name=method]").property("value","onerest"),e.append("select").attr("name","kernel").on("change",(function(){"gaussian"===d3.select(this).property("value")?e.select("input[name=gamma]").style("display","inline"):e.select("input[name=gamma]").style("display","none")})).selectAll("option").data(["gaussian","linear"]).enter().append("option").property("value",(e=>e)).text((e=>e)),e.append("input").attr("type","number").attr("name","gamma").attr("value",1).attr("min",.01).attr("max",10).attr("step",.01);const l=t.setting.ml.controller.stepLoopButtons().init((()=>{const l=e.select("[name=kernel]").property("value"),p=[];"gaussian"===l&&p.push(+e.select("input[name=gamma]").property("value"));const o=e.select("[name=method]").property("value");n=new EnsembleBinaryModel(SVM,o,null,[l,p]),t.fit(((e,t)=>{n.init(e,t.map((e=>e[0])))})),a=0,t.init()}));e.append("span").text(" Iteration "),e.append("select").attr("name","iteration").selectAll("option").data([1,10,100,1e3]).enter().append("option").property("value",(e=>e)).text((e=>e)),l.step((function(l){if(0===t.datas.length)return;const p=+e.select("[name=iteration]").property("value");t.fit(((e,o,i)=>{for(let e=0;e<p;e++)n.fit();t.predict(((e,t)=>{t(n.predict(e)),a+=p,l&&l()}),4)}))})).epoch((()=>a))};export default function(e){e.setting.ml.usage='Click and add data point. Then, click "Calculate".',dispSVM(e.setting.ml.configElement,e)}