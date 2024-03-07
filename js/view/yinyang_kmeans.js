var r=Object.defineProperty;var i=(n,t)=>r(n,"name",{value:t,configurable:!0});import d from"../../lib/model/yinyang_kmeans.js";import p from"../controller.js";export default function m(n){n.setting.ml.usage='Click and add data point. Then, click "Fit" button.',n.setting.ml.reference={author:"Y. Ding, Y. Zhao, X. Shen, M. Musuvathi, T. Mytkowicz",title:"Yinyang k-means: A drop-in replacement of the classic k-means with consistent speedup",year:2015};const t=new p(n);let e=null;const a=i(()=>{e||(e=new d(s.value,l.value),e.init(n.trainInput)),e.fit();const u=e.predict(n.trainInput);n.trainResult=u.map(o=>o+1),n.centroids(e.centroids,e.centroids.map((o,c)=>c+1),{line:!0})},"fitModel"),s=t.input.number({label:" k ",min:1,max:1e3,value:3}),l=t.input.number({label:" t ",min:1,max:100,value:1});t.stepLoopButtons().init(()=>{e=null}).step(a).epoch()}i(m,"default");
