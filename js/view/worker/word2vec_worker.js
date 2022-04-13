import Word2Vec from"../../../lib/model/word_to_vec.js";self.model=null,self.addEventListener("message",(function(e){const s=e.data;if("init"===s.mode)self.model=new Word2Vec(s.method,s.n,s.wordsOrNumber,s.reduce_size,s.optimizer),self.postMessage(null);else if("fit"===s.mode){if(0===s.words.length)return void self.postMessage(null);const e=self.model.fit(s.words,s.iteration,s.rate,s.batch);self.postMessage({epoch:self.model.epoch,loss:e})}else if("predict"===s.mode){const e=self.model.predict(s.x);self.postMessage(e)}else if("reduce"===s.mode){const e=self.model.reduce(s.x);self.postMessage(e)}}),!1);