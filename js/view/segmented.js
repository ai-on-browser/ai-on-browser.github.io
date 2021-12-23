import SegmentedRegression from"../../lib/model/segmented.js";var dispSegmentedRegression=function(e,t){e.append("span").text("Segments "),e.append("input").attr("type","number").attr("name","s").attr("min",1).attr("max",10).attr("value",3),e.append("input").attr("type","button").attr("value","Fit").on("click",(()=>{t.fit(((n,i)=>{const a=+e.select("[name=s]").property("value"),s=new SegmentedRegression(a);s.fit(n,i),t.predict(((e,t)=>{t(s.predict(e))}),1)}))}))};export default function(e){e.setting.ml.usage='Click and add data point. Next, click "Fit" button.',e.setting.ml.require={dimension:1},dispSegmentedRegression(e.setting.ml.configElement,e)}