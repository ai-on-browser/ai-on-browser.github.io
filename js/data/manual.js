import{BaseData}from"./base.js";import{Matrix}from"../../lib/util/math.js";const normal_random=function(t=0,e=1){const a=Math.sqrt(e),r=Math.random(),n=Math.random();return[Math.sqrt(-2*Math.log(r))*Math.cos(2*Math.PI*n)*a+t,Math.sqrt(-2*Math.log(r))*Math.sin(2*Math.PI*n)*a+t]},dataCreateTools={point:(t,e)=>{let a=null;return{init:()=>{a=new DataPoint(e,[0,0],specialCategory.dummy)},move:(t,e)=>{a.at=t},click:(e,a)=>{t.push(e,a.category)},terminate:()=>{a?.remove()},menu:[{title:"category",type:"number",min:0,max:100,value:1,key:"category"}]}},circle:(t,e)=>{let a=null;return{init:()=>{a=e.append("circle").attr("r",0).attr("fill","red").attr("fill-opacity",.2).attr("stroke","red")},move:(t,e)=>{a.attr("cx",t[0]),a.attr("cy",t[1]),a.attr("r",e.radius)},click:(e,a)=>{for(let r=0;r<a.count;r++){const r=[2*Math.random()-1,2*Math.random()-1];for(;r[0]**2+r[1]**2>1;)r[0]=2*Math.random()-1,r[1]=2*Math.random()-1;t.push([e[0]+r[0]*a.radius,e[1]+r[1]*a.radius],a.category)}},terminate:()=>{a?.remove()},menu:[{title:"radius",type:"number",min:1,max:200,value:50,key:"radius"},{title:"category",type:"number",min:0,max:100,value:1,key:"category"},{title:"count",type:"number",min:1,max:100,value:10,key:"count"}]}},square:(t,e)=>{let a=null;return{init:()=>{a=e.append("rect").attr("fill","red").attr("fill-opacity",.2).attr("stroke","red")},move:(t,e)=>{a.attr("x",t[0]-e.size),a.attr("y",t[1]-e.size),a.attr("width",2*e.size),a.attr("height",2*e.size)},click:(e,a)=>{for(let r=0;r<a.count;r++){const r=[2*Math.random()-1,2*Math.random()-1];t.push([e[0]+r[0]*a.size,e[1]+r[1]*a.size],a.category)}},terminate:()=>{a?.remove()},menu:[{title:"size",type:"number",min:1,max:200,value:50,key:"size"},{title:"category",type:"number",min:0,max:100,value:1,key:"category"},{title:"count",type:"number",min:1,max:100,value:10,key:"count"}]}},gaussian:(t,e)=>{let a=null;const r=t=>{const e=[t.varx,t.cov,t.cov,t.vary],a=(e[0]+e[3]+Math.sqrt((e[0]-e[3])**2+4*e[1]**2))/2,r=(e[0]+e[3]-Math.sqrt((e[0]-e[3])**2+4*e[1]**2))/2;let n=360*Math.atan((a-e[0])/e[1])/(2*Math.PI);isNaN(n)&&(n=0),t.rot=n,t.rx=2.146*Math.sqrt(a),t.ry=2.146*Math.sqrt(r)},n=t=>{const e=(t.rx/2.146)**2,a=(t.ry/2.146)**2,r=Math.tan(2*t.rot*Math.PI/360),n=r**2,s=1+1/n,o=e+a+2*e/n,i=Math.sqrt(o**2-4*s*(e**2/n+e*a));if(isNaN(i))return t.varx=e,t.vary=a,void(t.cov=0);const l=(o-i)/(2*s),c=e+a-l,h=(e-l)/r;t.varx=l,t.vary=c,t.cov=h};return{init:()=>{a=e.append("ellipse").attr("rx",0).attr("ry",0).attr("fill","red").attr("fill-opacity",.2).attr("stroke","red")},move:(t,e)=>{const r=t,n=[e.varx,e.cov,e.cov,e.vary],s=(n[0]+n[3]+Math.sqrt((n[0]-n[3])**2+4*n[1]**2))/2,o=(n[0]+n[3]-Math.sqrt((n[0]-n[3])**2+4*n[1]**2))/2;let i=360*Math.atan((s-n[0])/n[1])/(2*Math.PI);isNaN(i)&&(i=0),a.attr("rx",2.146*Math.sqrt(s)).attr("ry",2.146*Math.sqrt(o)).attr("transform","translate("+r[0]+","+r[1]+") rotate("+i+")")},click:(e,a)=>{const r=[[a.varx,a.cov],[a.cov,a.vary]],n=Matrix.randn(a.count,2,e,r).toArray();for(let e=0;e<n.length;e++)t.push(n[e],a.category)},terminate:()=>{a?.remove()},menu:[{title:"var x",type:"number",min:1,max:1e4,value:1600,key:"varx",onchange:r},{title:"var y",type:"number",min:1,max:1e4,value:800,key:"vary",onchange:r},{title:"cov",type:"number",min:-1e3,max:1e3,value:800,key:"cov",onchange:r},{title:"rx",type:"number",min:0,max:1e3,value:98.21150163574005,key:"rx",onchange:n},{title:"ry",type:"number",min:0,max:1e3,value:37.5134555386868,key:"ry",onchange:n},{title:"rot",type:"number",min:-180,max:180,value:31.717474411461016,key:"rot",onchange:n},{title:"category",type:"number",min:0,max:100,value:1,key:"category"},{title:"count",type:"number",min:1,max:100,value:10,key:"count"}]}},eraser:(t,e)=>{let a=[];return{init:r=>{if(a.forEach((t=>t.remove())),a.length=0,"all"===r.mode)for(const r of t.points)a.push(e.append("circle").attr("r",r.radius).attr("fill","red").attr("cx",r.at[0]).attr("cy",r.at[1]));else"nearest"===r.mode?a.push(e.append("circle").attr("r",t.points[0].radius).attr("fill","red")):"circle"===r.mode&&a.push(e.append("circle").attr("r",50).attr("fill","red").attr("fill-opacity",.2))},move:(r,n)=>{if("nearest"===n.mode){let e=1/0,n=null;for(const a of t.points){const t=r.reduce(((t,e,r)=>t+(e-a.at[r])**2),0);t<e&&(n=a,e=t)}a[0].attr("cx",n.at[0]),a[0].attr("cy",n.at[1]),a[0].attr("r",n.radius)}else if("circle"===n.mode){a[0].attr("cx",r[0]),a[0].attr("cy",r[1]);for(let t=1;t<a.length;t++)a[t].remove();a.length=1;for(const n of t.points){const t=r.reduce(((t,e,a)=>t+(e-n.at[a])**2),0);Math.sqrt(t)<50&&a.push(e.append("circle").attr("r",n.radius).attr("fill","red").attr("cx",n.at[0]).attr("cy",n.at[1]))}}},click:(e,r)=>{if("all"===r.mode)t.remove(),a.forEach((t=>t.remove())),a.length=0;else if("nearest"===r.mode){let r=1/0,n=1/0,s=null,o=null;for(let a=0;a<t.length;a++){const i=e.reduce(((e,r,n)=>e+(r-t.points[a].at[n])**2),0);i<r?(o=s,s=a,n=r,r=i):i<n&&(o=a,n=i)}o&&(a[0].attr("cx",t.points[o].at[0]),a[0].attr("cy",t.points[o].at[1])),t.splice(s,1)}else if("circle"===r.mode){for(let a=t.length-1;a>=0;a--){const r=e.reduce(((e,r,n)=>e+(r-t.points[a].at[n])**2),0);Math.sqrt(r)<50&&t.splice(a,1)}for(let t=1;t<a.length;t++)a[t].remove();a.length=1}},terminate:()=>{a.forEach((t=>t.remove())),a.length=0},menu:[{title:"mode",type:"select",options:[{value:"nearest",text:"nearest"},{value:"circle",text:"circle"},{value:"all",text:"all"}],key:"mode"}]}}},dataPresets={clusters:(t,e=3,a=0,r=2500,n=100)=>{const s=t._manager.platform.width,o=t._manager.platform.height;let i=1;const l=[],c=[];for(let t=0;t<e;t++,i++){const t=[Math.random(),Math.random()];for(;l.some((e=>t.reduce(((t,a,r)=>t+(a-e[r])**2),0)<Math.random()));)t[0]=Math.random(),t[1]=Math.random();l.push(t.concat()),t[0]=2*s/3*t[0]+s/6,t[1]=2*o/3*t[1]+o/6;for(let e=0;e<n;e++){let e=[0,0];if(a>0)do{e=[2*Math.random()-1,2*Math.random()-1]}while(e[0]**2+e[1]**2<=1);if(e[0]=e[0]*a+t[0],e[1]=e[1]*a+t[1],r>0){const t=normal_random(0,r);e[0]+=t[0],e[1]+=t[1]}c.push(e,i)}}t.push(...c)},moons:(t,e=200,a=20,r=100)=>{let n=1;const s=[];for(let o=0;o<2;o++,n++)for(let o=0;o<r;o++){const r=Math.random()*Math.PI,o=[Math.cos(r)*e,Math.sin(r)*e];if(a>0){const t=normal_random(0,a);o[0]+=t[0],o[1]+=t[1]}2===n&&(o[0]=e-o[0],o[1]=e-o[1]-e/2),o[0]+=t._manager.platform.width/2-e/2,o[1]+=t._manager.platform.height/2-e/4,s.push(o,n)}t.push(...s)}};class ContextMenu{constructor(){this._r=d3.select("body").append("div").classed("context-menu",!0).on("click",(()=>{d3.event.stopPropagation()})),this._showMenu=t=>{this.show([t.pageX,t.pageY]);const e=()=>{this.hide(),document.body.removeEventListener("click",e)};document.body.addEventListener("click",e)},this._orgoncontextmenu=document.body.oncontextmenu}terminate(){this.create(),this._r.remove()}create(t){if(this._r.selectAll("*").remove(),!t||0===t.length)return document.body.removeEventListener("contextmenu",this._showMenu),void(document.body.oncontextmenu=this._orgoncontextmenu);document.body.addEventListener("contextmenu",this._showMenu),document.body.oncontextmenu=()=>!1;const e=this._r.append("ul");this._properties={};for(let a=0;a<t.length;a++){const r=e.append("li");switch(r.append("span").classed("item-title",!0).text(t[a].title),t[a].type){case"number":{const e=r.append("input").attr("type","number").attr("min",t[a].min).attr("max",t[a].max).attr("value",t[a].value).on("change",(()=>t[a].onchange?.(this._properties)));Object.defineProperty(this._properties,t[a].key,{get:()=>+e.property("value"),set:t=>e.property("value",t)});break}case"select":{const e=r.append("select").on("change",(()=>t[a].onchange?.(this._properties)));e.selectAll("option").data(t[a].options).enter().append("option").property("value",(t=>t.value)).text((t=>t.text)),Object.defineProperty(this._properties,t[a].key,{get:()=>e.property("value"),set:t=>e.property("value",t)});break}}}}show(t){this._r.classed("show",!0),this._r.style("left",t[0]+"px"),this._r.style("top",t[1]+"px")}hide(){this._r.classed("show",!1)}values(){return this._properties}}export default class ManualData extends BaseData{constructor(t){super(t),this._org_padding=this._manager.platform._renderer.padding,this._manager.platform._renderer.padding=0,this._dim=2,this._scale=.001,this._tool=null,this._contextmenu=new ContextMenu,this._r=this.svg.append("g");const e=this._r.append("g"),a=this._manager.platform.width,r=this._manager.platform.height,n=this;this._r.append("rect").attr("x",0).attr("y",0).attr("width",a).attr("height",r).attr("opacity",0).on("mouseenter",(()=>{this._tool?.terminate(),this.svg.node().lastChild!==this._r.node()&&(this._r.remove(),this.svg.append((()=>this._r.node()))),this._tool?.init(n._contextmenu.values())})).on("mousemove",(function(){const t=d3.mouse(this);n._tool?.move(t,n._contextmenu.values())})).on("mouseleave",(()=>{this._tool?.terminate()})).on("click",(function(){const t=d3.mouse(this);n._tool?.click(t,n._contextmenu.values())}));const s=this.setting.data.configElement;s.append("span").text("Dimension");const o=s.append("input").attr("type","number").attr("name","dimension").attr("min",1).attr("max",2).attr("value",this._dim).on("change",(()=>{this._dim=+o.property("value"),this.setting.ml.refresh(),this.setting.vue.$forceUpdate(),this._manager.platform.render(),this.setting.vue.pushHistory()})),i=s.append("div");i.append("span").text("Preset"),i.append("select").attr("name","preset").on("change",(()=>{const t=s.select("[name=preset]").property("value");this.remove(),dataPresets[t](this)})).selectAll("option").data(Object.keys(dataPresets)).enter().append("option").attr("value",(t=>t)).text((t=>t)),i.append("input").attr("type","button").attr("value","Reset").on("click",(()=>{const t=s.select("[name=preset]").property("value");this.remove(),dataPresets[t](this)})),i.append("input").attr("type","button").attr("value","Clear").on("click",(()=>{this.remove()}));const l=s.append("div");l.append("span").text("Tools");const c=l.append("div").classed("manual-data-tools",!0);for(const t in dataCreateTools){const a=c.append("div").attr("title",t).classed("icon",!0).classed(t,!0).on("click",(()=>{this._tool?.terminate(),a.classed("selected")?(a.classed("selected",!1),this._tool=null,this._contextmenu.create()):(c.selectAll("div").classed("selected",!1),this._tool=dataCreateTools[t](this,e),a.classed("selected",!0),this._contextmenu.create(this._tool.menu),this._tool.init(n._contextmenu.values()))}));this._tool||(this._tool=dataCreateTools[t](this,e),a.classed("selected",!0),this._contextmenu.create(this._tool.menu),this._tool.init(n._contextmenu.values()))}this.addCluster([a/4,r/3],0,2500,100,1),this.addCluster([a/2,2*r/3],0,2500,100,2),this.addCluster([3*a/4,r/3],0,2500,100,3)}get availTask(){return 1===this._dim?["RG","IN","AD","DE","TF","SM","TP","CP"]:["CT","CF","SC","RG","AD","DR","FS","DE","GR","MD","GM","SM","TP","CP"]}get domain(){const t=this._manager.platform.width,e=this._manager.platform.height;return 1===this._dim?[[0,t*this._scale]]:[[0,t*this._scale],[0,e*this._scale]]}get range(){return 1===this._dim?[0,this._manager.platform.height*this._scale]:super.range}get dimension(){return this._dim}get x(){return 1===this._dim?this._x.map((t=>[t[0]*this._scale])):this._x.map((t=>t.map((t=>t*this._scale))))}get y(){return 1===this._dim?this._x.map((t=>t[1]*this._scale)):this._y}get scale(){return this._scale}set scale(t){this._scale=t}get params(){return{dimension:this._dim}}set params(t){if(t.dimension){this.setting.data.configElement.select("[name=dimension]").property("value",t.dimension),this._dim=+t.dimension,this.setting.vue.$forceUpdate(),this._manager.platform.render()}}at(t){return Object.defineProperties({},{x:{get:()=>1===this._dim?[this._x[t][0]*this._scale]:this._x[t].map((t=>t*this._scale)),set:e=>{this._x[t]=e.map((t=>t/this._scale)),this._manager.platform.render()}},y:{get:()=>1===this._dim?this._x[t][1]:this._y[t],set:e=>{this._y[t]=e,this._manager.platform.render()}},point:{get:()=>this.points[t]}})}splice(t,e,...a){const r=[],n=[];for(let t=0;t<a.length;t+=2)r.push(a[t]),n.push(a[t+1]);const s=this._manager.platform._renderer.toValue(r[0])[0];let o,i;return void 0!==s?(o=this._x.splice(t,e),i=this._y.splice(t,e),this._x.splice(s,0,...r),this._y.splice(s,0,...n)):(o=this._x.splice(t,e,...r),i=this._y.splice(t,e,...n)),this._manager.platform.render(),o.map(((t,e)=>[t,i[e]]))}terminate(){super.terminate(),this._tool?.terminate(),this._contextmenu.terminate(),this._r.remove(),this._manager.platform._renderer.padding=this._org_padding}addCluster(t,e,a,r,n){const s=[];for(let o=0;o<r;o++){let r=[0,0];if(e>0)do{r=[2*Math.random()-1,2*Math.random()-1]}while(r[0]**2+r[1]**2<=1);if(r[0]=r[0]*e+t[0],r[1]=r[1]*e+t[1],a>0){const t=normal_random(0,a);r[0]+=t[0],r[1]+=t[1]}s.push(r,+n)}this.push(...s)}}