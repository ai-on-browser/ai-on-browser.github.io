var v=Object.defineProperty;var r=(t,e)=>v(t,"name",{value:e,configurable:!0});import b from"../controller.js";import{BaseWorker as g}from"../utils.js";class x extends g{static{r(this,"RNNWorker")}constructor(){super("js/view/worker/rnn_worker.js",{type:"module"})}initialize(e,n,i,a,s){return this._postMessage({mode:"init",method:e,window:n,unit:i,out_size:a,optimizer:s})}fit(e,n,i,a,s){return this._postMessage({mode:"fit",x:e,y:n,iteration:i,rate:a,batch:s})}predict(e,n){return this._postMessage({mode:"predict",x:e,k:n})}}export default function k(t){t.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.';const e=new b(t),n=new x;let i=0;const a=r(async o=>{const l=await n.fit(t.trainInput,t.trainInput,+d.value,p.value,m.value);i=l.data.epoch,t.plotLoss(l.data.loss);const w=await n.predict(t.trainInput,h.value);t.trainResult=w.data,o&&o()},"fitModel"),s=e.select(["rnn","LSTM","GRU"]),u=e.input.number({label:"window width",min:1,max:1e3,value:30}),c=e.stepLoopButtons().init(o=>{if(t.datas.length===0){o();return}n.initialize(s.value.toLowerCase(),u.value,3,t.trainInput[0].length).then(o),t.init()}),d=e.select({label:" Iteration ",values:[1,10,100,1e3,1e4]}),p=e.input.number({label:" Learning rate ",min:0,max:100,step:.01,value:.001}),m=e.input.number({label:" Batch size ",min:1,max:100,value:10});c.step(a).epoch(()=>i);const h=e.input.number({label:" predict count",min:1,max:1e3,value:100});t.setting.ternimate=()=>{n.terminate()}}r(k,"default");
