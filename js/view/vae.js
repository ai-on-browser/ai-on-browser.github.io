import NeuralNetworkBuilder from"../neuralnetwork_builder.js";import Controller from"../controller.js";class VAEWorker extends BaseWorker{constructor(){super("js/view/worker/vae_worker.js",{type:"module"})}initialize(t,e,a,n,r,i,p,o){this._postMessage({mode:"init",in_size:t,noise_dim:e,enc_layers:a,dec_layers:n,optimizer:r,class_size:i,type:p},o),this._type=p}fit(t,e,a,n,r,i){this._postMessage({mode:"fit",x:t,y:e,iteration:a,rate:n,batch:r},i)}predict(t,e,a){this._postMessage({mode:"predict",x:t,y:e},a)}reduce(t,e,a){this._postMessage({mode:"reduce",x:t,y:e},a)}}var dispVAE=function(t,e){const a=new Controller(e),n=e.task,r=new VAEWorker;let i=0;const p=a=>{r.predict(e.trainInput,e.trainOutput,(n=>{const r=n.data,i=t.select("[name=type]").property("value");e.trainResult="conditional"===i?[r,e.trainOutput]:r,a&&a()}))};t.append("select").attr("name","type").selectAll("option").data(["default","conditional"]).enter().append("option").property("value",(t=>t)).text((t=>t)),"DR"!==n&&(t.append("span").text("Noise dim"),t.append("input").attr("type","number").attr("name","noise_dim").attr("min",1).attr("max",100).attr("value",5));const o=new NeuralNetworkBuilder;o.makeHtml(t,{optimizer:!0});const s=a.stepLoopButtons().init((()=>{if(0===e.datas.length)return;const a=e.dimension||+t.select("[name=noise_dim]").property("value"),n=t.select("[name=type]").property("value"),i=e.datas.categories.length;r.initialize(e.datas.dimension,a,o.layers,o.invlayers,o.optimizer,i,n),e.init()}));return t.append("span").text(" Iteration "),t.append("select").attr("name","iteration").selectAll("option").data([1,10,100,1e3,1e4]).enter().append("option").property("value",(t=>t)).text((t=>t)),t.append("span").text("Learning rate "),t.append("input").attr("type","number").attr("name","rate").attr("min",0).attr("max",100).attr("step",.01).attr("value",.001),t.append("span").text(" Batch size "),t.append("input").attr("type","number").attr("name","batch").attr("value",10).attr("min",1).attr("max",100).attr("step",1),s.step((a=>{if(0===e.datas.length)return void(a&&a());const p=+t.select("[name=iteration]").property("value"),o=+t.select("[name=rate]").property("value"),s=+t.select("[name=batch]").property("value");r.fit(e.trainInput,e.trainOutput,p,o,s,(t=>{i=t.data.epoch,e.plotLoss(t.data.loss),"DR"===n?r.reduce(e.trainInput,e.trainOutput,(t=>{const n=t.data.mean;e.trainResult=n,a&&a()})):"GR"===n&&r.predict(e.trainInput,e.trainOutput,(t=>{const n=t.data;"conditional"===r._type?e.trainResult=[n,e.trainOutput]:e.trainResult=n,a&&a()}))}))})).epoch((()=>i)),"GR"===n&&t.append("input").attr("type","button").attr("value","Generate").on("click",p),()=>{r.terminate()}};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.',t.setting.terminate=dispVAE(t.setting.ml.configElement,t)}