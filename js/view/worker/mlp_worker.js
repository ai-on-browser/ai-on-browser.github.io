import{MLPClassifier,MLPRegressor}from"../../../lib/model/mlp.js";self.model=null,self.addEventListener("message",(function(e){const s=e.data;if("init"===s.mode)"classifier"===s.type?self.model=new MLPClassifier(s.hidden_sizes,s.activation,s.optimizer):self.model=new MLPRegressor(s.hidden_sizes,s.activation,s.optimizer),self.postMessage(null);else if("fit"===s.mode){if(0===s.x.length)return void self.postMessage(null);self.model.fit(s.x,s.y,s.iteration,s.rate,s.batch),self.postMessage({epoch:self.model.epoch})}else if("predict"===s.mode){const e=self.model.predict(s.x);self.postMessage(e)}}),!1);