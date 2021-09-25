import{Matrix}from"../../lib/util/math.js";class AutoencoderWorker extends BaseWorker{constructor(){super("js/view/worker/autoencoder_worker.js",{type:"module"})}initialize(t,e,a,r,n,p){this._postMessage({mode:"init",input_size:t,reduce_size:e,enc_layers:a,dec_layers:r,optimizer:n},p)}fit(t,e,a,r,n,p){this._postMessage({mode:"fit",x:t,iteration:e,rate:a,batch:r,rho:n},(t=>p(t.data)))}predict(t,e){this._postMessage({mode:"predict",x:t},e)}reduce(t,e){this._postMessage({mode:"reduce",x:t},(t=>e(t.data)))}}var dispAEClt=function(t,e,a){return r=>{const n=+t.select("[name=iteration]").property("value"),p=+t.select("[name=batch]").property("value"),i=+t.select("[name=rate]").property("value"),o=+t.select("[name=rho]").property("value");a.fit(((t,s,l)=>{e.fit(t,n,i,p,o,(n=>{e.reduce(t,(t=>{let p=t;const i=Matrix.fromArray(p).argmax(1).value.map((t=>t+1));a.predict(((t,a)=>{e.reduce(t,(t=>{let e=t,p=Matrix.fromArray(e).argmax(1);p.add(1),l(i),a(p.value),r&&r(n.epoch)}))}),8)}))}))}))}},dispAEad=function(t,e,a){return r=>{const n=+t.select("[name=iteration]").property("value"),p=+t.select("[name=batch]").property("value"),i=+t.select("[name=rate]").property("value"),o=+t.select("[name=rho]").property("value"),s=+t.select("[name=threshold]").property("value");a.fit(((t,l,c)=>{e.fit(t,n,i,p,o,(n=>{a.predict(((a,p)=>{let i=[].concat(t,a);e.predict(i,(e=>{let i=e.data.slice(0,t.length),o=e.data.slice(t.length),l=t[0].length;const d=[];for(let e=0;e<i.length;e++){let a=0;for(let r=0;r<l;r++)a+=(i[e][r]-t[e][r])**2;d.push(a>s)}const u=[];for(let t=0;t<o.length;t++){let e=0;for(let r=0;r<l;r++)e+=(o[t][r]-a[t][r])**2;u.push(e>s)}c(d),p(u),r&&r(n.epoch)}))}),4)}))}))}},dispAEdr=function(t,e,a){return r=>{const n=+t.select("[name=iteration]").property("value"),p=+t.select("[name=batch]").property("value"),i=+t.select("[name=rate]").property("value"),o=+t.select("[name=rho]").property("value");a.fit(((t,a,s)=>{e.fit(t,n,i,p,o,(a=>{e.reduce(t,(t=>{s(t),r&&r(a.epoch)}))}))}))}},dispAE=function(t,e){const a=e.task,r=new AutoencoderWorker;let n=0;const p="AD"===a?dispAEad(t,r,e):"CT"===a?dispAEClt(t,r,e):dispAEdr(t,r,e);"DR"!==a&&(t.append("span").text(" Size "),t.append("input").attr("type","number").attr("name","node_number").attr("value",10).attr("min",1).attr("max",100).property("required",!0));const i=new NeuralNetworkBuilder;i.makeHtml(t,{optimizer:!0});const o=e.setting.ml.controller.stepLoopButtons().init((()=>{if(e.init(),0===e.datas.length)return;const a=e.dimension||+t.select("[name=node_number]").property("value");r.initialize(e.datas.dimension,a,i.layers,i.invlayers,i.optimizer)}));return t.append("span").text(" Iteration "),t.append("select").attr("name","iteration").selectAll("option").data([1,10,100,1e3,1e4]).enter().append("option").property("value",(t=>t)).text((t=>t)),t.append("span").text(" Learning rate "),t.append("input").attr("type","number").attr("name","rate").attr("min",0).attr("max",100).attr("step",.01).attr("value",.001),t.append("span").text(" Batch size "),t.append("input").attr("type","number").attr("name","batch").attr("value",10).attr("min",1).attr("max",100).attr("step",1),t.append("span").text(" Sparse rho "),t.append("input").attr("type","number").attr("name","rho").attr("value",.02).attr("min",0).attr("max",1).attr("step",.01),"AD"===a&&(t.append("span").text(" threshold = "),t.append("input").attr("type","number").attr("name","threshold").attr("value",.02).attr("min",0).attr("max",10).attr("step",.01)),o.step((t=>{p((e=>{n=e,t&&t()}))})).epoch((()=>n)),()=>{r.terminate()}};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.',t.setting.terminate=dispAE(t.setting.ml.configElement,t)}