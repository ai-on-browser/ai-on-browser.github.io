var b=Object.defineProperty;var o=(e,a)=>b(e,"name",{value:a,configurable:!0});import c from"../../lib/model/elastic_net.js";import v from"../controller.js";export default function $(e){e.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.',e.setting.ml.reference={author:"H. Zou, T. Hastie",title:"Regularization and variable selection via the elastic net",year:2005},e.setting.ml.detail=`
The model form is
$$
f(X) = X W + \\epsilon
$$

The loss function can be written as
$$
L(W) = \\| X W - y \\|^2 + \\alpha \\lambda \\| W \\|_1 + (1 - \\alpha) \\lambda \\| W \\|^2
$$
where $ y $ is the observed value corresponding to $ X $.
`;const a=new v(e);let i=new c;const u=e.task,d=o(()=>{if(i._alpha=+l.value,u==="FS"){i.fit(e.trainInput,e.trainOutput);const t=i.importance().map((n,s)=>[n,s]);t.sort((n,s)=>s[0]-n[0]);const h=e.dimension,m=t.map(n=>n[1]).slice(0,h);e.trainResult=e.trainInput.map(n=>m.map(s=>n[s]))}else{i.fit(e.trainInput,e.trainOutput);const t=i.predict(e.testInput(4));e.testResult(t)}},"fitModel"),p=a.select({label:"lambda = ",name:"lambda",values:[1e-4,.001,.01,.1,1,10,100]}),l=a.input.number({label:"alpha = ",name:"alpha",value:.5,min:0,max:1,step:.1}).on("change",()=>{const t=+l.value;r.value=t===0?" ridge ":t===1?" lasso ":""}),r=a.text();a.stepLoopButtons().init(()=>{i=new c(+p.value,+l.value),e.init()}).step(d).epoch()}o($,"default");
