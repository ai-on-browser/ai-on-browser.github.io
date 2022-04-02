import NeuralNetworkBuilder from"../neuralnetwork_builder.js";import Matrix from"../../lib/util/matrix.js";import Controller from"../controller.js";class NNWorker extends BaseWorker{constructor(){super("js/view/worker/neuralnetwork_worker.js",{type:"module"})}initialize(t,e,a,r){this._postMessage({mode:"init",layers:t,loss:e,optimizer:a},r)}fit(t,e,a,r,n,i){this._postMessage({mode:"fit",x:t,y:e,iteration:a,rate:r,batch:n},i)}predict(t,e){this._postMessage({mode:"predict",x:t},e)}}var dispNN=function(t,e){const a=new Controller(e),r=e.task,n=new NNWorker,i=new NeuralNetworkBuilder;let p=0,s=0;const o=()=>"TP"===r?+t.select("[name=width]").property("value"):e.datas.dimension||2;"TP"===r&&(t.append("span").text("window width"),t.append("input").attr("type","number").attr("name","width").attr("min",1).attr("max",1e3).attr("value",20)),t.append("span").text(" Hidden Layers "),i.makeHtml(t,{optimizer:!0});const l=a.stepLoopButtons().init((()=>{if(0===e.datas.length)return;const t=i.optimizer;s="CF"===r?Math.max.apply(null,e.datas.y)+1:"TP"===r?e.datas.dimension:1;const a=[{type:"input"}];a.push(...i.layers),a.push({type:"full",out_size:s}),"CF"===r&&a.push({type:"sigmoid"}),n.initialize(a,"mse",t),e.init(),p=0}));return t.append("span").text(" Iteration "),t.append("select").attr("name","iteration").selectAll("option").data([1,10,100,1e3,1e4]).enter().append("option").property("value",(t=>t)).text((t=>t)),t.append("span").text(" Learning rate "),t.append("input").attr("type","number").attr("name","rate").attr("min",0).attr("max",100).attr("step",.01).attr("value",.001),t.append("span").text(" Batch size "),t.append("input").attr("type","number").attr("name","batch").attr("value",10).attr("min",1).attr("max",100).attr("step",1),l.step((a=>{const i=+t.select("[name=iteration]").property("value"),l=+t.select("[name=batch]").property("value"),u=+t.select("[name=rate]").property("value"),d=+t.select("[name=pred_count]").property("value"),m=o();let c=e.trainInput,y=e.trainOutput;const h=Matrix.fromArray(c);if("TP"===r){y=c.slice(m),c=[];for(let t=0;t<h.rows-m;t++)c.push(h.slice(t,t+m).value)}else if("CF"===r)for(let t=0;t<y.length;t++){const e=Array(s).fill(0);e[y[t]]=1,y[t]=e}n.fit(c,y,i,u,l,(t=>{if(p+=i,"TP"===r){let t=h.slice(h.rows-m).value;const r=[],i=()=>{if(r.length>=d)return e.trainResult=r,void(a&&a());n.predict([t],(e=>{e.data[0];r.push(e.data[0]),t=t.slice(h.cols),t.push(...e.data[0]),i()}))};i()}else n.predict(e.testInput(1===m?2:4),(t=>{const n="CF"===r?Matrix.fromArray(t.data).argmax(1).value:t.data;e.testResult(n),a&&a()}))}))})).epoch((()=>p)),"TP"===r?(t.append("span").text(" predict count"),t.append("input").attr("type","number").attr("name","pred_count").attr("min",1).attr("max",1e3).attr("value",100)):t.append("input").attr("type","hidden").attr("name","pred_count").property("value",0),()=>{n.terminate()}};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.',t.setting.ternimate=dispNN(t.setting.ml.configElement,t)}