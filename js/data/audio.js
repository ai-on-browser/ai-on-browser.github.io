import{BaseData}from"./base.js";export default class AudioData extends BaseData{constructor(e){super(e)}get availTask(){return["SM"]}get domain(){return[[-1,1]]}async readAudio(e){return new Promise((a=>{const r=new FileReader;r.readAsArrayBuffer(e),r.onload=()=>{(new AudioContext).decodeAudioData(r.result).then(a)}}))}}