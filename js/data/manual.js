import{BaseData}from"./base.js";import Matrix from"../../lib/util/matrix.js";import{specialCategory,getCategoryColor,DataPoint}from"../utils.js";const normal_random=function(t=0,e=1){const s=Math.sqrt(e),n=Math.random(),i=Math.random();return[Math.sqrt(-2*Math.log(n))*Math.cos(2*Math.PI*i)*s+t,Math.sqrt(-2*Math.log(n))*Math.sin(2*Math.PI*i)*s+t]},dataCreateTools={point:t=>{let e=null;return{init:(t,s)=>{e=new DataPoint(s,[0,0],specialCategory.dummy)},move:t=>{e.at=t},click:(e,s)=>{t.push(e,s.category)},terminate:()=>{e?.remove()},menu:[{title:"category",type:"category",min:0,max:100,value:1,key:"category"}]}},circle:t=>{let e=null;return{init:(t,s)=>{e=document.createElementNS("http://www.w3.org/2000/svg","circle"),e.setAttribute("r",0),e.setAttribute("fill","red"),e.setAttribute("fill-opacity",.2),e.setAttribute("stroke","red"),s.appendChild(e)},move:(t,s)=>{e.setAttribute("cx",t[0]),e.setAttribute("cy",t[1]),e.setAttribute("r",s.radius)},click:(e,s)=>{for(let n=0;n<s.count;n++){const n=[2*Math.random()-1,2*Math.random()-1];for(;n[0]**2+n[1]**2>1;)n[0]=2*Math.random()-1,n[1]=2*Math.random()-1;t.push([e[0]+n[0]*s.radius,e[1]+n[1]*s.radius],s.category)}},terminate:()=>{e?.remove()},menu:[{title:"radius",type:"number",min:1,max:200,value:50,key:"radius"},{title:"category",type:"category",min:0,max:100,value:1,key:"category"},{title:"count",type:"number",min:1,max:100,value:10,key:"count"}]}},square:t=>{let e=null;return{init:(t,s)=>{e=document.createElementNS("http://www.w3.org/2000/svg","rect"),e.setAttribute("fill","red"),e.setAttribute("fill-opacity",.2),e.setAttribute("stroke","red"),s.appendChild(e)},move:(t,s)=>{e.setAttribute("x",t[0]-s.size),e.setAttribute("y",t[1]-s.size),e.setAttribute("width",2*s.size),e.setAttribute("height",2*s.size)},click:(e,s)=>{for(let n=0;n<s.count;n++){const n=[2*Math.random()-1,2*Math.random()-1];t.push([e[0]+n[0]*s.size,e[1]+n[1]*s.size],s.category)}},terminate:()=>{e?.remove()},menu:[{title:"size",type:"number",min:1,max:200,value:50,key:"size"},{title:"category",type:"category",min:0,max:100,value:1,key:"category"},{title:"count",type:"number",min:1,max:100,value:10,key:"count"}]}},gaussian:t=>{let e=null;const s=t=>{const e=[t.varx,t.cov,t.cov,t.vary],s=(e[0]+e[3]+Math.sqrt((e[0]-e[3])**2+4*e[1]**2))/2,n=(e[0]+e[3]-Math.sqrt((e[0]-e[3])**2+4*e[1]**2))/2;let i=360*Math.atan((s-e[0])/e[1])/(2*Math.PI);isNaN(i)&&(i=0),t.rot=i,t.rx=2.146*Math.sqrt(s),t.ry=2.146*Math.sqrt(n)},n=t=>{const e=(t.rx/2.146)**2,s=(t.ry/2.146)**2,n=Math.tan(2*t.rot*Math.PI/360),i=n**2,r=1+1/i,a=e+s+2*e/i,o=Math.sqrt(a**2-4*r*(e**2/i+e*s));if(isNaN(o))return t.varx=e,t.vary=s,void(t.cov=0);const l=(a-o)/(2*r),c=e+s-l,m=(e-l)/n;t.varx=l,t.vary=c,t.cov=m};return{init:(t,s)=>{e=document.createElementNS("http://www.w3.org/2000/svg","ellipse"),e.setAttribute("rx",0),e.setAttribute("ry",0),e.setAttribute("fill","red"),e.setAttribute("fill-opacity",.2),e.setAttribute("stroke","red"),s.appendChild(e)},move:(t,s)=>{const n=t,i=[s.varx,s.cov,s.cov,s.vary],r=(i[0]+i[3]+Math.sqrt((i[0]-i[3])**2+4*i[1]**2))/2,a=(i[0]+i[3]-Math.sqrt((i[0]-i[3])**2+4*i[1]**2))/2;let o=360*Math.atan((r-i[0])/i[1])/(2*Math.PI);isNaN(o)&&(o=0),e.setAttribute("rx",2.146*Math.sqrt(r)),e.setAttribute("ry",2.146*Math.sqrt(a)),e.setAttribute("transform","translate("+n[0]+","+n[1]+") rotate("+o+")")},click:(e,s)=>{const n=[[s.varx,s.cov],[s.cov,s.vary]],i=Matrix.randn(s.count,2,e,n).toArray();for(let e=0;e<i.length;e++)t.push(i[e],s.category)},terminate:()=>{e?.remove()},menu:[{title:"var x",type:"number",min:1,max:1e4,value:1600,key:"varx",onchange:s},{title:"var y",type:"number",min:1,max:1e4,value:800,key:"vary",onchange:s},{title:"cov",type:"number",min:-1e3,max:1e3,value:800,key:"cov",onchange:s},{title:"rx",type:"number",min:0,max:1e3,value:98.21150163574005,key:"rx",onchange:n},{title:"ry",type:"number",min:0,max:1e3,value:37.5134555386868,key:"ry",onchange:n},{title:"rot",type:"number",min:-180,max:180,value:31.717474411461016,key:"rot",onchange:n},{title:"category",type:"category",min:0,max:100,value:1,key:"category"},{title:"count",type:"number",min:1,max:100,value:10,key:"count"}]}},eraser:t=>{const e=t._manager.platform._renderer[0].points;let s=[],n=null;return{init:(t,i)=>{if(n=i,s.forEach((t=>t.remove())),s.length=0,"all"===t.mode)for(const t of e){const e=document.createElementNS("http://www.w3.org/2000/svg","circle");e.setAttribute("r",t.radius),e.setAttribute("fill","red"),e.setAttribute("cx",t.at[0]),e.setAttribute("cy",t.at[1]),n.appendChild(e),s.push(e)}else if("nearest"===t.mode){const t=document.createElementNS("http://www.w3.org/2000/svg","circle");t.setAttribute("r",e[0].radius),t.setAttribute("fill","red"),n.appendChild(t),s.push(t)}else if("circle"===t.mode){const t=document.createElementNS("http://www.w3.org/2000/svg","circle");t.setAttribute("r",50),t.setAttribute("fill","red"),t.setAttribute("fill-opacity",.2),n.appendChild(t),s.push(t)}},move:(t,i)=>{if("nearest"===i.mode){let n=1/0,i=null;for(const s of e){const e=t.reduce(((t,e,n)=>t+(e-s.at[n])**2),0);e<n&&(i=s,n=e)}s[0].setAttribute("cx",i.at[0]),s[0].setAttribute("cy",i.at[1]),s[0].setAttribute("r",i.radius)}else if("circle"===i.mode){s[0].setAttribute("cx",t[0]),s[0].setAttribute("cy",t[1]);for(let t=1;t<s.length;t++)s[t].remove();s.length=1;for(const i of e){const e=t.reduce(((t,e,s)=>t+(e-i.at[s])**2),0);if(Math.sqrt(e)<50){const t=document.createElementNS("http://www.w3.org/2000/svg","circle");t.setAttribute("r",i.radius),t.setAttribute("fill","red"),t.setAttribute("cx",i.at[0]),t.setAttribute("cy",i.at[1]),n.appendChild(t),s.push(t)}}}},click:(n,i)=>{if("all"===i.mode)t.remove(),s.forEach((t=>t.remove())),s.length=0;else if("nearest"===i.mode){let i=1/0,r=1/0,a=null,o=null;for(let s=0;s<t.length;s++){const t=n.reduce(((t,n,i)=>t+(n-e[s].at[i])**2),0);t<i?(o=a,a=s,r=i,i=t):t<r&&(o=s,r=t)}o&&(s[0].setAttribute("cx",e[o].at[0]),s[0].setAttribute("cy",e[o].at[1])),t.splice(a,1)}else if("circle"===i.mode){for(let s=t.length-1;s>=0;s--){const i=n.reduce(((t,n,i)=>t+(n-e[s].at[i])**2),0);Math.sqrt(i)<50&&t.splice(s,1)}for(let t=1;t<s.length;t++)s[t].remove();s.length=1}},terminate:()=>{s.forEach((t=>t.remove())),s.length=0},menu:[{title:"mode",type:"select",options:[{value:"nearest",text:"nearest"},{value:"circle",text:"circle"},{value:"all",text:"all"}],key:"mode"}]}}},dataPresets={clusters:{init:t=>{const e=document.createElement("input");e.type="number",e.name="n",e.min=1,e.max=10,e.value=3,t.append(" n ",e)},make:(t,e)=>{const s=+e.querySelector("[name=n]").value,n=t._size[0],i=t._size[1];let r=1;const a=[],o=[];for(let t=0;t<s;t++,r++){const t=[Math.random(),Math.random()];let e=0;for(;a.some((s=>Math.sqrt(t.reduce(((t,e,n)=>t+(e-s[n])**2),0))<Math.random()/((e++/5)**2+1)));)t[0]=Math.random(),t[1]=Math.random();a.push(t.concat()),t[0]=2*n/3*t[0]+n/6,t[1]=2*i/3*t[1]+i/6;for(let e=0;e<100;e++){let e=[0,0];0,e[0]=0*e[0]+t[0],e[1]=0*e[1]+t[1];{const t=normal_random(0,2500);e[0]+=t[0],e[1]+=t[1]}o.push(e,r)}}t.push(...o)}},moons:{make:t=>{const e=200;let s=1;const n=[];for(let i=0;i<2;i++,s++)for(let i=0;i<100;i++){const i=Math.random()*Math.PI,r=[Math.cos(i)*e,Math.sin(i)*e];{const t=normal_random(0,20);r[0]+=t[0],r[1]+=t[1]}2===s&&(r[0]=e-r[0],r[1]=e-r[1]-100),r[0]+=t._size[0]/2-100,r[1]+=t._size[1]/2-50,n.push(r,s)}t.push(...n)}},circle:{init:t=>{const e=document.createElement("input");e.type="number",e.name="n",e.min=1,e.max=10,e.value=3,t.append(" n ",e)},make:(t,e)=>{const s=+e.querySelector("[name=n]").value,n=Math.min(t._size[0],t._size[1])/(2*s),i=[];for(let e=0;e<s;e++)for(let s=0;s<100;s++){const s=2*Math.random()*Math.PI,r=[Math.cos(s)*n*e,Math.sin(s)*n*e];{const t=normal_random(0,50);r[0]+=t[0],r[1]+=t[1]}r[0]+=t._size[0]/2,r[1]+=t._size[1]/2,i.push(r,e+1)}t.push(...i)}},check:{make:t=>{const e=Math.min(t._size[0],t._size[1])/3,s=[t._size[0]/2,t._size[1]/2],n=[];for(let t=0;t<100;t++)n.push([s[0]+Math.random()*e,s[1]+Math.random()*e],1),n.push([s[0]-Math.random()*e,s[1]-Math.random()*e],1);for(let t=0;t<100;t++)n.push([s[0]+Math.random()*e,s[1]-Math.random()*e],2),n.push([s[0]-Math.random()*e,s[1]+Math.random()*e],2);t.push(...n)}}};class ContextMenu{constructor(){this._r=document.createElement("div"),this._r.classList.add("context-menu"),document.querySelector("body").appendChild(this._r),this._r.onclick=t=>t.stopPropagation(),this._showMenu=t=>{this.show([t.pageX,t.pageY]);const e=()=>{this.hide(),document.body.removeEventListener("click",e)};document.body.addEventListener("click",e)},this._orgoncontextmenu=document.body.oncontextmenu}terminate(){this.create(),this._r.remove()}create(t){if(this._r.replaceChildren(),!t||0===t.length)return document.body.removeEventListener("contextmenu",this._showMenu),void(document.body.oncontextmenu=this._orgoncontextmenu);document.body.addEventListener("contextmenu",this._showMenu),document.body.oncontextmenu=()=>!1;const e=document.createElement("ul");this._r.appendChild(e),this._properties={};for(let s=0;s<t.length;s++){const n=document.createElement("li");e.appendChild(n);const i=document.createElement("span");switch(i.classList.add("item-title"),i.innerText=t[s].title,n.appendChild(i),t[s].type){case"category":case"number":{const e=t=>{const e=getCategoryColor(t);n.style.backgroundColor=e;const s=.299*e.r+.587*e.g+.114*e.b<128?"white":"black";n.style.color=s},i=document.createElement("input");i.type="number",i.min=t[s].min,i.max=t[s].max,i.value=t[s].value,i.onchange=()=>{t[s].onchange?.(this._properties),"category"===t[s].type&&e(+i.value)},n.appendChild(i),"category"===t[s].type&&e(t[s].value),Object.defineProperty(this._properties,t[s].key,{get:()=>+i.value,set:t=>{i.value=t}});break}case"select":{const e=document.createElement("select");e.onchange=()=>t[s].onchange?.(this._properties);for(const n of t[s].options){const t=document.createElement("option");t.value=n.value,t.innerText=n.text,e.appendChild(t)}n.appendChild(e),Object.defineProperty(this._properties,t[s].key,{get:()=>e.value,set:t=>{e.value=t}});break}}}}show(t){this._r.classList.add("show"),this._r.style.left=t[0]+"px",this._r.style.top=t[1]+"px"}hide(){this._r.classList.remove("show")}values(){return this._properties}}export default class ManualData extends BaseData{constructor(t){super(t),this._org_padding=this._manager.platform._renderer[0].padding,this._manager.platform._renderer[0].padding=0,this._size=[960,500],this._dim=2,this._scale=.001,this._tool=null,this._contextmenu=new ContextMenu;const e=this.setting.data.configElement,s=document.createElement("div");e.appendChild(s),s.append("Dimension");const n=document.createElement("input");n.type="number",n.name="dimension",n.min=1,n.max=2,n.value=this._dim,n.onchange=()=>{this._dim=+n.value,this.setting.ml.refresh(),this.setting.vue.$forceUpdate(),this._manager.platform.render(),this.setting.vue.pushHistory()},s.appendChild(n),s.append(" Scale");const i=document.createElement("input");i.type="number",i.name="scale",i.min=0,i.max=1e4,i.step=.001,i.value=this._scale,i.onchange=()=>{this._scale=i.value,this._manager.platform.render()},s.appendChild(i);const r=document.createElement("div");e.appendChild(r),r.append("Preset");const a=document.createElement("select");a.onchange=()=>{const t=a.value;this.remove(),o.replaceChildren(),dataPresets[t].init?.(o),dataPresets[t].make(this,o)};for(const t of Object.keys(dataPresets)){const e=document.createElement("option");e.value=e.innerText=t,a.appendChild(e)}r.appendChild(a);const o=document.createElement("span");r.appendChild(o);const l=document.createElement("input");l.type="button",l.value="Reset",l.onclick=()=>{const t=a.value;this.remove(),dataPresets[t].make(this,o)},r.appendChild(l);const c=document.createElement("input");c.type="button",c.value="Clear",c.onclick=()=>{this.remove()},r.appendChild(c);const m=document.createElement("div");e.appendChild(m),m.append("Tools");const h=document.createElement("div");h.classList.add("manual-data-tools"),m.appendChild(h);for(const t in dataCreateTools){const e=document.createElement("div");e.title=t,e.classList.add("icon",t),e.onclick=()=>{this._tool?.terminate(),e.classList.contains("selected")?(e.classList.remove("selected"),this._tool=null,this._contextmenu.create()):(h.querySelectorAll("div").forEach((t=>t.classList.remove("selected"))),this._tool=dataCreateTools[t](this),e.classList.add("selected"),this._contextmenu.create(this._tool.menu),this._tool.init(this._contextmenu.values(),this.dummyArea))},h.appendChild(e),this._tool||(this._tool=dataCreateTools[t](this),e.classList.add("selected"),this._contextmenu.create(this._tool.menu),this._tool.init(this._contextmenu.values(),this.dummyArea))}this.addCluster([this._size[0]/4,this._size[1]/3],0,2500,100,1),this.addCluster([this._size[0]/2,2*this._size[1]/3],0,2500,100,2),this.addCluster([3*this._size[0]/4,this._size[1]/3],0,2500,100,3),dataPresets[a.value].init?.(o),this._entersvg=()=>this.initSVG(),document.addEventListener("mousemove",this._entersvg)}get availTask(){return 1===this._dim?["RG","IN","AD","DE","TF","SM","TP","CP"]:["CT","CF","SC","RG","IN","AD","DR","FS","DE","GR","SM","TP","CP"]}get domain(){return 1===this._dim?[[0,this._size[0]*this._scale]]:[[0,this._size[0]*this._scale],[0,this._size[1]*this._scale]]}get range(){return 1===this._dim?[0,this._size[1]*this._scale]:super.range}get dimension(){return this._dim}get originalX(){return 1===this._dim?this._x.map((t=>[t[0]])):this._x}get x(){return this.originalX.map((t=>t.map((t=>t*this._scale))))}get originalY(){return 1===this._dim?this._x.map((t=>t[1])):this._y}get y(){return 1===this._dim?this._x.map((t=>t[1]*this._scale)):this._y}get params(){return{dimension:this._dim}}set params(t){if(t.dimension){this.setting.data.configElement.querySelector("[name=dimension]").value=t.dimension,this._dim=+t.dimension,this.setting.vue.$forceUpdate(),this._manager.platform.render()}}get dummyArea(){this.initSVG();const t=this._r.querySelector("g.manual-dummy-area");if(!t){const t=document.createElementNS("http://www.w3.org/2000/svg","g");return t.classList.add("manual-dummy-area"),this._r.insertBefore(t,this._r.firstChild),t}return t}initSVG(){let t=this._manager.platform?.svg;if(!t)return;if(!t.querySelector("g.manual-root-area")){this._r=document.createElementNS("http://www.w3.org/2000/svg","g"),this._r.classList.add("manual-root-area"),t.appendChild(this._r);const e=document.createElementNS("http://www.w3.org/2000/svg","rect");this._r.appendChild(e),e.setAttribute("x",0),e.setAttribute("y",0),e.setAttribute("width",this._size[0]),e.setAttribute("height",this._size[1]),e.setAttribute("opacity",0),e.onmouseover=()=>{this._tool?.terminate(),this._tool?.init(this._contextmenu.values(),this.dummyArea)},e.onmousemove=t=>{const e=d3.pointer(t);this._tool?.move(e,this._contextmenu.values())},e.onmouseleave=()=>{this._tool?.terminate()},e.onclick=t=>{const e=d3.pointer(t);this._tool?.click(e,this._contextmenu.values())}}}splice(t,e,...s){const n=[],i=[];for(let t=0;t<s.length;t+=2)n.push(s[t]),i.push(s[t+1]);const r=this._manager.platform._renderer[0].toValue?.(n[0])[0];let a,o;return void 0!==r?(a=this._x.splice(t,e),o=this._y.splice(t,e),this._x.splice(r,0,...n),this._y.splice(r,0,...i)):(a=this._x.splice(t,e,...n),o=this._y.splice(t,e,...i)),this._manager.platform.render(),a.map(((t,e)=>[t,o[e]]))}set(t,e,s){this.splice(t,1,e,s)}push(...t){this.splice(this.length,0,...t)}pop(){return this.splice(this.length-1,1)[0]}unshift(...t){this.splice(0,0,...t)}shift(){return this.splice(0,1)[0]}remove(){this.splice(0,this.length)}terminate(){super.terminate(),this._tool?.terminate(),this._contextmenu.terminate(),this._r?.remove(),this._manager.platform._renderer[0].padding=this._org_padding,document.removeEventListener("mousemove",this._entersvg)}addCluster(t,e,s,n,i){const r=[];for(let a=0;a<n;a++){let n=[0,0];if(e>0)do{n=[2*Math.random()-1,2*Math.random()-1]}while(n[0]**2+n[1]**2<=1);if(n[0]=n[0]*e+t[0],n[1]=n[1]*e+t[1],s>0){const t=normal_random(0,s);n[0]+=t[0],n[1]+=t[1]}r.push(n,+i)}this.push(...r)}}