import NormalHERD from"../../lib/model/normal_herd.js";import EnsembleBinaryModel from"../../lib/model/ensemble_binary.js";var dispNormalHERD=function(e,t){e.append("select").attr("name","method").selectAll("option").data(["oneone","onerest"]).enter().append("option").property("value",(e=>e)).text((e=>e)),e.append("select").attr("name","type").selectAll("option").data(["full","exact","project","drop"]).enter().append("option").property("value",(e=>e)).text((e=>e)),e.append("span").text(" c = "),e.append("input").attr("type","number").attr("name","c").attr("min",0).attr("max",10).attr("value",.1).attr("step",.1),e.append("input").attr("type","button").attr("value","Calculate").on("click",(a=>{const n=e.select("[name=method]").property("value"),p=e.select("[name=type]").property("value"),l=+e.select("[name=c]").property("value");t.fit(((e,r)=>{r=r.map((e=>e[0]));const o=new EnsembleBinaryModel((function(){return new NormalHERD(p,l)}),n);o.init(e,r),o.fit(),t.predict(((e,t)=>{t(o.predict(e)),a&&a()}),3)}))}))};export default function(e){e.setting.ml.usage='Click and add data point. Then, click "Calculate".',dispNormalHERD(e.setting.ml.configElement,e)}