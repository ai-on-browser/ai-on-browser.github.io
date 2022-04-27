import OCSVM from"../../lib/model/ocsvm.js";import Controller from"../controller.js";export default function(e){e.setting.ml.usage='Click and add data point. Then, click "Calculate".';const t=new Controller(e);let n=null,l=0;const a=t.input.number({label:" nu ",min:0,max:1,step:.1,value:.5}),i=t.select(["gaussian","linear"]).on("change",(()=>{"gaussian"===i.value?s.element.style.display="inline":s.element.style.display="none"})),s=t.input.number({value:.1,min:.01,max:10,step:.01}),u=t.stepLoopButtons().init((()=>{const t=[];"gaussian"===i.value&&t.push(s.value),n=new OCSVM(a.value,i.value,t),n.init(e.trainInput,e.trainOutput),l=0,e.init()})),o=t.select({label:" Iteration ",values:[1,10,100,1e3]}),p=t.input.number({label:" threshold = ",min:0,max:1,step:.01,value:.6});u.step((function(t){for(let e=0;e<+o.value;e++)n.fit();l+=+o.value;const a=e.trainInput,i=[].concat(a,e.testInput(8));let s=n.predict(i);const u=Math.min(...s),r=Math.max(...s),c=p.value;s=s.map((e=>(e-u)/(r-u)<c)),e.trainResult=s.slice(0,a.length),e.testResult(s.slice(a.length)),t&&t()})).epoch((()=>l))}