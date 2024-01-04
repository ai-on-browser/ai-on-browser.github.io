var C=Object.defineProperty;var y=(_,s)=>C(_,"name",{value:s,configurable:!0});import{FixData as k}from"./base.js";import E from"../renderer/base.js";import w from"./db/base.js";const v={trainImages:"https://storage.googleapis.com/learnjs-data/model-builder/mnist_images.png",trainLabels:"https://storage.googleapis.com/learnjs-data/model-builder/mnist_labels_uint8"};let b=!1;export default class z extends k{static{y(this,"MNISTData")}constructor(s){super(s),this._sampleCount=10,this._imageSize=[28,28];const a=this.setting.data.configElement,e=document.createElement("div");e.style.display="flex",e.style.justifyContent="space-between",a.appendChild(e);const n=document.createElement("span");e.appendChild(n);const t=document.createElement("input");t.type="number",t.min=1,t.max=1e4,t.value=10,t.onchange=async()=>{this._sampleCount=+t.value,await this._readyData(),this._manager.platform.init()},n.append("Sample number",t);const i=document.createElement("div");e.appendChild(i);const o=document.createElement("a");o.href="https://github.com/tensorflow/tfjs",o.setAttribute("ref","noreferrer noopener"),o.target="_blank",o.innerText="TensorFlow.js",i.append("The data is from the ",o),this._manager.requiredRenderers([D]),this._readyData().then(()=>{this._manager.onReady(()=>{this._manager.platform.init()})})}get availTask(){return["CF","SC","RL","AD","DR","FS"]}get domain(){const s=[];for(let a=0;a<this._imageSize[0]*this._imageSize[1];a++)s.push([0,255]);return s}get columnNames(){return this._cols||[]}_sample(s){const a=s.map((t,i)=>[t.y,i]),e=[],n=[];for(let t=0;t<=9;t++){const i=a.filter(l=>l[0]===t),o=Math.min(i.length,this._sampleCount),r=Array.from({length:o},(l,d)=>d);for(let l=r.length-1;l>0;l--){const d=Math.floor(Math.random()*(l+1));[r[l],r[d]]=[r[d],r[l]]}for(let l=0;l<o;l++){const d=i[r[l]][1];e.push(s[d].x),n.push(s[d].y)}}return[e,n]}async _readyData(){this._cols=[];for(let e=0,n=0;e<28;e++)for(let t=0;t<28;t++,n++)this._cols.push(`${e},${t}`);const s=new I,a=await s.list(x);if(a.length>0){[this._x,this._y]=this._sample(a);return}if(!b)return b=!0,new Promise((e,n)=>{const t=new Image;t.crossOrigin="Anonymous",t.addEventListener("load",async()=>{const i=t.height,o=t.width,r=document.createElement("canvas");r.width=o,r.height=i;const l=r.getContext("2d");l.drawImage(t,0,0);const d=l.getImageData(0,0,o,i),m=await fetch(v.trainLabels),f=new Int8Array(await m.arrayBuffer()),p=[];for(let h=0;h<i;h++){const u=[];for(let g=0;g<o*4;g+=4)u.push(d.data[h*o*4+g]);const c=f.slice(h*10,(h+1)*10);p[h]={x:u,y:c.indexOf(1)}}s.save(x,p),[this._x,this._y]=this._sample(p),b=!1,e()},!1),t.addEventListener("error",n),t.src=v.trainImages})}terminate(){super.terminate(),this._manager.requiredRenderers()}}class D extends E{static{y(this,"MNISTRenderer")}constructor(s){super(s),this._offset=0,this._pagesize=100,this._colsize=5,this._predict=null;const a=this.setting.render.addItem("mnist"),e=document.createElement("div");e.style.display="flex",e.style.justifyContent="space-between",e.style.position="sticky",e.style.top="0";const n=document.createElement("div");n.style.backgroundColor="white",n.style.padding="5px",n.style.marginBottom="-1px",n.style.borderBottom="1px solid black",e.append(n),this._navigator=document.createElement("span"),n.appendChild(this._navigator);const t=document.createElement("select");t.onchange=()=>{this._offset=0,this._pagesize=+t.value,this._renderPager()};for(const o of[10,50,100,500,1e3]){const r=document.createElement("option");r.value=o,r.innerText=o,t.append(r)}t.value=this._pagesize,n.appendChild(t);const i=document.createElement("button");i.innerHTML="&uarr;",i.onclick=()=>{window.scroll({top:0,behavior:"smooth"})},i.title="To top",i.style.margin="5px",i.style.borderRadius="50%",e.appendChild(i),this._table=document.createElement("table"),this._table.style.border="1px solid black",this._table.style.borderCollapse="collapse",a.append(e,this._table),this._manager.setting.render.selectItem("mnist")}set trainResult(s){this._manager.platform.task==="CF"&&this.datas.outputCategoryNames?s=s.map(a=>this.datas.outputCategoryNames[a-1]):this._manager.platform.task==="AD"&&(s=s.map(a=>a?"anomalous":"")),this._predict?(this._predict=s,this._renderData()):(this._predict=s,this.render())}init(){this._predict=null}render(){if(this._table.replaceChildren(),this._navigator.replaceChildren(),this._offset=0,!this.datas)return;const e=this._table.createTHead().insertRow(),n=["image","target"];this._predict&&n.push("predict");for(let t=0;t<this._colsize;t++)for(const i of n){const o=e.insertCell();o.innerText=i,o.style.border="1px solid black"}this._table.createTBody(),this._renderPager()}_renderPager(){this._navigator.replaceChildren(),this._renderData();const s=this.datas;if(!s)return;const a=Math.ceil(s.length/this._pagesize),e=Math.floor(this._offset/this._pagesize)+1;if(e>1){const t=document.createElement("input");t.type="button",t.value="<",t.onclick=()=>{this._offset=Math.max(0,this._offset-this._pagesize),this._renderPager()},this._navigator.appendChild(t)}const n=document.createElement("input");n.type="button",n.value="1",n.onclick=()=>{this._offset=0,this._renderPager()},e===1&&(n.disabled=!0),this._navigator.appendChild(n),e>3&&this._navigator.append(" ... ");for(let t=Math.max(2,e-1);t<=Math.min(a-1,e+1);t++){const i=document.createElement("input");i.type="button",i.value=t,i.onclick=()=>{this._offset=this._pagesize*(t-1),this._renderPager()},t===e&&(i.disabled=!0),this._navigator.appendChild(i)}if(e<a-2&&this._navigator.append(" ... "),a>1){const t=document.createElement("input");t.type="button",t.value=a,t.onclick=()=>{this._offset=this._pagesize*(a-1),this._renderPager()},e===a&&(t.disabled=!0),this._navigator.appendChild(t)}if(e<a){const t=document.createElement("input");t.type="button",t.value=">",t.onclick=()=>{this._offset=Math.min(s.length-1,this._offset+this._pagesize),this._renderPager()},this._navigator.appendChild(t)}this._navigator.append(` (${this._offset+1} - ${Math.min(this._offset+this._pagesize,s.length)} / ${s.length}) `)}_renderData(){const s=this._table.tBodies[0];s.replaceChildren();const a=this.datas;if(!a)return;const e=28,n=28,t=a.originalX,i=this._manager.platform.task==="RG"?a.y:a.originalY,o=Math.min(a.length,this._offset+this._pagesize);for(let r=this._offset;r<o;){const l=s.insertRow();for(let d=0;d<this._colsize&&r<o;d++,r++){const m=document.createElement("canvas");m.height=e,m.width=n;const f=m.getContext("2d"),p=f.getImageData(0,0,e,n);for(let c=0;c<t[r].length;c++)p.data[c*4]=t[r][c],p.data[c*4+1]=t[r][c],p.data[c*4+2]=t[r][c],p.data[c*4+3]=255;f.putImageData(p,0,0);const h=l.insertCell();h.appendChild(m),h.style.border="1px solid black",h.style.textAlign="center";const u=[i[r]];this._predict&&u.push(this._predict[r]);for(const c of u){const g=l.insertCell();g.innerText=c,g.style.border="1px solid black"}}}}terminate(){this.setting.render.removeItem("mnist"),super.terminate()}}const M="mnist",x="data";class I extends w{static{y(this,"MNISTDB")}constructor(){super(M,1)}onupgradeneeded(s){s.target.result.createObjectStore(x,{autoIncrement:!0})}}
