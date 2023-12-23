var k=Object.defineProperty;var l=(t,e)=>k(t,"name",{value:e,configurable:!0});import h from"../../lib/util/matrix.js";import g from"../../lib/model/lasso.js";import w from"../controller.js";export default function y(t){t.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.',t.setting.ml.reference={title:"Lasso (Wikipedia)",url:"https://en.wikipedia.org/wiki/Lasso_(statistics)"},t.setting.ml.detail=`
The model form is
$$
f(X) = X W + \\epsilon
$$

The loss function can be written as
$$
L(W) = \\| X W - y \\|^2 + \\lambda \\| W \\|_1
$$
where $ y $ is the observed value corresponding to $ X $.
`;const e=new w(t);let i=null;const c=t.task,r=l(s=>{if(c==="FS"){i.fit(t.trainInput,t.trainOutput);const o=i.importance().map((n,a)=>[n,a]);o.sort((n,a)=>a[0]-n[0]);const p=t.dimension,$=o.map(n=>n[1]).slice(0,p),m=h.fromArray(t.trainInput);t.trainResult=m.col($).toArray(),s&&s()}else{i.fit(t.trainInput,t.trainOutput);const o=i.predict(t.testInput(4));t.testResult(o),s&&s()}},"fitModel"),d=e.select(["CD","ISTA","LARS"]),u=e.select({label:"lambda = ",values:[0,1e-4,.001,.01,.1,1,10,100]});e.stepLoopButtons().init(()=>{i=new g(+u.value,d.value),t.init()}).step(r).epoch()}l(y,"default");
