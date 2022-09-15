import{DefaultPlatform,LossPlotter}from"./base.js";export default class SemisupervisedPlatform extends DefaultPlatform{constructor(t,e){super(t,e);const s=this.setting.task.configElement,i=document.createElement("div");i.innerText="Unlabeled data category is '0' (black).",s.appendChild(i),s.appendChild(document.createTextNode("Unlabeled Rate"));const n=document.createElement("input");n.type="number",n.min=0,n.max=1,n.step=.1,n.value=.9,n.name="unlabeled-rate",n.onchange=()=>{if(this.datas&&this._original_classes)for(let t=0;t<this._original_classes.length;t++)this.datas.y[t]=this._original_classes[t];this._original_classes=null,this.init()},s.appendChild(n)}get trainInput(){return this.datas.x}get trainOutput(){return this.datas.y.map((t=>[t]))}set trainResult(t){this._renderer.trainResult=t,this._tablerenderer.trainResult=t}testInput(t=10){const e=this._renderer.testData(t);return"SC"===this._task&&e.push(...this.datas.x),e}testResult(t){if("SC"===this._task){const e=t.slice(t.length-this.datas.length),s=this.datas.y;if(t=t.slice(0,t.length-this.datas.length),"SC"===this._task){let t=0;for(let i=0;i<s.length;i++)s[i]===e[i]&&t++;this._getEvaluateElm().innerText="Accuracy:"+t/s.length}this._tablerenderer.trainResult=e}this._renderer.testResult(t)}init(){this.setting.footer.innerText="";const t=+this.setting.task.configElement.querySelector("[name=unlabeled-rate]").value;if(t>0&&!this._original_classes){this._original_classes=this.datas.y.concat();const e={};for(let t=0;t<this.datas.length;t++)e[this._original_classes[t]]||(e[this._original_classes[t]]=[]),e[this._original_classes[t]].push(t);for(const s of Object.keys(e)){let i=Math.floor(e[s].length*t);for(;i>0;){const t=Math.floor(Math.random()*e[s].length);this.datas.y[e[s][t]]=null,e[s].splice(t,1),i--}}}this._renderer.init(),this._tablerenderer.init(),this.render(),this._loss&&(this._loss.terminate(),this._loss=null,this.setting.footer.replaceChildren())}render(){this._renderer.render(),this._tablerenderer.render()}_getEvaluateElm(){if(this._loss){const t=this.setting.footer.querySelector("div.evaluate_result");if(!t){const t=document.createElement("div");return t.classList.add("evaluate_result"),this.setting.footer.insertBefore(t,this.setting.footer.firstChild),t}return t}return this.setting.footer}plotLoss(t){if(!this._loss){const t=this.setting.footer.innerText;this.setting.footer.innerText="",this._loss=new LossPlotter(this,this.setting.footer),this._getEvaluateElm().innerText=t}this._loss.add(t)}terminate(){if(this.datas&&this._original_classes)for(let t=0;t<this._original_classes.length;t++)this.datas.y[t]=this._original_classes[t];this.setting.task.configElement.replaceChildren(),this.setting.footer.innerText="",super.terminate()}}