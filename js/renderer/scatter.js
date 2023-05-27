import BaseRenderer from"./base.js";import{getCategoryColor,specialCategory,DataPoint,DataCircle,DataLine,DataHulls}from"../utils.js";import Matrix from"../../lib/util/matrix.js";const scale=function(t,e,s,i,a){return isFinite(e)&&isFinite(s)&&e!==s?(t-e)/(s-e)*(a-i)+i:(a+i)/2};export default class ScatterRenderer extends BaseRenderer{constructor(t){super(t),this._size=[960,500];const e=this.setting.render.addItem("scatter"),s=document.createElement("div");s.id="plot-area",e.appendChild(s),this._menu=document.createElement("div"),s.appendChild(this._menu),this._root=document.createElementNS("http://www.w3.org/2000/svg","svg"),s.appendChild(this._root),this._root.style.border="1px solid #000000",this._root.setAttribute("width",`${this._size[0]}px`),this._root.setAttribute("height",`${this._size[1]}px`),this._svg=document.createElementNS("http://www.w3.org/2000/svg","g"),this._svg.style.transform="scale(1, -1) translate(0, -100%)",this._root.appendChild(this._svg),this._grid=document.createElementNS("http://www.w3.org/2000/svg","g"),this._grid.setAttribute("opacity",.3),this._svg.appendChild(this._grid);const i=document.createElementNS("http://www.w3.org/2000/svg","g");i.classList.add("points"),this._svg.appendChild(i),this._r=document.createElementNS("http://www.w3.org/2000/svg","g"),this._r.classList.add("datas"),i.appendChild(this._r),this._p=[],this._pad=10,this._clip_pad=-1/0,this._pred_count=0,this._select=[0,1],this._observe_target=null,this._observer=new MutationObserver((t=>{this._observe_target&&this._p.forEach(((t,e)=>t.title=this.datas.labels[e]))})),this._observer.observe(this._svg,{childList:!0})}get svg(){return this._svg}get width(){return this._size[0]}set width(t){this._size[0]=t,this._root.setAttribute("width",`${t}px`)}get height(){return this._size[1]}set height(t){this._size[1]=t,this._root.setAttribute("height",`${t}px`)}get padding(){return Array.isArray(this._pad)?this._pad:[this._pad,this._pad]}set padding(t){this._pad=t??0,this.render()}set clipPadding(t){this._clip_pad=t,this.render()}get points(){return this._p}set trainResult(t){const e=this._manager.platform.task;if("AD"===e){if(0===this._svg.querySelectorAll(".tile").length){const t=document.createElementNS("http://www.w3.org/2000/svg","g");t.classList.add("tile","anormal_point"),this._svg.insertBefore(t,this._svg.firstChild)}const e=this._svg.querySelector(".tile");e.replaceChildren(),t.forEach(((t,s)=>{if(t){new DataCircle(e,this.points[s]).color=getCategoryColor(specialCategory.error)}}))}else if("SC"===e){if(0===this._svg.querySelectorAll(".tile").length){const t=document.createElementNS("http://www.w3.org/2000/svg","g");t.classList.add("tile"),this._svg.insertBefore(t,this._svg.firstChild)}const e=this._svg.querySelector(".tile");e.replaceChildren(),t.forEach(((t,s)=>{new DataCircle(e,this.points[s]).color=getCategoryColor(t)}))}else if("DR"===e||"FS"===e||"TF"===e){if(0===this._svg.querySelectorAll(".tile").length){const t=document.createElementNS("http://www.w3.org/2000/svg","g");t.classList.add("tile"),t.setAttribute("opacity",.5),this._svg.insertBefore(t,this._svg.firstChild)}const e=this._svg.querySelector(".tile");e.replaceChildren();const s=t[0].length;let i=t;1===s&&(i=i.map((t=>[t,0])));let a=[],r=[];for(let t=0;t<i[0].length;t++){const e=i.map((e=>e[t]));a.push(Math.max(...e)),r.push(Math.min(...e))}const n=this.datas.dimension<=1?[this.height,this.height]:[this.width,this.height],h=n.map(((t,e)=>(t-10)/(a[e]-r[e])));let l=Math.min(...h);const d=[5,5];for(let t=0;t<h.length;t++)(!isFinite(l)||h[t]>l)&&(isFinite(h[t])?d[t]+=(h[t]-l)*(a[t]-r[t])/2:d[t]=n[t]/2-r[t]);isFinite(l)||(l=0);let o=1/0,c=null;const p=Matrix.fromArray(this.points.map((t=>t.at)));for(let t=0;t<(this.datas.dimension<=1?1:2**s);t++){const e=t.toString(2).padStart(s,"0").split("").map((t=>!!+t)),n=i.map((t=>t.map(((t,s)=>((e[s]?a[s]-t+r[s]:t)-r[s])*l+d[s])))),h=Matrix.fromArray(n);h.sub(p);const g=h.norm();g<o&&(o=g,c=n)}c.forEach(((t,s)=>{const i=new DataPoint(e,this.datas.dimension<=1?[this.points[s].at[0],t[0]]:t,this.points[s].category);i.radius=2;new DataLine(e,this.points[s],i).setRemoveListener((()=>i.remove()))}))}else if("GR"===e){if(0===this._svg.querySelectorAll(".tile").length){const t=document.createElementNS("http://www.w3.org/2000/svg","g");t.classList.add("tile","generated"),t.setAttribute("opacity",.5),this._svg.insertBefore(t,this._svg.firstChild)}const e=this._svg.querySelector(".tile.generated");e.replaceChildren();let s=null;Array.isArray(t)&&2===t.length&&Array.isArray(t[0])&&Array.isArray(t[0][0])&&([t,s]=t),t.forEach(((t,i)=>{new DataPoint(e,this.toPoint(t),s?s[i][0]:0).radius=2}))}}get scale(){const t=this.datas.domain,e=[this.width,this.height],[s,i]=this.datas.range,a=this._select.map(((s,i)=>e[i]/(t[s][1]-t[s][0])));return 1===this._select.length&&(a[1]=e[1]/(i-s)),a}init(){this._lastpred=null,this._r_tile?.remove(),this._svg.querySelectorAll(".tile").forEach((t=>t.remove())),this._grid.replaceChildren(),this._make_selector()}_make_selector(){let t=this.datas?.columnNames||[],e=this._menu.querySelector("div.column-selector");if(!e&&t.length>0?(e=document.createElement("div"),e.classList.add("column-selector"),this._menu.appendChild(e)):e?.replaceChildren(),t.length<1)this._select=1===this.datas?.dimension?[0]:[0,1];else if(1===t.length){const s=document.createElement("table");s.style.borderCollapse="collapse",e.appendChild(s);let i=s.insertRow();i.style.textAlign="center",i.insertCell(),i.insertCell().innerHTML="&rarr;",i=s.insertRow();const a=i.insertCell();a.innerText=t[0],a.style.textAlign="right";const r=i.insertCell(),n=document.createElement("input");n.type="radio",n.name="data-d1",n.checked=!0,r.appendChild(n),this._select=1===this.datas.dimension?[0]:[0,1]}else if(t.length<=4){const s=document.createElement("table");s.style.borderCollapse="collapse",e.appendChild(s);let i=s.insertRow();i.style.textAlign="center",i.insertCell(),i.insertCell().innerHTML="&rarr;",i.insertCell().innerHTML="&uarr;";const a=[],r=[];for(let e=0;e<t.length;e++){i=s.insertRow();const n=i.insertCell();n.innerText=t[e],n.style.textAlign="right";const h=i.insertCell(),l=document.createElement("input");l.type="radio",l.name="data-d1",l.onchange=()=>{this._select[1]===e&&(r[this._select[1]].checked=!1,r[this._select[0]].checked=!0,this._select[1]=this._select[0]),this._select[0]=e,this.render()},h.appendChild(l),a.push(l);const d=i.insertCell(),o=document.createElement("input");o.type="radio",o.name="data-d2",o.onchange=()=>{this._select[0]===e&&(a[this._select[0]].checked=!1,a[this._select[1]].checked=!0,this._select[0]=this._select[1]),this._select[1]=e,this.render()},d.appendChild(o),r.push(o)}a[0].checked=!0,r[1].checked=!0,this._select=[0,1]}else{t=t.map((t=>""+t));const s=document.createElement("span");s.innerHTML="&rarr;",e.appendChild(s);const i=document.createElement("select");i.onchange=()=>{const e=t.indexOf(i.value);this._select[1]===e&&(r.value=t[this._select[0]],this._select[1]=this._select[0]),this._select[0]=e,this.render()};for(const e of t){const t=document.createElement("option");t.value=e,t.innerText=e,i.appendChild(t)}i.value=t[0],e.appendChild(i);const a=document.createElement("span");a.innerHTML="&uarr;",a.style.display="inline-block",e.appendChild(a);const r=document.createElement("select");r.onchange=()=>{const e=t.indexOf(r.value);this._select[0]===e&&(i.value=t[this._select[1]],this._select[0]=this._select[1]),this._select[1]=e,this.render()};for(const e of t){const t=document.createElement("option");t.value=e,t.innerText=e,r.appendChild(t)}r.value=t[1],e.appendChild(r),this._select=[0,1]}}_clip(t){if(this._clip_pad===-1/0)return t;const e=[this.width,this.height];for(let s=0;s<t.length;s++)t[s]<this._clip_pad?t[s]=this._clip_pad:e[s]-this._clip_pad<t[s]&&(t[s]=e[s]-this._clip_pad);return t}toPoint(t){const e=this.datas.domain,s=[this.width,this.height],[i,a]=this.datas.range,r=this._select.map(((i,a)=>scale(t[i],e[i][0],e[i][1],0,s[a]-2*this.padding[a])+this.padding[a]));return 1===r.length&&t.length>1&&(r[1]=scale(t[1],i,a,0,s[1]-2*this.padding[1])+this.padding[1]),r.map((t=>isNaN(t)?0:t))}_render(){if(!this.datas||0===this.datas.length)return this._p.map((t=>t.remove())),void(this._p.length=0);const t=this.datas.length,e=this.datas.x,s=this.datas.domain,i=this.datas.y,a=this._size,r=this.datas.index,n=this.datas.indexRange,[h,l]=this.datas.range,d=[];for(let o=0;o<t;o++)if(0===this.datas.dimension){const e=isNaN(r[o])?scale(o,0,t,0,a[0]-2*this.padding[0]):scale(r[o],n[0],n[1],0,a[0]-2*this.padding[0]);d.push([e+this.padding[0],scale(i[o],h,l,0,a[1]-2*this.padding[1])+this.padding[1]])}else 1===this.datas.dimension?d.push([scale(e[o][0],s[0][0],s[0][1],0,a[0]-2*this.padding[0])+this.padding[0],scale(i[o],h,l,0,a[1]-2*this.padding[1])+this.padding[1]]):d.push(this._select.map(((t,i)=>scale(e[o][t],s[t][0],s[t][1],0,a[i]-2*this.padding[i])+this.padding[i])));const o=Math.max(1,Math.min(5,Math.floor(2e3/t)));for(let e=0;e<t;e++){const t=this._clip(d[e]),s=this.datas.dimension<=1?0:this.datas.y[e];if(this._p[e]){const i=this._p[e].at;i[0]===t[0]&&i[1]===t[1]||(this._p[e].at=t),this._p[e].category!==s&&(this._p[e].category=s)}else this._p[e]=new DataPoint(this._r,t,s);this._p[e].title=this.datas.labels[e],this._p[e].radius=o}for(let e=t;e<this._p.length;e++)this._p[e].remove();this._p.length=t,this._lastpred&&this.testResult(this._lastpred),this._renderGrid()}_renderGrid(){this._grid.replaceChildren();const t=this.datas.domain,e=this._size,[s,i]=this.datas.range;let a=[],r=[],n=[],h=[];0===this.datas.dimension?(n=this._getScales(s,i),h=[s,i]):1===this.datas.dimension?(a=this._getScales(t[0][0],t[0][1]),r=t[0],n=this._getScales(s,i),h=[s,i]):(a=this._getScales(t[this._select[0]][0],t[this._select[0]][1]),r=t[this._select[0]],n=this._getScales(t[this._select[1]][0],t[this._select[1]][1]),h=t[this._select[1]]);for(const t of a){const s=scale(t,r[0],r[1],0,e[0]-2*this.padding[0])+this.padding[0],i=document.createElementNS("http://www.w3.org/2000/svg","line");i.setAttribute("x1",s),i.setAttribute("x2",s),i.setAttribute("y1",0),i.setAttribute("y2",e[1]),i.setAttribute("stroke","gray");const a=document.createElementNS("http://www.w3.org/2000/svg","text");a.setAttribute("x",Math.max(s,10)),a.setAttribute("y",e[1]-5),a.setAttribute("fill","gray"),a.style.transform="scale(1, -1) translate(0, -100%)",a.innerHTML=t,this._grid.append(i,a)}for(const t of n){const s=scale(+t,h[0],h[1],0,e[1]-2*this.padding[1])+this.padding[1],i=document.createElementNS("http://www.w3.org/2000/svg","line");i.setAttribute("x1",0),i.setAttribute("x2",e[0]),i.setAttribute("y1",s),i.setAttribute("y2",s),i.setAttribute("stroke","gray");const a=document.createElementNS("http://www.w3.org/2000/svg","text");a.setAttribute("x",5),a.setAttribute("y",Math.min(e[1]-s,e[1]-10)),a.setAttribute("fill","gray"),a.style.transform="scale(1, -1) translate(0, -100%)",a.innerHTML=t,this._grid.append(i,a)}}_getScales(t,e){const s=e-t;if(0===s)return[];let i=Math.floor(Math.log10(s)),a=10**i;s/a<2?(a/=2,i--):s/a>5&&(a*=2);const r=[];for(let s=e-e%a;s>=t;s-=a)r.push(i<0?s.toFixed(-i):s);return r}testData(t){this._lastpred=null,Array.isArray(t)||(t=[t,t]),this._laststep=t;const e=[];if(0===this.datas.dimension){const t=this.datas.indexRange;e[0]=[isNaN(t[0])?0:t[0],isNaN(t[1])?this.datas.length:t[1]]}else e.push(...this.datas.domain);this._lastdomain=e;const s=[this.width,this.height],i=[];if(this.datas.dimension<=2)for(let a=0;a<s[0]+t[0];a+=t[0]){const r=scale(a-this.padding[0],0,s[0]-2*this.padding[0],e[0][0],e[0][1]);if(this.datas.dimension<=1)i.push([r]);else for(let a=0;a<s[1]-t[1]/100;a+=t[1]){const t=scale(a-this.padding[1],0,s[1]-2*this.padding[1],e[1][0],e[1][1]);i.push([r,t])}}else for(let t=0;t<this.datas.x.length;t++)i.push(this.datas.x[t].concat());return this._lasttiles=i,i}testResult(t){const e=this._laststep,s=this._lastdomain,i=[this.width,this.height],a=this._lasttiles,r=this._manager.platform.task;this._lastpred=t,"AD"===r&&(t=t.map((t=>t?specialCategory.error:specialCategory.errorRate(0)))),this._r_tile?.remove();1===this.datas.dimension&&("RG"===r||"IN"===r)?(this._r_tile=document.createElementNS("http://www.w3.org/2000/svg","g"),this._r_tile.classList.add("tile-render"),this._r_tile.setAttribute("opacity",1),this._svg.appendChild(this._r_tile)):(this._r_tile=document.createElementNS("http://www.w3.org/2000/svg","g"),this._r_tile.classList.add("tile-render"),this._r_tile.setAttribute("opacity",.5),this._svg.insertBefore(this._r_tile,this._svg.firstChild)),this._r_tile.replaceChildren();let n=t.some((t=>!Number.isInteger(t)));if(this.datas.dimension<=1){const h=[];if("IN"===r||n&&"DE"!==r){const[e,r]=this.datas.range;for(let n=0;n<t.length;n++)h.push([scale(a[n],s[0][0],s[0][1],0,i[0]-2*this.padding[0])+this.padding[0],scale(t[n],e,r,0,i[1]-2*this.padding[1])+this.padding[1]]);const n=t=>{let e="";for(let s=0;s<t.length;s++)e+=`${0===s?"M":"L"}${t[s][0]},${t[s][1]}`;return e},l=document.createElementNS("http://www.w3.org/2000/svg","path");l.setAttribute("stroke","red"),l.setAttribute("fill-opacity",0),l.setAttribute("d",n(h)),this._r_tile.appendChild(l)}else{h.push([],[]);for(let s=0,a=0;a<i[0]+e[0];s++,a+=e[0])h[0][s]=t[s],h[1][s]=t[s];const s=document.createElementNS("http://www.w3.org/2000/svg","g");this._r_tile.appendChild(s),new DataHulls(s,h,[e[0],1e3],n)}}else if(2===this.datas.dimension){let s=0;const a=[];for(let r=0,n=0;n<i[0]+e[0];r++,n+=e[0]){0===this._select[1]&&(a[r]=[]);for(let n=0,h=0;h<i[1]-e[1]/100;n++,h+=e[1])0===this._select[1]?a[r][n]=t[s++]:(a[n]||(a[n]=[]),a[n][r]=t[s++])}!n&&t.length>100&&(n||=new Set(t).size>100);const h=document.createElementNS("http://www.w3.org/2000/svg","g");this._r_tile.appendChild(h);const l=0===this._select[1]?[e[1]/i[1]*i[0],e[0]/i[0]*i[1]]:e;new DataHulls(h,a,l,n||"DE"===r)}else{const e=document.createElementNS("http://www.w3.org/2000/svg","g");this._r_tile.appendChild(e);const s=t.every(Number.isInteger);for(let i=0;i<t.length;i++){new DataCircle(e,this._p[i]).color=getCategoryColor(t[i]),s&&this.datas.outputCategoryNames?this._p[i].title=`true: ${this.datas.originalY[i]}\npred: ${this.datas.outputCategoryNames[t[i]-1]}`:this._p[i].title=`true: ${this.datas.y[i]}\npred: ${t[i]}`}this._observe_target=this._r_tile}}terminate(){this._observer.disconnect(),this.setting.render.removeItem("scatter"),super.terminate()}}