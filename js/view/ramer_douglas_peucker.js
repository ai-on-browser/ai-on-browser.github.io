import RamerDouglasPeucker from"../../lib/model/ramer_douglas_peucker.js";var dispRDP=function(t,e){const a=a=>{e.fit(((a,n)=>{const i=+t.select("[name=e]").property("value"),r=new RamerDouglasPeucker(i);r.fit(a.map((t=>t[0])),n.map((t=>t[0]))),e.predict(((t,e)=>{e(r.predict(t.map((t=>t[0]))))}),1)}))};t.append("span").text(" e "),t.append("input").attr("type","number").attr("name","e").attr("value",.1).attr("min",0).attr("max",100).attr("step",.1).on("change",a),t.append("input").attr("type","button").attr("value","Fit").on("click",(()=>a()))};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',t.setting.ml.require={dimension:1},dispRDP(t.setting.ml.configElement,t)}