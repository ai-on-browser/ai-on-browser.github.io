var g=Object.defineProperty;var a=(n,e)=>g(n,"name",{value:e,configurable:!0});import m from"../../lib/model/cof.js";import C from"../controller.js";export default function p(n){n.setting.ml.usage='Click and add data point. Then, click "Calculate".',n.setting.ml.reference={author:"J. Tang, Z. Chen, A. W. Fu, D. W. Cheung",title:"Enhancing Effectiveness of Outlier Detections for Low Density Patterns",year:2002};const e=n.task,t=new C(n),i=a(function(){let s=new m(h.value);if(e==="AD"){const l=s.predict(n.trainInput);n.trainResult=l.map(o=>o>u.value)}else{const l=c.value,o=n.trainInput.rolling(l),r=s.predict(o);for(let d=0;d<l/2;d++)r.unshift(1);n.trainResult=r,n.threshold=u.value}},"calcCOF");let c;e==="CP"&&(c=t.input.number({label:" window = ",value:5,min:1,max:100}).on("change",function(){i()}));const h=t.input.number({label:" k = ",min:1,max:100,value:5}).on("change",()=>{i()}),u=t.input.number({label:" threshold = ",value:1.5,min:0,max:100,step:.1}).on("change",()=>{i()});t.input.button("Calculate").on("click",i)}a(p,"default");
