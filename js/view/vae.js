var b=Object.defineProperty;var c=(e,t)=>b(e,"name",{value:t,configurable:!0});import y from"../neuralnetwork_builder.js";import R from"../controller.js";import{BaseWorker as z}from"../utils.js";class _ extends z{static{c(this,"VAEWorker")}constructor(){super("js/view/worker/vae_worker.js",{type:"module"})}initialize(t,i,n,u,r,p,o){return this._type=o,this._postMessage({mode:"init",in_size:t,noise_dim:i,enc_layers:n,dec_layers:u,optimizer:r,class_size:p,type:o})}fit(t,i,n,u,r){return this._postMessage({mode:"fit",x:t,y:i,iteration:n,rate:u,batch:r})}predict(t,i){return this._postMessage({mode:"predict",x:t,y:i})}reduce(t,i){return this._postMessage({mode:"reduce",x:t,y:i})}}export default function O(e){e.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.';const t=new R(e),i=e.task,n=new _;let u=0;const r=c(async s=>{if(e.datas.length===0){s&&s();return}const a=await n.fit(e.trainInput,e.trainOutput,+w.value,k.value,m.value);if(u=a.data.epoch,e.plotLoss(a.data.loss),i==="DR"){const d=await n.reduce(e.trainInput,e.trainOutput);e.trainResult=d.data}else if(i==="GR"){const h=(await n.predict(e.trainInput,e.trainOutput)).data;n._type==="conditional"?e.trainResult=[h,e.trainOutput]:e.trainResult=h}s&&s()},"fitModel"),p=c(async()=>{const a=(await n.predict(e.trainInput,e.trainOutput)).data;o.value==="conditional"?e.trainResult=[a,e.trainOutput]:e.trainResult=a},"genValues"),o=t.select(["default","conditional"]);let g=null;i!=="DR"&&(g=t.input.number({label:"Noise dim",min:1,max:100,value:5}));const l=new y;l.makeHtml(e.setting.ml.configElement,{optimizer:!0});const v=t.stepLoopButtons().init(s=>{if(e.datas.length===0){s();return}const a=new Set(e.trainOutput.map(d=>d[0])).size;n.initialize(e.datas.dimension,g?.value??e.dimension,l.layers,l.invlayers,l.optimizer,a,o.value).then(s),e.init()}),w=t.select({label:" Iteration ",values:[1,10,100,1e3,1e4]}),k=t.input.number({label:"Learning rate ",min:0,max:100,step:.01,value:.001}),m=t.input.number({label:" Batch size ",min:1,max:100,value:10});v.step(r).epoch(()=>u),i==="GR"&&t.input.button("Generate").on("click",p),e.setting.terminate=()=>{n.terminate()}}c(O,"default");
