var c=Object.defineProperty;var i=(e,n)=>c(e,"name",{value:n,configurable:!0});import u from"../../lib/model/hamelry_kmeans.js";import d from"../controller.js";export default function m(e){e.setting.ml.usage='Click and add data point. Then, click "Fit" button.',e.setting.ml.reference={author:"G. Hamelry",title:"Making k-means Even Faster",year:2010};const n=new d(e);let t=null;const r=i(()=>{t||(t=new u(l.value),t.init(e.trainInput)),t.fit();const a=t.predict(e.trainInput);e.trainResult=a.map(o=>o+1),e.centroids(t.centroids,t.centroids.map((o,s)=>s+1),{line:!0})},"fitModel"),l=n.input.number({label:" k ",min:1,max:1e3,value:3});n.stepLoopButtons().init(()=>{t=null}).step(r).epoch()}i(m,"default");
