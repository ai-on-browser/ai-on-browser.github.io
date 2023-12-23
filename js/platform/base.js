var h=Object.defineProperty;var a=(n,t)=>h(n,"name",{value:t,configurable:!0});import o from"../renderer/scatter.js";import l from"../renderer/util/lineplot.js";import d from"../renderer/util/centroids.js";import u from"../renderer/table.js";export class BasePlatform{static{a(this,"BasePlatform")}constructor(t){this._manager=t,this._renderer=[new o(t)]}get task(){return this._manager.task}get setting(){return this._manager.setting}get svg(){return this._renderer[0].svg}get datas(){return this._manager._datas}get params(){return{}}set params(t){}get trainInput(){return null}get trainOutput(){return null}testInput(){return null}init(){}render(){this._renderer.forEach(t=>t.render())}terminate(){this._renderer.forEach(t=>t.terminate())}}export class DefaultPlatform extends BasePlatform{static{a(this,"DefaultPlatform")}constructor(t){super(t),this._renderer.push(new u(t));const e=this.setting.task.configElement;if(this.task==="DR"||this.task==="FS"){e.appendChild(document.createTextNode("Target dimension"));const s=document.createElement("input");s.type="number",s.min=1,s.max=2,s.value=2,s.name="dimension",e.appendChild(s)}}get dimension(){const e=this.setting.task.configElement.querySelector("[name=dimension]");return e?+e.value:null}get trainInput(){let t=this.datas.dimension>0?this.datas.x:this.datas.index.map((e,s)=>[isNaN(e)?s:e]);if(this.task==="CF"||this.task==="RG")for(const e of this._manager.preprocesses)t=e.apply(t);return t}get trainOutput(){return this.datas.y.map(t=>[t])}set trainResult(t){if(this.task==="CT")t.forEach((e,s)=>{this.datas.y[s]=e}),this.render();else if(this.task==="AD"||this.task==="DR"||this.task==="FS"||this.task==="TF"||this.task==="GR")this._renderer.forEach(e=>e.trainResult=t);else throw new Error(`Invalid task ${this.task}`)}testInput(t=10){let e=this._renderer[0].testData(t);if(this.task==="CF"||this.task==="RG"){e.push(...this.datas.dimension>0?this.datas.x:this.datas.index.map((s,r)=>[isNaN(s)?r:s]));for(const s of this._manager.preprocesses)e=s.apply(e)}return e}testResult(t){if(this.task==="CF"||this.task==="RG"){const e=t.slice(t.length-this.datas.length),s=this.datas.y;if(t=t.slice(0,t.length-this.datas.length),this.task==="CF"){let r=0;for(let i=0;i<s.length;i++)s[i]===e[i]&&r++;this._getEvaluateElm().innerText="Accuracy:"+r/s.length}else if(this.task==="RG"){let r=0;for(let i=0;i<s.length;i++)r+=(s[i]-e[i])**2;this._getEvaluateElm().innerText="RMSE:"+Math.sqrt(r/s.length)}this._renderer.forEach(r=>r.trainResult=e)}this._renderer[0].testResult(t)}evaluate(t){this.task!=="CF"&&this.task!=="RG"||t(this.datas.x,e=>{const s=this.datas.y;if(this.task==="CF"){let r=0;for(let i=0;i<s.length;i++)s[i]===e[i]&&r++;this._getEvaluateElm().innerText="Accuracy:"+r/s.length}else if(this.task==="RG"){let r=0;for(let i=0;i<s.length;i++)r+=(s[i]-e[i])**2;this._getEvaluateElm().innerText="RMSE:"+Math.sqrt(r/s.length)}})}init(){this._cur_dimension=this.setting.dimension,this.setting.footer.innerText="",this._centroids&&(this._centroids.terminate(),this._centroids=null),this._renderer.forEach(t=>t.init()),this.render(),this._loss&&(this._loss.terminate(),this._loss=null,this.setting.footer.replaceChildren())}centroids(t,e,{line:s=!1,duration:r=0}={}){this._centroids||(this._centroids=new d(this._renderer[0])),this._centroids.set(t,e,{line:s,duration:r})}_getEvaluateElm(){if(this._loss){const t=this.setting.footer.querySelector("div.evaluate_result");if(!t){const e=document.createElement("div");return e.classList.add("evaluate_result"),this.setting.footer.insertBefore(e,this.setting.footer.firstChild),e}return t}return this.setting.footer}plotLoss(t){if(!this._loss){const e=this.setting.footer.innerText;this.setting.footer.innerText="",this._loss=new l(this.setting.footer),this._getEvaluateElm().innerText=e}this._loss.add(t)}terminate(){this.setting.task.configElement.replaceChildren(),this.setting.footer.innerText="",super.terminate()}}
