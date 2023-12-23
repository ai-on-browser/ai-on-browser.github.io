import t from"../../../lib/model/autoencoder.js";self.model=null,self.addEventListener("message",function(l){const e=l.data;if(e.mode==="init")self.model=new t(e.input_size,e.reduce_size,e.enc_layers,e.dec_layers,e.optimizer),self.postMessage(null);else if(e.mode==="fit"){if(e.x.length===0){self.postMessage(null);return}const o=self.model.fit(e.x,e.iteration,e.rate,e.batch,e.rho);self.postMessage({epoch:self.model.epoch,loss:o})}else if(e.mode==="predict"){const s=self.model.predict(e.x);self.postMessage(s)}else if(e.mode==="reduce"){const s=self.model.reduce(e.x);self.postMessage(s)}},!1);
