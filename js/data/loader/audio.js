const r={load(o){return new Promise(d=>{const e=new FileReader;e.readAsArrayBuffer(o),e.onload=()=>{new AudioContext().decodeAudioData(e.result).then(d)}})}};export default r;
