import TukeyRegression from"../../lib/model/tukey_regression.js";import Controller from"../controller.js";var dispTR=function(t,e){const n=new Controller(e);let i=null;t.append("span").text(" e "),t.append("input").attr("type","number").attr("name","e").attr("value",1).attr("min",0).attr("max",100).attr("step",.1),n.stepLoopButtons().init((()=>{i=null,e.init()})).step((()=>{e.fit(((n,o)=>{if(!i){const e=+t.select("[name=e]").property("value");i=new TukeyRegression(e)}i.fit(n,o),e.predict(((t,e)=>{e(i.predict(t))}),4)}))})).epoch()};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',dispTR(t.setting.ml.configElement,t)}