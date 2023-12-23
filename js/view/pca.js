var k=Object.defineProperty;var y=(e,l)=>k(e,"name",{value:l,configurable:!0});import{PCA as b,DualPCA as h,KernelPCA as A,AnomalyPCA as C}from"../../lib/model/pca.js";import f from"../controller.js";export default function w(e){e.setting.ml.usage='Click and add data point. Next, click "Fit" button.';const l=new f(e),m=y(()=>{if(e.task==="DR"){const i=e.dimension;let n;if(u.value==="")n=new b;else if(u.value==="dual")n=new h;else{const a=[];s.value==="polynomial"?a.push(v.value):s.value==="gaussian"&&a.push(g.value),n=new A(s.value,a)}n.fit(e.trainInput);const d=n.predict(e.trainInput,i);e.trainResult=d}else{const i=new C;i.fit(e.trainInput);const n=r.value,d=i.predict(e.trainInput);e.trainResult=d.map(p=>p>n);const a=i.predict(e.testInput(10));e.testResult(a.map(p=>p>n))}},"fitModel");let u=null;e.task!=="AD"&&(u=l.select(["","dual","kernel"]).on("change",()=>{u.value==="kernel"?t.element.style.display="inline-block":t.element.style.display="none"}));const t=l.span();t.element.style.display="none";const s=t.select(["gaussian","polynomial"]).on("change",function(){o.element.style.display="none",c.element.style.display="none",s.value==="polynomial"?o.element.style.display="inline-block":s.value==="gaussian"&&(c.element.style.display="inline-block")}),o=t.span();o.element.style.display="none";const v=o.input.number({label:" d = ",value:2,min:1,max:10}),c=t.span(),g=c.input.number({label:" sigma = ",value:1,min:0,max:10,step:.1});let r=null;e.task==="AD"&&(r=l.input.number({label:" threshold = ",value:.1,min:0,max:10,step:.01}).on("change",m)),l.input.button("Fit").on("click",m)}y(w,"default");
