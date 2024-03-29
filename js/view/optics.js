var p=Object.defineProperty;var i=(t,e)=>p(t,"name",{value:e,configurable:!0});import h from"../../lib/model/optics.js";import d from"../controller.js";export default function b(t){t.setting.ml.usage='Click and add data point. Then, click "Fit" button.',t.setting.ml.reference={title:"OPTICS algorithm (Wikipedia)",url:"https://en.wikipedia.org/wiki/OPTICS_algorithm"};const e=new d(t),n=i(()=>{const l=new h(u.value,s.value,c.value,o.value);l.fit(t.trainInput);const a=l.predict();t.trainResult=a.map(m=>m+1),r.value=new Set(a).size},"fitModel"),o=e.select(["euclid","manhattan","chebyshev"]).on("change",()=>n()),s=e.input.number({label:"eps",min:.01,max:100,step:.01,value:100}).on("change",()=>n()),c=e.input.number({label:"min pts",min:2,max:1e3,value:10}).on("change",()=>n()),u=e.input.number({label:"threshold",min:.01,max:10,step:.01,value:.08}).on("change",()=>n());e.input.button("Fit").on("click",()=>n());const r=e.text({label:" Clusters: "})}i(b,"default");
