import MDS from"../../lib/model/mds.js";var dispMDS=function(i,t){t.setting.ml.reference={title:"Multidimensional scaling (Wikipedia)",url:"https://en.wikipedia.org/wiki/Multidimensional_scaling"};i.append("input").attr("type","button").attr("value","Fit").on("click",(()=>(i=>{const n=t.dimension,e=(new MDS).predict(t.trainInput,n);t.trainResult=e})()))};export default function(i){i.setting.ml.usage='Click and add data point. Next, click "Fit" button.',dispMDS(i.setting.ml.configElement,i)}