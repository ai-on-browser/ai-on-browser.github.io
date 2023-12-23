var y=Object.defineProperty;var c=(e,n)=>y(e,"name",{value:n,configurable:!0});import b from"../../lib/util/matrix.js";import{Ridge as $,MulticlassRidge as R,KernelRidge as g}from"../../lib/model/ridge.js";import p from"../../lib/model/ensemble_binary.js";import W from"../controller.js";export default function X(e){e.setting.ml.usage='Click and add data point. Next, click "Fit" button.',e.setting.ml.reference={title:"Ridge regression (Wikipedia)",url:"https://en.wikipedia.org/wiki/Ridge_regression"},e.setting.ml.detail=`
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
`;const n=new W(e),r=e.task,h=c(()=>{const m=e.datas.dimension,s=i.value==="no kernel"?null:i.value;let t;const a=+f.value;if(r==="CF"?s?t=new p(function(){return new g(a,s)},l.value):l.value==="multiclass"?t=new R(a):t=new p(function(){return new $(a)},l.value):s?t=new g(a,s):t=new $(a),r==="FS"){t.fit(e.trainInput,e.trainOutput);const u=t.importance().map((o,d)=>[o,d]);u.sort((o,d)=>d[0]-o[0]);const k=e.dimension,w=u.map(o=>o[1]).slice(0,k),v=b.fromArray(e.trainInput);e.trainResult=v.col(w).toArray()}else{t.fit(e.trainInput,e.trainOutput);let u=t.predict(e.testInput(s?m===1?1:10:m===1?100:4));e.testResult(u)}},"fitModel");let l=null;r==="CF"&&(l=n.select(["oneone","onerest","multiclass"]).on("change",()=>{l.value==="multiclass"?i.element.style.display="none":i.element.style.display=null}));let i=null;r!=="FS"?i=n.select(["no kernel","gaussian"]):i=n.input({type:"hidden",value:""});const f=n.select({label:"lambda = ",values:[0,1e-4,.001,.01,.1,1,10,100]});n.input.button("Fit").on("click",()=>h())}c(X,"default");
