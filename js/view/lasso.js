var m=Object.defineProperty;var a=(t,e)=>m(t,"name",{value:e,configurable:!0});import k from"../../lib/model/lasso.js";import b from"../../lib/util/matrix.js";import h from"../controller.js";export default function g(t){t.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.',t.setting.ml.reference={title:"Lasso (Wikipedia)",url:"https://en.wikipedia.org/wiki/Lasso_(statistics)"},t.setting.ml.detail=`
The model form is
$$
f(X) = X W + \\epsilon
$$

The loss function can be written as
$$
L(W) = \\| X W - y \\|^2 + \\lambda \\| W \\|_1
$$
where $ y $ is the observed value corresponding to $ X $.
`;const e=new h(t);let i=null;const c=t.task,l=a(()=>{if(c==="FS"){i.fit(t.trainInput,t.trainOutput);const s=i.importance().map((n,o)=>[n,o]);s.sort((n,o)=>o[0]-n[0]);const u=t.dimension,p=s.map(n=>n[1]).slice(0,u),$=b.fromArray(t.trainInput);t.trainResult=$.col(p).toArray()}else{i.fit(t.trainInput,t.trainOutput);const s=i.predict(t.testInput(4));t.testResult(s)}},"fitModel"),r=e.select(["CD","ISTA","LARS"]),d=e.select({label:"lambda = ",values:[0,1e-4,.001,.01,.1,1,10,100]});e.stepLoopButtons().init(()=>{i=new k(+d.value,r.value),t.init()}).step(l).epoch()}a(g,"default");
