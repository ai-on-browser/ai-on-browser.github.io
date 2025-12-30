var v=Object.defineProperty;var o=(e,n)=>v(e,"name",{value:n,configurable:!0});import c from"../../lib/model/elastic_net.js";import $ from"../../lib/util/matrix.js";import g from"../controller.js";export default function x(e){e.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.',e.setting.ml.reference={author:"H. Zou, T. Hastie",title:"Regularization and variable selection via the elastic net",year:2005},e.setting.ml.detail=`
The model form is
$$
f(X) = X W + \\epsilon
$$

The loss function can be written as
$$
L(W) = \\| X W - y \\|^2 + \\alpha \\lambda \\| W \\|_1 + (1 - \\alpha) \\lambda \\| W \\|^2
$$
where $ y $ is the observed value corresponding to $ X $.
`;const n=new g(e);let a=new c;const u=e.task,r=o(()=>{if(a._alpha=+s.value,u==="FS"){a.fit(e.trainInput,e.trainOutput);const t=a.importance().map((i,l)=>[i,l]);t.sort((i,l)=>l[0]-i[0]);const m=e.dimension,h=t.map(i=>i[1]).slice(0,m),b=$.fromArray(e.trainInput);e.trainResult=b.col(h).toArray()}else{a.fit(e.trainInput,e.trainOutput);const t=a.predict(e.testInput(4));e.testResult(t)}},"fitModel"),d=n.select({label:"lambda = ",name:"lambda",values:[1e-4,.001,.01,.1,1,10,100]}),s=n.input.number({label:"alpha = ",name:"alpha",value:.5,min:0,max:1,step:.1}).on("change",()=>{const t=+s.value;p.value=t===0?" ridge ":t===1?" lasso ":""}),p=n.text();n.stepLoopButtons().init(()=>{a=new c(+d.value,+s.value),e.init()}).step(r).epoch()}o(x,"default");
