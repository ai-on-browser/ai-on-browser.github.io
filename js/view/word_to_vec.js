import Controller from"../controller.js";class W2VWorker extends BaseWorker{constructor(){super("js/view/worker/word2vec_worker.js",{type:"module"})}initialize(t,e,a,r,n,p){this._postMessage({mode:"init",method:t,n:e,wordsOrNumber:a,reduce_size:r,optimizer:n},p)}fit(t,e,a,r,n){this._postMessage({mode:"fit",words:t,iteration:e,rate:a,batch:r},n)}predict(t,e){this._postMessage({mode:"predict",x:t},e)}reduce(t,e){this._postMessage({mode:"reduce",x:t},(t=>e(t.data)))}}var dispW2V=function(t,e){const a=new Controller(e),r=new W2VWorker;let n=0;t.append("select").attr("name","method").selectAll("option").data(["CBOW","skip-gram"]).enter().append("option").property("value",(t=>t)).text((t=>t)),t.append("span").text(" n "),t.append("input").attr("type","number").attr("name","n").attr("min",1).attr("max",10).attr("value",1);const p=a.stepLoopButtons().init((()=>{if(e.init(),0===e.datas.length)return;const a=t.select("[name=method]").property("value"),n=+t.select("[name=n]").property("value");r.initialize(a,n,e.trainInput,2,"adam")}));return t.append("span").text(" Iteration "),t.append("select").attr("name","iteration").selectAll("option").data([1,10,100,1e3,1e4]).enter().append("option").property("value",(t=>t)).text((t=>t)),t.append("span").text(" Learning rate "),t.append("input").attr("type","number").attr("name","rate").attr("min",0).attr("max",100).attr("step",.01).attr("value",.001),t.append("span").text(" Batch size "),t.append("input").attr("type","number").attr("name","batch").attr("value",10).attr("min",1).attr("max",100).attr("step",1),p.step((a=>{const p=+t.select("[name=iteration]").property("value"),i=+t.select("[name=batch]").property("value"),o=+t.select("[name=rate]").property("value");r.fit(e.trainInput,p,o,i,(t=>{n=t.data.epoch,r.reduce(e.testInput(),(t=>{e.testResult(t),a&&a()}))}))})).epoch((()=>n)),()=>{r.terminate()}};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.',t.setting.terminate=dispW2V(t.setting.ml.configElement,t)}