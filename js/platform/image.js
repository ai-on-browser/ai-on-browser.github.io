import{BasePlatform}from"./base.js";import ImageData from"../data/image.js";import ImageRenderer from"../renderer/image.js";export default class ImagePlatform extends BasePlatform{constructor(e,t){super(e,t),this._reduce_algorithm="mean",this._color_space="rgb",this._normalize=!1,this._step=10,this._binary_threshold=180,this._renderer.terminate(),this._renderer=new ImageRenderer(t);const r=this.setting.task.configElement;r.append("Color space");const s=document.createElement("select");s.name="space",s.onchange=()=>{this._color_space=s.value,a.style.display="binary"===this._color_space?null:"none",this.render()};for(const e of Object.keys(ImageData.colorSpaces).map((e=>ImageData.colorSpaces[e]))){const t=document.createElement("option");t.value=e,t.innerText=e,s.appendChild(t)}r.appendChild(s);const a=document.createElement("input");a.type="number",a.name="threshold",a.min=0,a.max=255,a.value=this._binary_threshold,a.style.display="none",a.onchange=()=>{this._binary_threshold=a.value,this.render()},r.appendChild(a),r.append(" overwrap ");const n=document.createElement("input");n.name="opacity",n.type="range",n.min=0,n.max=1,n.step=.1,n.value=.5,n.oninput=()=>{this._renderer.resultOpacity=n.value},this._renderer.resultOpacity=n.value,r.appendChild(n)}set colorSpace(e){this._color_space=e,this.setting.task.configElement.querySelector("[name=space]").value=e,this.setting.task.configElement.querySelector("[name=threshold]").style.display="binary"===this._color_space?null:"none",this.render()}get trainInput(){const e=this.datas.x[0];return this.datas._applySpace(this.datas._reduce(e,this._step,this._reduce_algorithm),this._color_space,this._normalize,this._binary_threshold)}set trainResult(e){this._pred=e,this._renderer._displayResult(this.trainInput,e,this._step)}testInput(e=8){const t=this.datas.x[0],r=this.datas._reduce(t,e,this._reduce_algorithm);if("DN"===this.task)for(let e=0;e<r.length;e++)for(let t=0;t<r[e].length;t++)for(let s=0;s<r[e][t].length;s++)r[e][t][s]=Math.max(0,Math.min(255,r[e][t][s]+Math.floor(50*Math.random()-25)));const s=this.datas._applySpace(r,this._color_space,this._normalize,this._binary_threshold);return this.__pred=s,this.__pred_x=r,this.__pred_step=e,s}testResult(e){if(!Array.isArray(e[0])){const t=[];for(let r=0;r<e.length;r+=this.__pred[0][0].length){const s=[];for(let t=0;t<this.__pred[0][0].length;t++)s.push(e[r+t]);t.push(s)}e=t}this._pred=e,this._renderer._displayResult(this.__pred_x,e,this.__pred_step)}init(){this._renderer.init(),this.render()}render(){this._renderer.render()}terminate(){this.setting.task.configElement.replaceChildren(),super.terminate()}}