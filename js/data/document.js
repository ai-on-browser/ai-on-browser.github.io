import{BaseData}from"./base.js";pdfjsLib.GlobalWorkerOptions.workerSrc="//mozilla.github.io/pdf.js/build/pdf.worker.js";export default class DocumentData extends BaseData{constructor(e){super(e)}readDocument(e,t){const s=new FileReader;s.readAsArrayBuffer(e),s.onload=()=>{if("application/pdf"===e.type)pdfjsLib.getDocument({data:s.result,cMapUrl:"//mozilla.github.io/pdf.js/web/cmaps/",cMapPacked:!0}).promise.then((async e=>{const s=e.numPages;let o="";for(let t=1;t<=s;t++){const s=await e.getPage(t);o+=(await s.getTextContent()).items.map((e=>e.str)).join("")}t(this.segment(o))}));else{const e=new Uint8Array(s.result),o=Encoding.detect(e),a=Encoding.convert(e,{to:"unicode",from:o,type:"string"});t(this.segment(a))}}}segment(e){return e.split(/[ -@\[-`{-~\s]+/)}ordinal(e,{ignoreCase:t=!0}={}){const s=[],o=[];for(const a of e){const e=s.indexOf(t?a.toLowerCase():a);e<0?(s.push(t?a.toLowerCase():a),o.push(s.length-1)):o.push(e)}return[s,o]}}