import GasserMuller from"../../lib/model/gasser_muller.js";var dispGasserMuller=function(t,e){const i=t.append("input").attr("type","number").attr("name","sigma").attr("min",0).attr("value",1).attr("step",.01);t.append("input").attr("type","button").attr("value","Fit").on("click",(()=>(()=>{const t=+i.property("value");e.fit(((i,n)=>{const a=new GasserMuller(t);a.fit(i,n),e.predict(((t,e)=>{e(a.predict(t))}),1===e.datas.dimension?1:4)}))})()))};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',t.setting.ml.require={dimension:1},dispGasserMuller(t.setting.ml.configElement,t)}