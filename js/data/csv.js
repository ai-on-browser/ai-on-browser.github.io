import"https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js";import{FixData}from"./base.js";class CSV{constructor(t){this._data=t}get data(){return this._data}static parse(t,e={}){const a=e.delimiter||",",s=[];let r=[],n=!1,i="";for(let e=0;e<t.length;e++)n?'"'===t[e]&&'"'===t[e+1]?(i+='"',e++):'"'===t[e]?n=!1:i+=t[e]:'"'===t[e]?n=!0:t.startsWith(a,e)?(r.push(i),i=""):"\n"===t[e]||"\r"===t[e]?((i.length>0||r.length>0)&&(r.push(i),s.push(r),i="",r=[]),"\r"===t[e]&&"\n"===t[e+1]&&e++):i+=t[e];return(i.length>0||r.length>0)&&(r.push(i),s.push(r)),new CSV(s)}static async load(t,e={}){if("string"==typeof t){const a=await fetch(t),s=await a.arrayBuffer(),r=new TextDecoder(e.encoding||"utf-8");return t.endsWith(".gz")?CSV.parse(r.decode(pako.ungzip(s)),e):CSV.parse(r.decode(s),e)}if(t instanceof File){const a=await new Promise((a=>{const s=new FileReader;s.onload=()=>{a(s.result)},s.readAsText(t,e.encoding)}));return CSV.parse(a,e)}}}export default class CSVData extends FixData{constructor(t,e,a){super(t),e&&a&&this.setCSV(e,a)}async readCSV(t,e){return(await CSV.load(t,e)).data}setCSV(t,e,a=!1){if(Array.isArray(t)){if(a){const a=t[0];t=t.slice(1),e||((e=a.map(((e,a)=>({name:e,type:t.some((t=>isNaN(t[a])))?"category":"numeric"}))))[e.length-1].out=!0)}this.setArray(t,e)}else this.readCSV(t).then((t=>{this.setCSV(t,e,a)}))}}