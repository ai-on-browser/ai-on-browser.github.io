import OtsusThresholding from"../../lib/model/otsu.js";var dispOtsu=function(t,e){e.colorSpace="gray";t.append("input").attr("type","button").attr("value","Fit").on("click",(()=>{e.fit(((e,s,n)=>{const a=new OtsusThresholding;let i=a.predict(e.flat(2));t.select("[name=threshold]").text(a._t),n(i.map((t=>specialCategory.density(1-t))))}),1)})),t.append("span").text(" Estimated threshold "),t.append("span").attr("name","threshold")};export default function(t){t.setting.ml.usage='Click "Fit" button.',dispOtsu(t.setting.ml.configElement,t)}