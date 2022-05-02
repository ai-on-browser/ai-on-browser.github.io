import{uLSIF}from"../../lib/model/ulsif.js";import{SquaredLossMICPD}from"../../lib/model/squared_loss_mi.js";var dispULSIF=function(t,e){t.append("span").text(" window = "),t.append("input").attr("type","number").attr("name","window").attr("value",10).attr("min",1).attr("max",100),t.append("span").text(" threshold = "),t.append("input").attr("type","number").attr("name","threshold").attr("value",.01).attr("min",0).attr("max",1e3).attr("step",.01).on("change",(()=>{const a=+t.select("[name=threshold]").property("value");e._plotter.threshold=a})),t.append("input").attr("type","button").attr("value","Calculate").on("click",(function(){const a=+t.select("[name=window]").property("value"),n=new uLSIF([100,10,1,.1,.01,.001],[100,10,1,.1,.01,.001],100),r=new SquaredLossMICPD(n,a),l=+t.select("[name=threshold]").property("value"),o=r.predict(e.trainInput);for(let t=0;t<3*a/4;t++)o.unshift(0);e.trainResult=o,e._plotter.threshold=l}))};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',dispULSIF(t.setting.ml.configElement,t)}