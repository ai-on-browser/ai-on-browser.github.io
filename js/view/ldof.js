var r=Object.defineProperty;var a=(e,t)=>r(e,"name",{value:t,configurable:!0});import u from"../../lib/model/ldof.js";import s from"../controller.js";export default function d(e){e.setting.ml.usage='Click and add data point. Then, click "Calculate".',e.setting.ml.reference={author:"K. Zhang, M. Hutter, H. Jin",title:"A New Local Distance-Based Outlier Detection Approach for Scattered Real-World Data",year:2009};const t=new s(e),n=a(()=>{const o=new u(l.value).predict(e.trainInput);e.trainResult=o.map(i=>i>c.value)},"calc"),l=t.input.number({label:" k = ",min:1,max:100,value:5}).on("change",n),c=t.input.number({label:" t = ",min:0,max:100,step:.1,value:1.5}).on("change",n);t.input.button("Calculate").on("click",n)}a(d,"default");
