import NiblackThresholding from"../../lib/model/niblack.js";var dispNiblackThresholding=function(t,e){e.colorSpace="gray";const a=()=>{const a=+t.select("[name=n]").property("value"),n=+t.select("[name=k]").property("value");e.fit(((t,e,r)=>{r(new NiblackThresholding(a,n).predict(t).flat())}),1)};t.append("span").text(" n "),t.append("input").attr("type","number").attr("name","n").attr("value",3).attr("min",3).attr("max",99).attr("step",2).on("change",a),t.append("span").text(" k "),t.append("input").attr("type","number").attr("name","k").attr("value",.1).attr("min",-100).attr("max",100).attr("step",.1).on("change",a),t.append("input").attr("type","button").attr("value","Fit").on("click",a)};export default function(t){t.setting.ml.usage='Click "Fit" button.',dispNiblackThresholding(t.setting.ml.configElement,t)}