var c=Object.defineProperty;var i=(t,e)=>c(t,"name",{value:e,configurable:!0});import p from"../../lib/model/oapbpm.js";import m from"../controller.js";export default function d(t){t.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.',t.setting.ml.reference={author:"R. F. Harrington",title:"Online Ranking/Collaborative filtering using the Perceptron Algorithm",year:2003};const e=new m(t);let n=null;const l=i(()=>{if(!n)return;n.fit(t.trainInput,t.trainOutput.map(s=>s[0]));const o=n.predict(t.testInput(4));t.testResult(o)},"fitModel"),a=e.input.number({label:" N ",value:10,min:1,max:100}),u=e.input.number({label:" Tau ",value:.5,min:0,max:1,step:.1}),r=e.input.number({label:" Learning rate ",value:.1,min:0,max:100,step:.1});e.stepLoopButtons().init(()=>{n=new p(a.value,u.value,r.value),t.init()}).step(l).epoch()}i(d,"default");
