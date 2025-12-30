var b=Object.defineProperty;var c=(e,n)=>b(e,"name",{value:n,configurable:!0});import $ from"../../lib/model/ensemble_binary.js";import{KernelRidge as g,MulticlassRidge as f,Ridge as p}from"../../lib/model/ridge.js";import R from"../../lib/util/matrix.js";import W from"../controller.js";export default function X(e){e.setting.ml.usage='Click and add data point. Next, click "Fit" button.',e.setting.ml.reference={title:"Ridge regression (Wikipedia)",url:"https://en.wikipedia.org/wiki/Ridge_regression"},e.setting.ml.detail=`
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
`;const n=new W(e),r=e.task,h=c(()=>{const m=e.datas.dimension,l=i.value==="no kernel"?null:i.value;let t;const a=+k.value;if(r==="CF"?l?t=new $(()=>new g(a,l),s.value):s.value==="multiclass"?t=new f(a):t=new $(()=>new p(a),s.value):l?t=new g(a,l):t=new p(a),r==="FS"){t.fit(e.trainInput,e.trainOutput);const u=t.importance().map((o,d)=>[o,d]);u.sort((o,d)=>d[0]-o[0]);const w=e.dimension,v=u.map(o=>o[1]).slice(0,w),y=R.fromArray(e.trainInput);e.trainResult=y.col(v).toArray()}else{t.fit(e.trainInput,e.trainOutput);const u=t.predict(e.testInput(l?m===1?1:10:m===1?100:4));e.testResult(u)}},"fitModel");let s=null;r==="CF"&&(s=n.select(["oneone","onerest","multiclass"]).on("change",()=>{s.value==="multiclass"?i.element.style.display="none":i.element.style.display=null}));let i=null;r!=="FS"?i=n.select(["no kernel","gaussian"]):i=n.input({type:"hidden",value:""});const k=n.select({label:"lambda = ",values:[0,1e-4,.001,.01,.1,1,10,100]});n.input.button("Fit").on("click",()=>h())}c(X,"default");
