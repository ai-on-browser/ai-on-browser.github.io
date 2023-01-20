import Matrix from"../../lib/util/matrix.js";import Controller from"../controller.js";import{BaseWorker}from"../utils.js";class MLPWorker extends BaseWorker{constructor(){super("js/view/worker/mlp_worker.js",{type:"module"})}initialize(e,t,i,a,l){this._postMessage({mode:"init",type:e,hidden_sizes:t,activation:i,optimizer:a},l)}fit(e,t,i,a,l,s){this._postMessage({mode:"fit",x:e,y:t,iteration:i,rate:a,batch:l},s)}predict(e,t){this._postMessage({mode:"predict",x:e},t)}}export default function(e){e.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.';const t=new Controller(e),i=e.task,a=new MLPWorker;let l=0;const s=()=>"TP"===i?r.value:e.datas.dimension||2;let r=null;"TP"===i&&(r=t.input.number({label:"window width",min:1,max:1e3,value:20}));const n=t.array({label:" Hidden Layers ",type:"number",values:[10],default:10,min:1,max:100}),o=t.select({label:" Activation ",values:["sigmoid","tanh","relu","elu","leaky_relu","rrelu","prelu","gaussian","softplus","softsign","identity"]}),u=t.select({label:" Optimizer ",values:["sgd","adam","momentum","rmsprop"]}),p=t.stepLoopButtons().init((()=>{0!==e.datas.length&&(a.initialize("CF"===i?"classifier":"regressor",n.value,o.value,u.value),e.init())})),m=t.select({label:" Iteration ",values:[1,10,100,1e3,1e4]}),d=t.input.number({label:" Learning rate ",min:0,max:100,step:.01,value:.001}),c=t.input.number({label:" Batch size ",min:1,max:100,value:10});let v;p.step((t=>{const r=s();let n=e.trainInput,o=e.trainOutput;const u=Matrix.fromArray(n);if("TP"===i){o=n.slice(r),n=[];for(let e=0;e<u.rows-r;e++)n.push(u.slice(e,e+r).value)}"CF"===i&&(o=o.map((e=>e[0]))),a.fit(n,o,+m.value,d.value,c.value,(s=>{if(l=s.data.epoch,e.plotLoss(s.data.loss),"TP"===i){let i=u.slice(u.rows-r).value;const l=[],s=()=>{if(l.length>=v.value)return e.trainResult=l,void(t&&t());a.predict([i],(e=>{e.data[0];l.push(e.data[0]),i=i.slice(u.cols),i.push(...e.data[0]),s()}))};s()}else a.predict(e.testInput(1===r?2:4),(i=>{const a=i.data;e.testResult(a),t&&t()}))}))})).epoch((()=>l)),v="TP"===i?t.input.number({label:" predict count",min:1,max:1e3,value:100}):t.input({type:"hidden",value:0}),e.setting.ternimate=()=>{a.terminate()}}