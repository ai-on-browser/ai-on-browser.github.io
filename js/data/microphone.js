var f=Object.defineProperty;var m=(p,i)=>f(p,"name",{value:i,configurable:!0});import x from"./audio.js";export default class v extends x{static{m(this,"MicrophoneData")}constructor(i){super(i),this._size=[120,360];const t=this.setting.data.configElement;this._mngelm=document.createElement("div"),t.appendChild(this._mngelm);const e=document.createElement("input");e.type="button",e.value="Add data",e.onclick=()=>this.startAudio(),this._mngelm.appendChild(e),this._slctImg=document.createElement("select"),this._slctImg.onchange=()=>{this.selectAudio()},this._mngelm.appendChild(this._slctImg),this._audio=document.createElement("audio"),this._audio.controls=!0,this._mngelm.appendChild(this._audio),this._slctRate=document.createElement("select"),this._slctRate.onchange=()=>{this._manager.platform.render()},this._mngelm.append("Sampling Rate: ",this._slctRate),this._audioElm=document.createElement("div"),t.appendChild(this._audioElm),this.startAudio(),this._x=[],this._y=[],this._audioDatas=[]}get availTask(){return["SM"]}get dimension(){return 1}get domain(){return[[-1,1]]}get x(){const i=this.selectedIndex;if(this._x.length===0||!this._x[i])return[];const t=+this._slctRate.value,e=[];for(let a=0;a<this._x[i].length;a+=t)e.push([this._x[i][a]]);return e}get selectedIndex(){return+this._slctImg.value-1}selectAudio(){const i=this._audioDatas[this.selectedIndex];this._audio.src=URL.createObjectURL(i.blob),this._audio.title=`data_${this.selectedIndex+1}.webm`,this._slctRate.replaceChildren();let t=1;for(;Number.isInteger(i.buff.sampleRate/t);){const e=document.createElement("option");e.value=t,e.text=i.buff.sampleRate/t,this._slctRate.appendChild(e),t*=2}this._manager.platform.render()}startAudio(i){this._mngelm.style.display="none",this._audioElm.append("Click stop to use as data.");const t=new AudioContext;let e=null;const a=[],n=document.createElement("div");this._audioElm.appendChild(n);const l=document.createElement("select");l.onchange=()=>{this.stopAudio(),this.startAudio(l.value)},n.appendChild(l);const o=document.createElement("input");o.type="button",o.value="Record",o.onclick=()=>{if(e){e.stop(),e=null;return}this._audioStream&&(o.value="Stop",e=new MediaRecorder(this._audioStream,{mimeType:"audio/webm"}),e.addEventListener("dataavailable",s=>{s.data.size>0&&a.push(s.data)}),e.addEventListener("stop",()=>{const s=new Blob(a);this.readAudio(s).then(d=>{this._x.push(Array.from(d.getChannelData(0))),this._y.push(0),this._audioDatas.push({blob:s,buff:d});const r=document.createElement("option");r.value=r.innerText=this._x.length,this._slctImg.appendChild(r),this._slctImg.value=this._x.length,this.selectAudio()}),this.stopAudio(),this._mngelm.style.display=null}),e.start())},this._audioElm.appendChild(o),navigator.mediaDevices.getUserMedia({audio:{deviceId:i}}).then(s=>{this._audioStream=s,navigator.mediaDevices.enumerateDevices().then(g=>{for(const u of g.filter(h=>h.kind==="audioinput")){const h=document.createElement("option");h.value=u.deviceId,h.innerText=u.label,l.appendChild(h)}s.getTracks().forEach(u=>{l.value=u.getSettings().deviceId})});const d=t.createAnalyser();t.createMediaStreamSource(s).connect(d),d.fftSize=2048;let c=this._audioElm.querySelector("canvas");c||(c=document.createElement("canvas"),c.style.border="1px solid black",this._audioElm.appendChild(c)),c.width=this._size[1],c.height=this._size[0];const _=m(()=>{this._audioStream&&(this.drawFreq(d,c),setTimeout(_,10))},"loop");_()}).catch(s=>{console.error(s),this.stopAudio()})}drawWave(i,t){const e=i.frequencyBinCount,a=new Uint8Array(e);i.getByteTimeDomainData(a);const n=t.getContext("2d");n.clearRect(0,0,t.width,t.height),n.lineWidth=2,n.strokeStyle="rgb(0, 0, 0)",n.beginPath();const l=t.width*1/e;let o=0;for(let s=0;s<e;s++){const r=a[s]/128*t.height/2;s===0?n.moveTo(o,r):n.lineTo(o,r),o+=l}n.lineTo(t.width,t.height/2),n.stroke()}drawFreq(i,t){const e=i.frequencyBinCount,a=new Uint8Array(e);i.getByteFrequencyData(a);const n=t.getContext("2d");n.clearRect(0,0,t.width,t.height),n.fillStyle="rgb(0, 0, 0)";const l=t.width/e*2.5;let o=0;for(let s=0;s<e;s++){const d=a[s]/2;n.fillStyle="rgb("+(d+100)+",50,50)",n.fillRect(o,t.height-d/2,l,d),o+=l+1}}stopAudio(){if(this._audioStream){const i=this._audioStream;i&&i.getTracks().forEach(t=>{t.stop()}),this._audioStream=null}this._audioElm.replaceChildren()}terminate(){super.terminate(),this.stopAudio()}}
