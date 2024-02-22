var w=Object.defineProperty;var _=(p,t)=>w(p,"name",{value:t,configurable:!0});export default class x{static{_(this,"LinePlotter")}constructor(t){this._r=t,this._item=null}_ready(t){if(!this._item)if(typeof t=="object"&&!Array.isArray(t)){this._item={};for(const e of Object.keys(t))this._item[e]=new y(this._r),this._item[e].name=e}else this._item=new y(this._r)}add(t){if(this._ready(t),typeof t=="object")for(const e of Object.keys(t))this._item[e].add(t[e]);else this._item.add(t)}setValues(t){if(this._ready(t),Array.isArray(t))this._item.setValues(t);else for(const e of Object.keys(t))this._item[e].setValues(t[e])}terminate(){if(this._item instanceof y)this._item.terminate();else for(const t of Object.keys(this._item))this._item[t].terminate()}}class y{static{_(this,"LinePlotterItem")}constructor(t){this._width=200,this._height=50,this._plot_count=1e4,this._print_count=0,this._plot_smooth_window=20,this._root=document.createElement("span"),t.appendChild(this._root),this._caption=document.createElement("div"),this._caption.innerText="loss",this._root.appendChild(this._caption);const e=document.createElement("span");e.style.display="inline-flex",e.style.alignItems="flex-start",e.style.margin="5px",e.style.fontSize="80%",this._root.appendChild(e);const r=document.createElementNS("http://www.w3.org/2000/svg","svg");r.setAttribute("width",this._width),r.setAttribute("height",this._height),e.appendChild(r),this._scaleElm=document.createElement("span"),this._scaleElm.style.display="flex",this._scaleElm.style.flexDirection="column",this._scaleElm.style.margin="0 5px",this._scaleElm.style.textAlign="center",e.appendChild(this._scaleElm);const o=document.createElement("span");o.innerText="scale",this._scaleElm.appendChild(o),this._scale=document.createElement("select");for(const n of["linear","log"]){const h=document.createElement("option");h.value=h.innerText=n,this._scale.appendChild(h)}this._scale.onchange=()=>this.plotRewards(),this._scaleElm.appendChild(this._scale);const i=document.createElement("span");i.style.display="inline-flex",i.style.flexDirection="column",e.appendChild(i),this._state={root:i};for(const n of["count","max","ave","min","values"]){const h=document.createElement("span");i.append(h),this._state[n]=h}this._history=[]}set name(t){this._caption.innerText=t,this._caption.style.display=t?null:"none"}get length(){return this._history.length}add(t){this._history.push(t),this.plotRewards()}setValues(t){this._history=t,this.plotRewards()}terminate(){this._root.remove()}lastHistory(t=0){if(t<=0)return this._history;const e=this._history.length;return this._history.slice(Math.max(0,e-t),e)}plotRewards(){const t=this._root.querySelector("svg"),e=t.width.baseVal.value,r=t.height.baseVal.value;let o=null,i=null;t.childNodes.length===0?(o=document.createElementNS("http://www.w3.org/2000/svg","path"),o.setAttribute("name","value"),o.setAttribute("stroke","black"),o.setAttribute("fill-opacity",0),t.appendChild(o),i=document.createElementNS("http://www.w3.org/2000/svg","path"),i.setAttribute("name","smooth"),i.setAttribute("stroke","green"),i.setAttribute("fill-opacity",0),t.appendChild(i)):(o=t.querySelector("path[name=value]"),i=t.querySelector("path[name=smooth]"));const n=this.lastHistory(this._plot_count);if(n.length===0){t.style.display="none",this._scaleElm.style.display="none",this._state.root.style.display="none",o.removeAttribute("d"),i.removeAttribute("d");return}t.style.display=null,this._state.root.style.display="inline-flex";const h=Math.max(...n),c=Math.min(...n),d=_(s=>{if(typeof s!="number")return s;if(s===0)return 0;const l=-Math.floor(Math.log10(Math.abs(s)))+3;return l<0?Math.round(s):Math.round(s*10**l)/10**l},"fmtNum");if(this._state.count.innerText=`Count: ${this.length}`,this._state.min.innerText=`Min: ${d(c)}`,this._state.max.innerText=`Max: ${d(h)}`,h===c){this._scaleElm.style.display="none";return}else this._history.some(s=>s<=0)?(this._scaleElm.style.display="none",this._scale.value="linear"):this._scaleElm.style.display="flex";const u=_((s,l)=>this._scale.value==="log"?[e*s/(n.length-1),(1-(Math.log(l)-Math.log(c))/(Math.log(h)-Math.log(c)))*r]:[e*s/(n.length-1),(1-(l-c)/(h-c))*r],"pp"),g=n.map((s,l)=>u(l,s)),f=_(s=>{let l="";for(let a=0;a<s.length;a++)l+=`${a===0?"M":"L"}${s[a][0]},${s[a][1]}`;return l},"line");o.setAttribute("d",f(g));const m=[];for(let s=0;s<n.length-this._plot_smooth_window;s++){let l=0;for(let a=0;a<this._plot_smooth_window;a++)l+=n[s+a];m.push([s+this._plot_smooth_window,l/this._plot_smooth_window])}m.length>0&&(i.setAttribute("d",f(m.map(s=>u(...s)))),this._state.ave.innerText=`Mean(${this._plot_smooth_window}): ${d(m[m.length-1]?.[1])}`),this._print_count>0?(this._state.values.style.display=null,this._state.values.innerText=` [${n.slice(n.length-this._print_count).reverse().join(",")}]`):this._state.values.style.display="none"}}
