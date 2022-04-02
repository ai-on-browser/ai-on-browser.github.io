import ARMA from"../../lib/model/arma.js";import Controller from"../controller.js";var dispARMA=function(t,e){const n=new Controller(e);let a=null;const r=n=>{const r=+t.select("[name=p]").property("value"),p=+t.select("[name=q]").property("value"),l=+t.select("[name=c]").property("value"),o=e.trainInput;if(!a){a=[];for(let t=0;t<o[0].length;t++)a[t]=new ARMA(r,p)}const i=[];for(let t=0;t<l;i[t++]=[]);for(let t=0;t<o[0].length;t++){const e=o.map((e=>e[t]));a[t].fit(e);const n=a[t].predict(e,l);for(let e=0;e<i.length;e++)i[e][t]=n[e]}e.trainResult=i,n&&n()};t.append("span").text("p"),t.append("input").attr("type","number").attr("name","p").attr("min",0).attr("max",1e3).attr("value",1),t.append("span").text("q"),t.append("input").attr("type","number").attr("name","q").attr("min",0).attr("max",1e3).attr("value",1),n.stepLoopButtons().init((()=>{a=null,e._plotter.reset()})).step(r).epoch(),t.append("span").text("predict count"),t.append("input").attr("type","number").attr("name","c").attr("min",1).attr("max",100).attr("value",100).on("change",r)};export default function(t){t.setting.ml.usage='Click and add data point. Click "fit" to update.',dispARMA(t.setting.ml.configElement,t)}