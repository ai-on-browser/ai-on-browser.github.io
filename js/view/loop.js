var r=Object.defineProperty;var l=(e,t)=>r(e,"name",{value:t,configurable:!0});import u from"../../lib/model/loop.js";import s from"../controller.js";export default function m(e){e.setting.ml.usage='Click and add data point. Then, click "Calculate".',e.setting.ml.reference={author:"H. P. Kriegel, P. Kr\xF6ger, E. Schubert, A. Zimek",title:"LoOP: Local Outlier Probabilities",year:2009};const t=new s(e),n=l(()=>{const a=new u(i.value).predict(e.trainInput);e.trainResult=a.map(c=>c>o.value)},"calc"),i=t.input.number({label:" k = ",min:1,max:100,value:5}).on("change",n),o=t.input.number({label:" t = ",min:0,max:1,step:.1,value:.5}).on("change",n);t.input.button("Calculate").on("click",n)}l(m,"default");
