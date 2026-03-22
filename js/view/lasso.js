var $=Object.defineProperty;var a=(t,i)=>$(t,"name",{value:i,configurable:!0});import k from"../../lib/model/lasso.js";import m from"../controller.js";export default function b(t){t.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.',t.setting.ml.reference={title:"Lasso (Wikipedia)",url:"https://en.wikipedia.org/wiki/Lasso_(statistics)"},t.setting.ml.detail=`
The model form is
$$
f(X) = X W + \\epsilon
$$

The loss function can be written as
$$
L(W) = \\| X W - y \\|^2 + \\lambda \\| W \\|_1
$$
where $ y $ is the observed value corresponding to $ X $.
`;const i=new m(t);let n=null;const c=t.task,l=a(()=>{if(c==="FS"){n.fit(t.trainInput,t.trainOutput);const o=n.importance().map((e,s)=>[e,s]);o.sort((e,s)=>s[0]-e[0]);const r=t.dimension,p=o.map(e=>e[1]).slice(0,r);t.trainResult=t.trainInput.map(e=>p.map(s=>e[s]))}else{n.fit(t.trainInput,t.trainOutput);const o=n.predict(t.testInput(4));t.testResult(o)}},"fitModel"),d=i.select(["CD","ISTA","LARS"]),u=i.select({label:"lambda = ",values:[0,1e-4,.001,.01,.1,1,10,100]});i.stepLoopButtons().init(()=>{n=new k(+u.value,d.value),t.init()}).step(l).epoch()}a(b,"default");
