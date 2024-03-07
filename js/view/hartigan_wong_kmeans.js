var c=Object.defineProperty;var i=(n,e)=>c(n,"name",{value:e,configurable:!0});import u from"../../lib/model/hartigan_wong_kmeans.js";import d from"../controller.js";export default function p(n){n.setting.ml.usage='Click and add data point. Then, click "Fit" button.',n.setting.ml.reference={title:"k-means clustering (Wikipedia)",url:"https://en.wikipedia.org/wiki/K-means_clustering#Hartigan%E2%80%93Wong_method"};const e=new d(n);let t=null;const r=i(()=>{t||(t=new u(l.value),t.init(n.trainInput)),t.fit();const s=t.predict(n.trainInput);n.trainResult=s.map(o=>o+1),n.centroids(t.centroids,t.centroids.map((o,a)=>a+1),{line:!0})},"fitModel"),l=e.input.number({label:" k ",min:1,max:1e3,value:3});e.stepLoopButtons().init(()=>{t=null}).step(r).epoch()}i(p,"default");
