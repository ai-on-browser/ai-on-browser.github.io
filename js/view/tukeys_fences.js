import TukeysFences from"../../lib/model/tukeys_fences.js";var dispTukeysFences=function(e,t){t.setting.ml.reference={title:"Outlier (Wikipedia)",url:"https://en.wikipedia.org/wiki/Outlier#Tukey's_fences"};const n=function(){const n=+e.select("[name=k]").property("value"),a=new TukeysFences(n).predict(t.trainInput);t.trainResult=a};e.append("span").text(" k = "),e.append("input").attr("type","number").attr("name","k").attr("value",1.5).attr("min",0).attr("max",50).attr("step",.1).on("change",n),e.append("input").attr("type","button").attr("value","Calculate").on("click",n)};export default function(e){e.setting.ml.usage='Click and add data point. Then, click "Calculate".',dispTukeysFences(e.setting.ml.configElement,e)}