var k=Object.defineProperty;var o=(n,l)=>k(n,"name",{value:l,configurable:!0});import y from"../../lib/model/spectral.js";import b from"../controller.js";export default function f(n){n.setting.ml.usage='Click and add data point. Next, click "Initialize". Then, click "Add cluster". Finally, click "Step" button repeatedly.',n.setting.ml.reference={title:"Spectral clustering (Wikipedia)",url:"https://en.wikipedia.org/wiki/Spectral_clustering"};const l=new b(n);let e=null;const u=l.select(["rbf","knn"]).on("change",()=>{const t=u.value;c.element.style.display="none",a.element.style.display="none",t==="rbf"&&(c.element.style.display="inline"),t==="knn"&&(a.element.style.display="inline")}),c=l.span(),p=c.input.number({label:"s =",min:.01,max:100,step:.01,value:1}),a=l.span(),d=a.input.number({label:"k =",min:1,max:100,value:10});a.element.style.display="none";const m=l.stepLoopButtons().init(()=>{const t={sigma:p.value,k:d.value};e=new y(u.value,t),e.init(n.trainInput),r.value=e.size,i.element.querySelectorAll("input").forEach(s=>s.disabled=null)}),i=l.span();i.input.button("Add cluster").on("click",()=>{e.add();let t=e.predict();n.trainResult=t.map(s=>s+1),r.value=e.size});const r=i.text("0");i.text(" clusters"),i.input.button("Clear cluster").on("click",()=>{e.clear(),r.value="0"}),m.step(()=>{if(e.size===0)return;e.fit();let t=e.predict();n.trainResult=t.map(s=>s+1)}).epoch(()=>e.epoch),i.element.querySelectorAll("input").forEach(t=>t.disabled=!0)}o(f,"default");
