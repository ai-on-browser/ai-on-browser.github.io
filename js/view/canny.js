import Canny from"../../lib/model/canny.js";var dispCanny=function(t,n){n.colorSpace="gray";const a=()=>{n.fit(((n,a,e)=>{const p=+t.select("[name=th1]").property("value"),r=+t.select("[name=th2]").property("value");e(new Canny(p,r).predict(n).flat())}),1)};t.append("span").text(" big threshold "),t.append("input").attr("type","number").attr("name","th1").attr("value",200).attr("min",0).attr("max",255).on("change",a),t.append("span").text(" small threshold "),t.append("input").attr("type","number").attr("name","th2").attr("value",80).attr("min",0).attr("max",255).on("change",a),t.append("input").attr("type","button").attr("value","Fit").on("click",a)};export default function(t){t.setting.ml.usage='Click "Fit" button.',dispCanny(t.setting.ml.configElement,t)}