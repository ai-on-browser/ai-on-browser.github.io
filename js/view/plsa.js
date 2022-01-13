import PLSA from"../../lib/model/plsa.js";import{Matrix}from"../../lib/util/math.js";var dispPLSA=function(t,i){let e=null;t.append("span").text("topics"),t.append("input").attr("type","number").attr("name","topics").attr("max",100).attr("min",1).attr("value",5),i.setting.ml.controller.stepLoopButtons().init((()=>{e=null,i.init()})).step((a=>{i.fit(((i,n,l)=>{const o=Matrix.fromArray(i),p=o.max(0).value,r=o.min(0).value;if(i=i.map((t=>t.map(((t,i)=>Math.floor((t-r[i])/(p[i]-r[i])*19)+20*i)))),!e){const a=+t.select("[name=topics]").property("value");e=new PLSA(a),e.init(i)}e.fit(),l(e.predict().map((t=>t+1))),a&&a()}))})).epoch()};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.',dispPLSA(t.setting.ml.configElement,t)}