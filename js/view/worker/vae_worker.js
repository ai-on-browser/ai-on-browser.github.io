import VAE from"../../../lib/model/vae.js";self.model=null,self.addEventListener("message",(function(e){const s=e.data;if("init"===s.mode)self.model=new VAE(s.in_size,s.noise_dim,s.enc_layers,s.dec_layers,s.optimizer,s.class_size,s.type),self.postMessage(null);else if("fit"===s.mode){if(0===s.x.length)return void self.postMessage(null);self.model.fit(s.x,s.y,s.iteration,s.rate,s.batch),self.postMessage({epoch:self.model.epoch})}else if("predict"===s.mode){const e=self.model.predict(s.x,s.y,s.out);self.postMessage(e)}}),!1);