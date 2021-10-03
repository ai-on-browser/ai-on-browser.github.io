import GeneticAlgorithmGeneration from"../../lib/model/genetic_algorithm.js";var dispGeneticAlgorithm=function(t,e){const n="grid"===e.type?Math.max(...e.env.size):10;e.reward="achieve";let a=new GeneticAlgorithmGeneration(e,100,n),r=0,i=[];e.reset(a),e.render((()=>a.get_score(e)));t.append("span").text("Generation size"),t.append("input").attr("type","number").attr("name","size").attr("min",5).attr("max",200).attr("value",100),t.append("span").text("Resolution"),t.append("input").attr("type","number").attr("name","resolution").attr("min",2).attr("max",100).attr("value",n);const o=e.setting.ml.controller.stepLoopButtons().init((()=>{const n=+t.select("[name=size]").property("value"),o=+t.select("[name=resolution]").property("value");a=new GeneticAlgorithmGeneration(e,n,o),i=[],e.reset(a),e.render((()=>a.get_score(e))),t.select("[name=generation]").text(r=0),t.select("[name=scores]").text("")}));t.append("span").text("Mutation rate"),t.append("input").attr("type","number").attr("name","mutation_rate").attr("min",0).attr("max",1).attr("step","0.0001").attr("value","0.001"),o.step((()=>{a.run(e),i.push(a.top_agent().total_reward);const n=+t.select("[name=mutation_rate]").property("value");a.next(n),e.reset(a),e.render((()=>a.get_score(e))),t.select("[name=generation]").text(++r),t.select("[name=scores]").text(" ["+i.slice(-10).reverse().join(",")+"]")})),t.append("span").text(" Generation: "),t.append("span").attr("name","generation").text(r);let s=!1;const p=t.append("input").attr("type","button").attr("value","Test").on("click",(function(){d3.select(this);if(s=!s,p.attr("value",s?"Stop":"Test"),s){const t=a.top_agent();let n=e.reset(t);!function a(){const r=t.get_action(e,n),[i,o,l]=e.step(r,t);n=i,e.render(),s&&!l?setTimeout((()=>a()),0):(s=!1,p.attr("value","Test"))}()}}));return t.append("span").attr("name","scores"),()=>{s=!1}};export default function(t){t.setting.ml.usage='Click "step" to update.',t.setting.terminate=dispGeneticAlgorithm(t.setting.ml.configElement,t)}