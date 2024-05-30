var k=Object.defineProperty;var u=(e,n)=>k(e,"name",{value:n,configurable:!0});import{RBM as v,GBRBM as h}from"../../lib/model/rbm.js";import b from"../controller.js";export default function M(e){e.setting.ml.usage='Click "Fit" button. Then, click "estimate" button.',e.setting.ml.reference={title:"Restricted Boltzmann machine (Wikipedia)",url:"https://en.wikipedia.org/wiki/Restricted_Boltzmann_machine"};const n=new b(e);let t=null,i=null,l=null,c=1;const R=u(()=>{const d=e._step;e._step=8;let s=e.trainInput;e.task==="DN"&&(s=[s.flat(2)]),t||(a.value==="RBM"?(t=new v(p.value,o.value),c=255):(t=new h(p.value,o.value,e.task==="DN"),c=1)),t.fit(s),e.task==="GR"?e.trainResult=t.predict(s):(i=[e.testInput(8).flat(2)],i=t.predict(i),l=u(r=>e.testResult(r[0].map(B=>B*c)),"pcb"),l(i)),e._step=d},"fitModel");let a=null;e.task==="GR"?a=n.input({type:"hidden",value:"GBRBM"}):a=n.select(["RBM","GBRBM"]);const p=n.input.number({label:" hidden nodes ",min:1,max:100,value:10}),o=n.input.number({label:" learning rate ",min:.01,max:10,step:.01,value:.01});n.stepLoopButtons().init(()=>{t=null,e.init()}).step(R).epoch(),e.task!=="GR"&&(n.text(" Estimate"),n.stepLoopButtons().init(()=>{t&&(i=[e.testInput(8).flat(2)],l=u(d=>e.testResult(d[0].map(s=>s*c)),"pcb"),l(i))}).step(()=>{t&&(i=t.predict(i),l(i))}))}u(M,"default");
