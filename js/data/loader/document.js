var m=Object.defineProperty;var i=(c,s)=>m(c,"name",{value:s,configurable:!0});import*as d from"https://cdn.jsdelivr.net/npm/pdfjs-dist@4.2.67/build/pdf.min.mjs";import"https://cdnjs.cloudflare.com/ajax/libs/encoding-japanese/2.1.0/encoding.min.js";d.GlobalWorkerOptions.workerSrc="https://cdn.jsdelivr.net/npm/pdfjs-dist@4.2.67/build/pdf.worker.min.mjs";export default class u{static{i(this,"DocumentLoader")}static load(s){return new Promise(r=>{const t=new FileReader;t.readAsArrayBuffer(s),t.onload=()=>{if(s.type==="application/pdf")d.getDocument({data:t.result,cMapUrl:"https://cdn.jsdelivr.net/npm/pdfjs-dist@4.2.67/cmaps/",cMapPacked:!0}).promise.then(async e=>{const n=e.numPages;let o="";for(let a=1;a<=n;a++){const p=await(await e.getPage(a)).getTextContent();o+=p.items.map(l=>l.str).join("")}r(o)});else{const e=new Uint8Array(t.result),n=Encoding.detect(e),o=Encoding.convert(e,{to:"unicode",from:n,type:"string"});r(o)}}})}static segment(s){return s.split(/[ -@\[-`{-~\s]+/)}static ordinal(s,{ignoreCase:r=!0}={}){const t=[],e=[];for(const n of s){const o=t.indexOf(r?n.toLowerCase():n);o<0?(t.push(r?n.toLowerCase():n),e.push(t.length-1)):e.push(o)}return[t,e]}}
