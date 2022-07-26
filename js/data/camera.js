import ImageData from"./image.js";export default class CameraData extends ImageData{constructor(e){super(e),this._size=[240,360];const t=this.setting.data.configElement;this._mngelm=document.createElement("div"),t.appendChild(this._mngelm);const i=document.createElement("input");i.type="button",i.value="Add data",i.onclick=()=>this.startVideo(),this._mngelm.appendChild(i),this._slctImg=document.createElement("select"),this._slctImg.onchange=()=>{this._manager.platform.render(),this._thumbnail.replaceChildren(),this._thumbnail.appendChild(this._createCanvas(this.x[0]))},this._mngelm.appendChild(this._slctImg),this._thumbnail=document.createElement("span"),this._mngelm.appendChild(this._thumbnail),this._videoElm=document.createElement("div"),t.appendChild(this._videoElm),this.startVideo(),this._x=[],this._y=[]}get availTask(){return["SG","DN","ED"]}get x(){const e=+this._slctImg.value-1;return 0!==this._x.length&&this._x[e]?[this._x[e]]:[]}startVideo(e){this._mngelm.style.display="none",this._videoElm.append("Click video to use as data.");const t=document.createElement("div");this._videoElm.appendChild(t);const i=document.createElement("select");i.onchange=()=>{this.stopVideo(),this.startVideo(i.value)},t.appendChild(i),this._video=document.createElement("video"),this._videoElm.appendChild(this._video),this._video.width=this._size[1],this._video.height=this._size[0],this._video.autoplay=!0,this._video.onclick=()=>{this.readImage(this._video).then((e=>{this._x.push(e),this._y.push(0);const t=document.createElement("option");t.value=t.innerText=this._x.length,this._slctImg.appendChild(t),this._slctImg.value=this._x.length,this._thumbnail.replaceChildren(),this._thumbnail.appendChild(this._createCanvas(e)),this.stopVideo(),this._mngelm.style.display=null,this._manager.platform.render&&setTimeout((()=>{this._manager.platform.render()}),0)}))},navigator.mediaDevices.getUserMedia({video:{deviceId:e}}).then((e=>{this._video.srcObject=e,navigator.mediaDevices.enumerateDevices().then((t=>{for(const e of t.filter((e=>"videoinput"===e.kind))){const t=document.createElement("option");t.value=e.deviceId,t.innerText=e.label,i.appendChild(t)}e.getTracks().forEach((e=>{i.value=e.getSettings().deviceId}))}))})).catch((e=>{console.error(e),this.stopVideo()}))}stopVideo(){if(this._video){const e=this._video.srcObject;e&&(e.getTracks().forEach((e=>{e.stop()})),this._video.srcObject=null),this._video=null}this._videoElm.replaceChildren()}terminate(){super.terminate(),this.stopVideo()}}