import"https://mozilla.github.io/pdf.js/build/pdf.js";import"https://cdnjs.cloudflare.com/ajax/libs/encoding-japanese/2.0.0/encoding.min.js";import{BaseData}from"./base.js";pdfjsLib.GlobalWorkerOptions.workerSrc="https://mozilla.github.io/pdf.js/build/pdf.worker.js";export default class DocumentData extends BaseData{constructor(e){super(e)}async readDocument(e){return new Promise((t=>{const o=new FileReader;o.readAsArrayBuffer(e),o.onload=()=>{if("application/pdf"===e.type)pdfjsLib.getDocument({data:o.result,cMapUrl:"https://mozilla.github.io/pdf.js/web/cmaps/",cMapPacked:!0}).promise.then((async e=>{const o=e.numPages;let s="";for(let t=1;t<=o;t++){const o=await e.getPage(t);s+=(await o.getTextContent()).items.map((e=>e.str)).join("")}t(s)}));else{const e=new Uint8Array(o.result),s=Encoding.detect(e),n=Encoding.convert(e,{to:"unicode",from:s,type:"string"});t(n)}}}))}segment(e){return e.split(/[ -@\[-`{-~\s]+/)}ordinal(e,{ignoreCase:t=!0}={}){const o=[],s=[];for(const n of e){const e=o.indexOf(t?n.toLowerCase():n);e<0?(o.push(t?n.toLowerCase():n),s.push(o.length-1)):s.push(e)}return[o,s]}}