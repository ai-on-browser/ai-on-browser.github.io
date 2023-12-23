var o=Object.defineProperty;var r=(a,t)=>o(a,"name",{value:t,configurable:!0});import{DefaultPlatform as h}from"./base.js";import c from"../renderer/util/lineplot.js";export default class g extends h{static{r(this,"SemisupervisedPlatform")}constructor(t){super(t);const s=this.setting.task.configElement,i=document.createElement("div");i.innerText="Unlabeled data category is '0' (black).",s.appendChild(i),s.appendChild(document.createTextNode("Unlabeled Rate"));const e=document.createElement("input");e.type="number",e.min=0,e.max=1,e.step=.1,e.value=.9,e.name="unlabeled-rate",e.onchange=()=>{if(this.datas&&this._original_classes)for(let n=0;n<this._original_classes.length;n++)this.datas.y[n]=this._original_classes[n];this._original_classes=null,this.init()},s.appendChild(e)}get trainInput(){return this.datas.x}get trainOutput(){return this.datas.y.map(t=>[t])}set trainResult(t){this._renderer.forEach(s=>s.trainResult=t)}testInput(t=10){const s=this._renderer[0].testData(t);return s.push(...this.datas.x),s}testResult(t){const s=t.slice(t.length-this.datas.length),i=this.datas.y;t=t.slice(0,t.length-this.datas.length);let e=0;for(let n=0;n<i.length;n++)i[n]===s[n]&&e++;this._getEvaluateElm().innerText="Accuracy:"+e/i.length,this._renderer[0].testResult(t)}init(){this.setting.footer.innerText="";const s=+this.setting.task.configElement.querySelector("[name=unlabeled-rate]").value;if(s>0&&!this._original_classes){this._original_classes=this.datas.y.concat();const i={};for(let e=0;e<this.datas.length;e++)i[this._original_classes[e]]||(i[this._original_classes[e]]=[]),i[this._original_classes[e]].push(e);for(const e of Object.keys(i)){let n=Math.floor(i[e].length*s);for(;n>0;){const l=Math.floor(Math.random()*i[e].length);this.datas.y[i[e][l]]=null,i[e].splice(l,1),n--}}}this._renderer.forEach(i=>i.init()),this.render(),this._loss&&(this._loss.terminate(),this._loss=null,this.setting.footer.replaceChildren())}_getEvaluateElm(){if(this._loss){const t=this.setting.footer.querySelector("div.evaluate_result");if(!t){const s=document.createElement("div");return s.classList.add("evaluate_result"),this.setting.footer.insertBefore(s,this.setting.footer.firstChild),s}return t}return this.setting.footer}plotLoss(t){if(!this._loss){const s=this.setting.footer.innerText;this.setting.footer.innerText="",this._loss=new c(this.setting.footer),this._getEvaluateElm().innerText=s}this._loss.add(t)}terminate(){if(this.datas&&this._original_classes)for(let t=0;t<this._original_classes.length;t++)this.datas.y[t]=this._original_classes[t];this.setting.task.configElement.replaceChildren(),this.setting.footer.innerText="",super.terminate()}}
