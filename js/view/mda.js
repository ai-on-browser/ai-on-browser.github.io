import MixtureDiscriminant from"../../lib/model/mda.js";import Controller from"../controller.js";var dispMDA=function(t,n){const e=new Controller(n);let i=null;t.append("span").text(" r "),t.append("input").attr("type","number").attr("name","r").attr("min",1).attr("max",100).attr("value",10),e.stepLoopButtons().init((()=>{i=null,n.init()})).step((e=>{if(!i){const e=+t.select("[name=r]").property("value");i=new MixtureDiscriminant(e),i.init(n.trainInput,n.trainOutput.map((t=>t[0])))}i.fit();const r=i.predict(n.testInput(3));n.testResult(r),e&&e()})).epoch()};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',dispMDA(t.setting.ml.configElement,t)}