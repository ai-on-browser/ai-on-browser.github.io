var g=Object.defineProperty;var o=(e,t)=>g(e,"name",{value:t,configurable:!0});import v from"../../lib/model/svr.js";import m from"../controller.js";export default function h(e){e.setting.ml.usage='Click and add data point. Then, click "Calculate".';const t=new m(e);let l=null,i=0;const r=o(function(n){for(let c=0;c<+u.value;c++)l.fit();i+=+u.value;const d=l.predict(e.testInput(8));e.testResult(d),n&&n()},"calcSVR"),s=t.select(["gaussian","linear"]).on("change",()=>{s.value==="gaussian"?a.element.style.display="inline":a.element.style.display="none"}),a=t.input.number({value:.1,min:.1,max:10,step:.1}),p=t.stepLoopButtons().init(()=>{const n=[];s.value==="gaussian"&&n.push(a.value),l=new v(s.value,n),l.init(e.trainInput,e.trainOutput),i=0,e.init()}),u=t.select({label:" Iteration ",values:[1,10,100,1e3]});p.step(r).epoch(()=>i)}o(h,"default");
