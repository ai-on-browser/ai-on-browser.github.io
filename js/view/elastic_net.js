var v=Object.defineProperty;var o=(e,a)=>v(e,"name",{value:a,configurable:!0});import $ from"../../lib/util/matrix.js";import c from"../../lib/model/elastic_net.js";import g from"../controller.js";export default function x(e){e.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.',e.setting.ml.reference={author:"H. Zou, T. Hastie",title:"Regularization and variable selection via the elastic net",year:2005},e.setting.ml.detail=`
The model form is
$$
f(X) = X W + \\epsilon
$$

The loss function can be written as
$$
L(W) = \\| X W - y \\|^2 + \\alpha \\lambda \\| W \\|_1 + (1 - \\alpha) \\lambda \\| W \\|^2
$$
where $ y $ is the observed value corresponding to $ X $.
`;const a=new g(e);let n=new c;const u=e.task,r=o(()=>{if(n._alpha=+l.value,u==="FS"){n.fit(e.trainInput,e.trainOutput);const t=n.importance().map((i,s)=>[i,s]);t.sort((i,s)=>s[0]-i[0]);const m=e.dimension,h=t.map(i=>i[1]).slice(0,m),b=$.fromArray(e.trainInput);e.trainResult=b.col(h).toArray()}else{n.fit(e.trainInput,e.trainOutput);const t=n.predict(e.testInput(4));e.testResult(t)}},"fitModel"),d=a.select({label:"lambda = ",name:"lambda",values:[1e-4,.001,.01,.1,1,10,100]}),l=a.input.number({label:"alpha = ",name:"alpha",value:.5,min:0,max:1,step:.1}).on("change",()=>{let t=+l.value;p.value=t===0?" ridge ":t===1?" lasso ":""}),p=a.text();a.stepLoopButtons().init(()=>{n=new c(+d.value,+l.value),e.init()}).step(r).epoch()}o(x,"default");
