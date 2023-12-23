var m=Object.defineProperty;var h=(e,l)=>m(e,"name",{value:l,configurable:!0});import{KNN as w,KNNRegression as p,KNNAnomaly as v,KNNDensityEstimation as N,SemiSupervisedKNN as C}from"../../lib/model/knearestneighbor.js";import g from"../controller.js";import{specialCategory as R}from"../utils.js";export default function b(e){e.setting.ml.usage='Click and add data point. Then, click "Calculate".';const l=new g(e),u=e.task;let s=5;const d=h(function(){if(u==="CF"){if(e.datas.length===0)return;let t=new w(s,c.value);t.fit(e.trainInput,e.trainOutput.map(i=>i[0]));const n=t.predict(e.testInput(4));e.testResult(n)}else if(u==="RG"){const t=e.datas.dimension;let n=new p(s,c.value);n.fit(e.trainInput,e.trainOutput.map(a=>a[0]));let i=n.predict(e.testInput(t===1?1:4));e.testResult(i)}else if(u==="AD"){const t=new v(s+1,c.value);t.fit(e.trainInput);const n=t.predict(e.trainInput).map(i=>i>r.value);e.trainResult=n}else if(u==="DE"){const t=new N(s+1,c.value);t.fit(e.trainInput);const n=t.predict(e.testInput(5)),i=Math.min(...n),a=Math.max(...n);e.testResult(n.map(I=>R.density((I-i)/(a-i))))}else if(u==="CP"){const t=new v(s+1,c.value),n=e.trainInput.rolling(o.value);t.fit(n);const i=t.predict(n);for(let a=0;a<o.value/2;a++)i.unshift(0);e.trainResult=i,e.threshold=r.value}else if(u==="SC"){const t=new C(s,c.value);t.fit(e.trainInput,e.trainOutput.map(n=>n[0])),e.trainResult=t.predict()}else if(u==="IN"){let t=new p(1,"euclid");t.fit(e.trainInput,e.trainOutput.map(i=>i[0]));let n=t.predict(e.testInput(1));e.testResult(n)}},"calcKnn"),c=l.select(["euclid","manhattan","chebyshev"]);if(u!=="IN"){const t=l.input.number({label:" k = ",min:1,max:100,value:s}).on("change",()=>{s=t.value})}let o=null;u==="CP"&&(o=l.input.number({label:" window = ",min:1,max:100,value:10}).on("change",()=>{d()}));let r=null;(u==="AD"||u==="CP")&&(r=l.input.number({label:" threshold = ",min:.001,max:10,step:.001,value:u==="AD"?.05:.4}).on("change",function(){d()})),l.input.button("Calculate").on("click",d)}h(b,"default");
