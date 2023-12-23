var r=Object.defineProperty;var i=(e,n)=>r(e,"name",{value:n,configurable:!0});import d from"../../lib/model/sst.js";import h from"../controller.js";export default function p(e){e.setting.ml.usage='Click and add data point. Then, click "Calculate".',e.setting.ml.reference={title:"Singular spectrum analysis (Wikipedia)",url:"https://en.wikipedia.org/wiki/Singular_spectrum_analysis"};const n=new h(e),o=i(function(){let c=new d(l.value);const s=e.trainInput.map(t=>t[0]),u=c.predict(s);for(let t=0;t<l.value*3/4;t++)u.unshift(0);e.trainResult=u,e.threshold=a.value},"calcSST"),l=n.input.number({label:" window = ",min:1,max:100,value:10}),a=n.input.number({label:" threshold = ",min:0,max:1,step:.01,value:.1}).on("change",()=>{e.threshold=a.value});n.input.button("Calculate").on("click",o)}i(p,"default");
