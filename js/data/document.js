import"https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js";import"https://cdnjs.cloudflare.com/ajax/libs/encoding-japanese/2.0.0/encoding.min.js";import{BaseData}from"./base.js";pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";export default class DocumentData extends BaseData{constructor(e){super(e)}async readDocument(e){return new Promise((t=>{const s=new FileReader;s.readAsArrayBuffer(e),s.onload=()=>{if("application/pdf"===e.type)pdfjsLib.getDocument({data:s.result,cMapUrl:"https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",cMapPacked:!0}).promise.then((async e=>{const s=e.numPages;let n="";for(let t=1;t<=s;t++){const s=await e.getPage(t);n+=(await s.getTextContent()).items.map((e=>e.str)).join("")}t(n)}));else{const e=new Uint8Array(s.result),n=Encoding.detect(e),o=Encoding.convert(e,{to:"unicode",from:n,type:"string"});t(o)}}}))}segment(e){return e.split(/[ -@\[-`{-~\s]+/)}ordinal(e,{ignoreCase:t=!0}={}){const s=[],n=[];for(const o of e){const e=s.indexOf(t?o.toLowerCase():o);e<0?(s.push(t?o.toLowerCase():o),n.push(s.length-1)):n.push(e)}return[s,n]}}