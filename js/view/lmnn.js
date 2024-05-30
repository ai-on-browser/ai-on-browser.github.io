var p=Object.defineProperty;var l=(e,t)=>p(e,"name",{value:t,configurable:!0});import d from"../../lib/model/lmnn.js";import g from"../controller.js";export default function b(e){e.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.',e.setting.ml.reference={title:"Large margin nearest neighbor (Wikipedia)",url:"https://en.wikipedia.org/wiki/Large_margin_nearest_neighbor"};const t=new g(e);let i=0,n=null;const u=l(()=>{if(!n)return;for(let o=0;o<+r.value;o++)n.fit();const a=n.predict(e.testInput(4));e.testResult(a),i+=+r.value},"fitModel"),s=t.input.number({label:" gamma ",min:1,max:1e3,value:5}),c=t.input.number({label:" lambda ",min:0,max:10,step:.1,value:.5}),m=t.stepLoopButtons().init(()=>{i=0,n=new d(s.value,c.value),n.init(e.trainInput,e.trainOutput.map(a=>a[0])),e.init()}),r=t.select({label:" Iteration ",values:[1,10,100,1e3]});m.step(u).epoch(()=>i)}l(b,"default");
