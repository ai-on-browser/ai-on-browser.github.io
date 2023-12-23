import{MLPClassifier as t,MLPRegressor as o}from"../../../lib/model/mlp.js";self.model=null,self.addEventListener("message",function(l){const e=l.data;if(e.mode==="init")e.type==="classifier"?self.model=new t(e.hidden_sizes,e.activation,e.optimizer):self.model=new o(e.hidden_sizes,e.activation,e.optimizer),self.postMessage(null);else if(e.mode==="fit"){if(e.x.length===0){self.postMessage(null);return}const i=self.model.fit(e.x,e.y,e.iteration,e.rate,e.batch);self.postMessage({epoch:self.model.epoch,loss:i})}else if(e.mode==="predict"){const s=self.model.predict(e.x);self.postMessage(s)}},!1);
