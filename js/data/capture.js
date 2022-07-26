import ImageData from"./image.js";export default class CaptureData extends ImageData{constructor(t){super(t),this._size=[240,360];const e=this.setting.data.configElement;this._mngelm=document.createElement("div"),e.appendChild(this._mngelm);const i=document.createElement("input");i.type="button",i.value="Add data",i.onclick=()=>this.startVideo(),this._mngelm.appendChild(i),this._slctImg=document.createElement("select"),this._slctImg.onchange=()=>{this._manager.platform.render(),this._thumbnail.replaceChildren(),this._thumbnail.appendChild(this._createCanvas(this.x[0]))},this._mngelm.appendChild(this._slctImg),this._thumbnail=document.createElement("span"),this._mngelm.appendChild(this._thumbnail),this._videoElm=document.createElement("div"),e.appendChild(this._videoElm),this.startVideo(),this._x=[],this._y=[]}get availTask(){return["SG","DN","ED"]}get x(){const t=+this._slctImg.value-1;return 0!==this._x.length&&this._x[t]?[this._x[t]]:[]}startVideo(){this._mngelm.style.display="none";const t=document.createElement("div");t.innerText="Click video to use as data.",this._videoElm.appendChild(t),this._video=document.createElement("video"),this._videoElm.appendChild(this._video),this._video.width=this._size[1],this._video.height=this._size[0],this._video.autoplay=!0,this._video.onclick=()=>{this.readImage(this._video).then((t=>{this._x.push(t),this._y.push(0);const e=document.createElement("option");e.value=e.innerText=this._x.length,this._slctImg.appendChild(e),this._slctImg.value=this._x.length,this._thumbnail.replaceChildren(),this._thumbnail.appendChild(this._createCanvas(t)),this.stopVideo(),this._mngelm.style.display=null,this._manager.platform.render&&setTimeout((()=>{this._manager.platform.render()}),0)}))},navigator.mediaDevices.getDisplayMedia({video:!0}).then((t=>{this._video.srcObject=t})).catch((t=>{console.error(t),this.stopVideo(),this._mngelm.style.display=null}))}stopVideo(){if(this._video){const t=this._video.srcObject;t&&(t.getTracks().forEach((t=>{t.stop()})),this._video.srcObject=null),this._video=null}this._videoElm.replaceChildren()}terminate(){super.terminate(),this.stopVideo()}}