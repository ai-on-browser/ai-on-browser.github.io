import ADALINE from"../../lib/model/adaline.js";import EnsembleBinaryModel from"../../lib/model/ensemble_binary.js";var dispADALINE=function(e,t){let n=null;e.append("select").attr("name","method").selectAll("option").data(["oneone","onerest"]).enter().append("option").property("value",(e=>e)).text((e=>e)),e.append("span").text(" Learning rate "),e.append("input").attr("type","number").attr("name","rate").attr("min",0).attr("max",100).attr("step",.1).attr("value",.1),t.setting.ml.controller.stepLoopButtons().init((()=>{n=null,t.init()})).step((a=>{const i=e.select("[name=method]").property("value"),r=+e.select("[name=rate]").property("value");t.fit(((e,l)=>{l=l.map((e=>e[0])),n||(n=new EnsembleBinaryModel((function(){return new ADALINE(r)}),i),n.init(e,l)),n.fit(),t.predict(((e,t)=>{t(n.predict(e)),a&&a()}),3)}))})).epoch()};export default function(e){e.setting.ml.usage='Click and add data point. Then, click "Step".',dispADALINE(e.setting.ml.configElement,e)}