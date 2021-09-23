import AudioData from"./audio.js";export default class MicrophoneData extends AudioData{constructor(t){super(t),this._size=[120,360];const e=this.setting.data.configElement;this._mngelm=e.append("div"),this._mngelm.append("input").attr("type","button").attr("value","Add data").on("click",(()=>this.startAudio())),this._slctImg=this._mngelm.append("select").on("change",(()=>{this.selectAudio()})),this._audio=this._mngelm.append("audio").property("controls",!0).node(),this._mngelm.append("span").text("Sampling Rate: "),this._slctRate=this._mngelm.append("select").on("change",(()=>{this._manager.platform.render()})),this._audioElm=e.append("div"),this.startAudio(),this._x=[],this._y=[],this._audioDatas=[]}get availTask(){return["SM"]}get domain(){return[[-1,1]]}get x(){const t=this.selectedIndex;if(0===this._x.length||!this._x[t])return[];const e=+this._slctRate.property("value"),i=[];for(let s=0;s<this._x[t].length;s+=e)i.push([this._x[t][s]]);return i}get isSeries(){return!0}get selectedIndex(){return+this._slctImg.property("value")-1}selectAudio(){const t=this._audioDatas[this.selectedIndex];this._audio.src=URL.createObjectURL(t.blob),this._audio.title=`data_${this.selectedIndex+1}.webm`,this._slctRate.selectAll("*").remove();let e=1;for(;Number.isInteger(t.buff.sampleRate/e);)this._slctRate.append("option").attr("value",e).text(t.buff.sampleRate/e),e*=2;this._manager.platform.render()}startAudio(t){this._mngelm.style("display","none"),this._audioElm.append("div").text("Click stop to use as data.");const e=new AudioContext;let i=null;const s=[],a=this._audioElm.append("div").append("select").attr("name","devices").on("change",(()=>{const t=a.property("value");this.stopAudio(),this.startAudio(t)}));this._audioElm.append("input").attr("type","button").attr("value","Record").on("click",(()=>{if(i)return i.stop(),void(i=null);this._audioStream&&(this._audioElm.select("[type=button]").attr("value","Stop"),i=new MediaRecorder(this._audioStream,{mimeType:"audio/webm"}),i.addEventListener("dataavailable",(t=>{t.data.size>0&&s.push(t.data)})),i.addEventListener("stop",(t=>{const e=new Blob(s);this.readAudio(e,((t,i)=>{this._x.push(t),this._y.push(0),this._audioDatas.push({blob:e,buff:i}),this._slctImg.append("option").attr("value",this._x.length).text(this._x.length),this._slctImg.property("value",this._x.length),this.selectAudio()})),this.stopAudio(),this._mngelm.style("display",null)})),i.start())})),navigator.mediaDevices.getUserMedia({audio:{deviceId:t}}).then((t=>{this._audioStream=t,navigator.mediaDevices.enumerateDevices().then((e=>{a.selectAll("option").data(e.filter((t=>"audioinput"===t.kind))).enter().append("option").property("value",(t=>t.deviceId)).text((t=>t.label)),t.getTracks().forEach((t=>{a.property("value",t.getSettings().deviceId)}))}));const i=e.createAnalyser();e.createMediaStreamSource(t).connect(i),i.fftSize=2048,0===this._audioElm.select("canvas").size()&&this._audioElm.append("canvas").style("border","1px solid black");const s=this._audioElm.select("canvas").node();s.width=this._size[1],s.height=this._size[0];const o=()=>{this._audioStream&&(this.drawFreq(i,s),setTimeout(o,10))};o()})).catch((t=>{console.error(t),this.stopAudio()}))}drawWave(t,e){const i=t.frequencyBinCount,s=new Uint8Array(i);t.getByteTimeDomainData(s);const a=e.getContext("2d");a.clearRect(0,0,e.width,e.height),a.lineWidth=2,a.strokeStyle="rgb(0, 0, 0)",a.beginPath();const o=1*e.width/i;let n=0;for(let t=0;t<i;t++){const i=s[t]/128*e.height/2;0===t?a.moveTo(n,i):a.lineTo(n,i),n+=o}a.lineTo(e.width,e.height/2),a.stroke()}drawFreq(t,e){const i=t.frequencyBinCount,s=new Uint8Array(i);t.getByteFrequencyData(s);const a=e.getContext("2d");a.clearRect(0,0,e.width,e.height),a.fillStyle="rgb(0, 0, 0)";const o=e.width/i*2.5;let n=0;for(let t=0;t<i;t++){const i=s[t]/2;a.fillStyle="rgb("+(i+100)+",50,50)",a.fillRect(n,e.height-i/2,o,i),n+=o+1}}stopAudio(){if(this._audioStream){const t=this._audioStream;t&&t.getTracks().forEach((t=>{t.stop()})),this._audioStream=null}this._audioElm.selectAll("*").remove()}terminate(){super.terminate(),this.stopAudio()}}