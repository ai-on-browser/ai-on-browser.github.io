import{CatmullRomSplines,CentripetalCatmullRomSplines}from"../../lib/model/catmull_rom.js";var dispCatmullRomSplines=function(t,e){t.append("select").attr("name","method").selectAll("option").data(["","Centripetal"]).enter().append("option").property("value",(t=>t)).text((t=>t)),t.append("input").attr("type","button").attr("value","Calculate").on("click",(function(){e.fit(((l,n)=>{const a=t.select("[name=method]").property("value");let i=new CatmullRomSplines;"Centripetal"===a&&(i=new CentripetalCatmullRomSplines),i.fit(l.map((t=>t[0])),n.map((t=>t[0]))),e.predict(((t,e)=>{e(i.predict(t.map((t=>t[0]))))}),1)}))}))};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',t.setting.ml.require={dimension:1},dispCatmullRomSplines(t.setting.ml.configElement,t)}