import SMARegression from"../../lib/model/sma.js";var dispSMA=function(t,i){t.append("input").attr("type","button").attr("value","Fit").on("click",(()=>{i.fit(((t,e)=>{const n=new SMARegression;n.fit(t.map((t=>t[0])),e.map((t=>t[0]))),i.predict(((t,i)=>{i(n.predict(t.map((t=>t[0]))))}),1)}))}))};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',t.setting.ml.require={dimension:1},dispSMA(t.setting.ml.configElement,t)}