import{ROMMA,AggressiveROMMA}from"../../lib/model/romma.js";import EnsembleBinaryModel from"../../lib/util/ensemble.js";var dispROMMA=function(e,t){e.append("select").attr("name","method").selectAll("option").data(["oneone","onerest"]).enter().append("option").property("value",(e=>e)).text((e=>e)),e.append("select").attr("name","type").selectAll("option").data(["","aggressive"]).enter().append("option").property("value",(e=>e)).text((e=>e)),e.append("input").attr("type","button").attr("value","Calculate").on("click",(n=>{const a=e.select("[name=method]").property("value"),l=e.select("[name=type]").property("value");t.fit(((e,p)=>{p=p.map((e=>e[0]));const o=new EnsembleBinaryModel(""===l?ROMMA:AggressiveROMMA,a);o.init(e,p),o.fit(),t.predict(((e,t)=>{t(o.predict(e)),n&&n()}),3)}))}))};export default function(e){e.setting.ml.usage='Click and add data point. Then, click "Calculate".',dispROMMA(e.setting.ml.configElement,e)}