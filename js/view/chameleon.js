var c=Object.defineProperty;var r=(n,t)=>c(n,"name",{value:t,configurable:!0});import s from"../../lib/model/chameleon.js";import m from"../controller.js";export default function d(n){n.setting.ml.usage='Click and add data point. Then, click "Fit" button.',n.setting.ml.reference={author:"G. Karypis, E. Han, V. Kumar",title:"CHAMELEON: A Hierarchical Clustering Algorithm Using Dynamic Modeling",year:1999};const t=new m(n);let e=null;const u=r(()=>{e=new s(o.value),e.fit(n.trainInput);const i=e.predict(a.value);n.trainResult=i.map(l=>l+1)},"fitModel"),o=t.input.number({label:"n",min:1,max:100,value:5});t.input.button("Fit").on("click",u);const a=t.input.number({label:"k",min:1,max:100,value:10}).on("change",()=>{if(!e)return;const i=e.predict(a.value);n.trainResult=i.map(l=>l+1)})}r(d,"default");
