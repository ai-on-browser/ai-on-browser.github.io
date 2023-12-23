var b=Object.defineProperty;var c=(e,a)=>b(e,"name",{value:a,configurable:!0});import g from"../../lib/util/matrix.js";import u from"../../lib/model/elastic_net.js";import x from"../controller.js";export default function y(e){e.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.',e.setting.ml.reference={author:"H. Zou, T. Hastie",title:"Regularization and variable selection via the elastic net",year:2005},e.setting.ml.detail=`
The model form is
$$
f(X) = X W + \\epsilon
$$

The loss function can be written as
$$
L(W) = \\| X W - y \\|^2 + \\alpha \\lambda \\| W \\|_1 + (1 - \\alpha) \\lambda \\| W \\|^2
$$
where $ y $ is the observed value corresponding to $ X $.
`;const a=new x(e);let n=new u;const r=e.task,d=c(t=>{if(n._alpha=+s.value,r==="FS"){n.fit(e.trainInput,e.trainOutput);const l=n.importance().map((i,o)=>[i,o]);l.sort((i,o)=>o[0]-i[0]);const h=e.dimension,v=l.map(i=>i[1]).slice(0,h),$=g.fromArray(e.trainInput);e.trainResult=$.col(v).toArray(),t&&t()}else{n.fit(e.trainInput,e.trainOutput);const l=n.predict(e.testInput(4));e.testResult(l),t&&t()}},"fitModel"),p=a.select({label:"lambda = ",name:"lambda",values:[1e-4,.001,.01,.1,1,10,100]}),s=a.input.number({label:"alpha = ",name:"alpha",value:.5,min:0,max:1,step:.1}).on("change",()=>{let t=+s.value;m.value=t===0?" ridge ":t===1?" lasso ":""}),m=a.text();a.stepLoopButtons().init(()=>{n=new u(+p.value,+s.value),e.init()}).step(d).epoch()}c(y,"default");
