import ICA from"../../lib/model/ica.js";var dispICA=function(t,i){t.append("input").attr("type","button").attr("value","Fit").on("click",(()=>{i.fit(((t,n,e)=>{const o=i.dimension,a=new ICA;a.fit(t);e(a.predict(t,o))}))}))};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',dispICA(t.setting.ml.configElement,t)}