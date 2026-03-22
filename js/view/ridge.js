var b=Object.defineProperty;var r=(e,n)=>b(e,"name",{value:n,configurable:!0});import $ from"../../lib/model/ensemble_binary.js";import{KernelRidge as p,MulticlassRidge as y,Ridge as g}from"../../lib/model/ridge.js";import f from"../controller.js";export default function R(e){e.setting.ml.usage='Click and add data point. Next, click "Fit" button.',e.setting.ml.reference={title:"Ridge regression (Wikipedia)",url:"https://en.wikipedia.org/wiki/Ridge_regression"},e.setting.ml.detail=`
The model form is
$$
f(X) = X W + \\epsilon
$$

The loss function can be written as
$$
L(W) = \\| X W - y \\|^2 + \\lambda \\| W \\|^2
$$
where $ y $ is the observed value corresponding to $ X $.
Therefore, the optimum parameter $ \\hat{W} $ is estimated as
$$
\\hat{W} = \\left( X^T X + \\lambda I \\right)^{-1} X^T y
$$
`;const n=new f(e),d=e.task,h=r(()=>{const m=e.datas.dimension,a=s.value==="no kernel"?null:s.value;let t;const o=+k.value;if(d==="CF"?a?t=new $(()=>new p(o,a),l.value):l.value==="multiclass"?t=new y(o):t=new $(()=>new g(o),l.value):a?t=new p(o,a):t=new g(o),d==="FS"){t.fit(e.trainInput,e.trainOutput);const c=t.importance().map((i,u)=>[i,u]);c.sort((i,u)=>u[0]-i[0]);const w=e.dimension,v=c.map(i=>i[1]).slice(0,w);e.trainResult=e.trainInput.map(i=>v.map(u=>i[u]))}else{t.fit(e.trainInput,e.trainOutput);const c=t.predict(e.testInput(a?m===1?1:10:m===1?100:4));e.testResult(c)}},"fitModel");let l=null;d==="CF"&&(l=n.select(["oneone","onerest","multiclass"]).on("change",()=>{l.value==="multiclass"?s.element.style.display="none":s.element.style.display=null}));let s=null;d!=="FS"?s=n.select(["no kernel","gaussian"]):s=n.input({type:"hidden",value:""});const k=n.select({label:"lambda = ",values:[0,1e-4,.001,.01,.1,1,10,100]});n.input.button("Fit").on("click",()=>h())}r(R,"default");
