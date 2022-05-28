export class BaseWorker{constructor(t,e){this._worker=new Worker(t,e)}_postMessage(t,e){if(e){const t=i=>{this._worker.removeEventListener("message",t,!1),e(i)};this._worker.addEventListener("message",t,!1)}this._worker.postMessage(t)}terminate(){this._worker.terminate()}}class DataPointCirclePlotter{constructor(t,e){this._svg=t,this.item=e||this._svg.append("circle")}attr(t,e){return void 0!==e?this.item.attr(t,e)&&this:this.item.attr(t)}cx(t){return this.attr("cx",t)}cy(t){return this.attr("cy",t)}color(t){return this.attr("fill",t)}radius(t){return this.attr("r",t)}title(t){return this.item.selectAll("*").remove(),t&&""!==t&&this.item.append("title").text(t),this}transition(){return new DataPointCirclePlotter(this._svg,this.item.transition())}duration(t){return new DataPointCirclePlotter(this._svg,this.item.duration(t))}remove(){return this.item.remove()}}export class DataPointStarPlotter{constructor(t,e,i){this._svg=t,this._c=[0,0],this._r=5,e?(this.g=e,this.polygon=i):(this.g=this._svg.append("g"),this.polygon=this.g.append("polygon"),this.polygon.attr("points",this._path()).attr("stroke","black"))}_path(){return[[-Math.sin(2*Math.PI/5),-Math.cos(2*Math.PI/5)],[-Math.sin(Math.PI/5)/2,-Math.cos(Math.PI/5)/2],[0,-1],[Math.sin(Math.PI/5)/2,-Math.cos(Math.PI/5)/2],[Math.sin(2*Math.PI/5),-Math.cos(2*Math.PI/5)],[Math.sin(3*Math.PI/5)/2,-Math.cos(3*Math.PI/5)/2],[Math.sin(4*Math.PI/5),-Math.cos(4*Math.PI/5)],[0,.5],[-Math.sin(4*Math.PI/5),-Math.cos(4*Math.PI/5)],[-Math.sin(3*Math.PI/5)/2,-Math.cos(3*Math.PI/5)/2]].reduce(((t,e)=>t+e[0]*this._r+","+e[1]*this._r+" "),"")}cx(t){return this._c[0]=t||this._c[0],void 0!==t?this.g.attr("transform","translate("+this._c[0]+", "+this._c[1]+")")&&this:this._c[0]}cy(t){return this._c[1]=t||this._c[1],void 0!==t?this.g.attr("transform","translate("+this._c[0]+", "+this._c[1]+")")&&this:this._c[1]}color(t){return void 0!==t?this.polygon.attr("fill",t)&&this:this.polygon.attr("fill")}radius(t){return this._r=t||this._r,void 0!==t?this.polygon.attr("points",this._path())&&this:this._r}title(t){return this.polygon.selectAll("*").remove(),t&&""!==t&&this.polygon.append("title").text(t),this}transition(){return new DataPointStarPlotter(this._svg,this.g.transition(),this.polygon.transition())}duration(t){return new DataPointStarPlotter(this._svg,this.g.duration(t),this.polygon.duration(t))}remove(){return this.g.remove()}}class DataVector{constructor(t){this.value=t instanceof DataVector?t.value:t}get length(){return Math.sqrt(this.value.reduce(((t,e)=>t+e*e),0))}map(t){return new DataVector(this.value.map(t))}reduce(t,e){return this.value.reduce(t,e)}add(t){return this.map(((e,i)=>e+t.value[i]))}sub(t){return this.map(((e,i)=>e-t.value[i]))}mult(t){return this.map((e=>e*t))}div(t){return this.map((e=>e/t))}dot(t){return this.value.reduce(((e,i,s)=>e+i*t.value[s]),0)}distance(t){return Math.sqrt(this.value.reduce(((e,i,s)=>e+(i-t.value[s])**2),0))}angleCos(t){return this.dot(t)/(this.length*t.length)}equals(t){return this.value.every(((e,i)=>e===t.value[i]))}}const categoryColors={"-2":d3.rgb(255,0,0),"-1":d3.rgb(255,255,255),0:d3.rgb(0,0,0)};export const specialCategory={error:-2,errorRate:t=>-1-t,dummy:-2,density:t=>-1+t,never:-3};export const getCategoryColor=function(t){if(isNaN(t))return categoryColors[0];if(!Number.isInteger(t)){let e=getCategoryColor(Math.floor(t)),i=getCategoryColor(Math.ceil(t)),s=t-Math.floor(t);return d3.rgb(Math.round(e.r+(i.r-e.r)*s),Math.round(e.g+(i.g-e.g)*s),Math.round(e.b+(i.b-e.b)*s))}if(!categoryColors[t%=1e3]){let e=0;for(;;){e+=1;const i=[Math.random(),Math.random(),Math.random()];if(i.every((t=>t>.8)))continue;let s=1/0;for(const e of Object.keys(categoryColors)){if(+e<0||Math.abs(+e-t)>10)continue;const r=(i[0]-categoryColors[e].r/256)**2+(i[1]-categoryColors[e].g/256)**2+(i[2]-categoryColors[e].b/256)**2;r<s&&(s=r)}if(Math.random()-e/200<Math.sqrt(s/3)){categoryColors[t]=d3.rgb(Math.floor(256*i[0]),Math.floor(256*i[1]),Math.floor(256*i[2]));break}}}return categoryColors[t]};export class DataPoint{constructor(t,e=[0,0],i=0){this.svg=t,this.vector=new DataVector(e),this._color=getCategoryColor(i),this._category=i,this._radius=5,this._plotter=new DataPointCirclePlotter(t),this._binds=[],this.display()}display(){this._plotter.cx(""+this.vector.value[0]).cy(""+this.vector.value[1]).radius(this._radius).color(this._color),this._binds.forEach((t=>t.display()))}get item(){return this._plotter.item}get at(){return this.vector.value}set at(t){this.vector=new DataVector(t),this.display()}get color(){return this._color}get category(){return this._category}set category(t){this._category=t,this._color=getCategoryColor(t),this.display()}get radius(){return this._radius}set radius(t){this._radius=t,this.display()}set title(t){this._plotter.title(t)}plotter(t){this._plotter.remove(),this._plotter=new t(this.svg),this.display()}remove(){this._plotter.remove(),this._binds.forEach((t=>t.remove()))}move(t,e=1e3){this.vector=new DataVector(t),this._plotter.transition().duration(e).cx(this.vector.value[0]).cy(this.vector.value[1]),this._binds.forEach((t=>t.move(e)))}distance(t){return this.vector.distance(t.vector)}bind(t){this._binds.push(t)}removeBind(t){this._binds=this._binds.filter((e=>e!==t))}static sum(t){return 0===t.length?[]:t.slice(1).reduce(((t,e)=>t.add(e.vector)),t[0].vector)}static mean(t){return 0===t.length?[]:DataPoint.sum(t).div(t.length)}}export class DataCircle{constructor(t,e){this._svg=t,this.item=t.append("circle").attr("fill-opacity",0),this._at=e,this._color=null,this._width=4,e.bind(this),this.display()}get color(){return this._color||this._at.color}set color(t){this._color=t,this.display()}set title(t){this.item.selectAll("*").remove(),t&&t.length>0&&this.item.append("title").text(t)}display(){this.item.attr("cx",this._at.at[0]).attr("cy",this._at.at[1]).attr("stroke",this.color).attr("stroke-width",this._width).attr("r",this._at._radius)}move(t=1e3){this.item.transition().duration(t).attr("cx",this._at.at[0]).attr("cy",this._at.at[1])}remove(){this.item.remove(),this._at.removeBind(this)}}export class DataLine{constructor(t,e,i){this._svg=t,this.item=t.append("line"),this._from=e,this._to=i,this._remove_listener=null,e&&e.bind(this),i&&i.bind(this),this.display()}set from(t){this._from&&this._from.removeBind(this),this._from=t,this._from.bind(this)}set to(t){this._to&&this._to.removeBind(this),this._to=t,this._to.bind(this)}display(){this._from&&this._to&&this.item.attr("x1",this._from.at[0]).attr("y1",this._from.at[1]).attr("x2",this._to.at[0]).attr("y2",this._to.at[1]).attr("stroke",this._from.color)}move(t=1e3){this._from&&this._to&&this.item.transition().duration(t).attr("x1",this._from.at[0]).attr("y1",this._from.at[1]).attr("x2",this._to.at[0]).attr("y2",this._to.at[1])}remove(){this.item.remove(),this._from&&this._from.removeBind(this),this._from=null,this._to&&this._to.removeBind(this),this._to=null,this._remove_listener&&this._remove_listener(this)}setRemoveListener(t){this._remove_listener=t}}export class DataConvexHull{constructor(t,e){this._svg=t,this.item=t.append("polygon"),this._points=e,this._color=null,this.display()}get color(){return this._color||this._points[0].color}set color(t){this._color=t,this.display()}_argmin(t,e){return 0===t.length?-1:(t=e?t.map(e):t).indexOf(Math.min(...t))}_convexPoints(){if(this._points.length<=3)return this._points;let t=[].concat(this._points),e=this._argmin(t,(t=>t.at[1]));const i=t.splice(e,1)[0];t.sort(((t,e)=>{let s=t.vector.sub(i.vector),r=e.vector.sub(i.vector);return s.value[0]/s.length-r.value[0]/r.length}));let s=[i];for(let e=0;e<t.length;e++){for(;s.length>=3;){let r=s.length;const o=s[r-1].vector.sub(s[r-2].vector).value,a=t[e].vector.sub(s[r-2].vector).value,h=i.vector.sub(s[r-2].vector).value;if((o[0]*h[1]-o[1]*h[0])*(o[0]*a[1]-o[1]*a[0])>0)break;s.pop()}s.push(t[e])}return s}display(){let t=this._convexPoints().reduce(((t,e)=>t+e.at[0]+","+e.at[1]+" "),"");this.item.attr("points",t).attr("stroke",this.color).attr("fill",this.color).attr("opacity",.5)}remove(){this.item.remove()}}class DataMap{constructor(){this._data=[],this._size=[0,0]}get rows(){return this._size[0]}get cols(){return this._size[1]}at(t,e){return t<0||!this._data[t]||e<0?void 0:this._data[t][e]}set(t,e,i){this._data[t]||(this._data[t]=[]),this._data[t][e]=i,this._size[0]=Math.max(this._size[0],t+1),this._size[1]=Math.max(this._size[1],e+1)}}export class DataHulls{constructor(t,e,i,s=!1,r=null){this._svg=t,this._categories=e,this._tileSize=i,Array.isArray(this._tileSize)||(this._tileSize=[this._tileSize,this._tileSize]),this._use_canvas=s,this._mousemove=r,this.display()}display(){if(this._use_canvas){const t=document.querySelector("#plot-area svg"),e=document.createElement("canvas");e.width=t.getBoundingClientRect().width,e.height=t.getBoundingClientRect().height;let i=e.getContext("2d");for(let t=0;t<this._categories.length;t++)for(let e=0;e<this._categories[t].length;e++)i.fillStyle=getCategoryColor(this._categories[t][e]),i.fillRect(e*this._tileSize[0],t*this._tileSize[1],this._tileSize[0],this._tileSize[1]);let s=this;return void this._svg.append("image").attr("x",0).attr("y",0).attr("width",e.width).attr("height",e.height).attr("xlink:href",e.toDataURL()).on("mousemove",(t=>{const e=d3.pointer(t);this._mousemove&&this._mousemove(s._categories[Math.round(e[1]/s._tileSize)][Math.round(e[0]/s._tileSize)])}))}let t=new DataMap;for(let e=0;e<this._categories.length;e++)for(let i=0;i<this._categories[e].length;i++)null===this._categories[e][i]?t.set(e,i,null):t.set(e,i,Math.round(this._categories[e][i]));const e=[];for(let i=0;i<t.rows;i++)for(let s=0;s<t.cols;s++){if(t.at(i,s)<=specialCategory.never)continue;let r=t.at(i,s),o=new DataMap,a=new DataMap,h=[[i,s]],l=!1;for(;h.length>0;){let[e,i]=h.pop();t.at(e,i)===r?(o.set(e,i,1),t.set(e,i,specialCategory.never),h.push([e-1,i]),h.push([e+1,i]),h.push([e,i-1]),h.push([e,i+1]),a.set(e,i,1!==o.at(e-1,i)&&t.at(e-1,i)!==r||1!==o.at(e+1,i)&&t.at(e+1,i)!==r||1!==o.at(e,i-1)&&t.at(e,i-1)!==r||1!==o.at(e,i+1)&&t.at(e,i+1)!==r)):void 0===t.at(e,i)&&null===r&&(l=!0)}if(l)continue;let n=[[i,s]],c=i,u=s+1;const _=t.rows*t.cols;let g=0,d="r";for(;c!=i||u!=s;){let t=o.at(c-1,u-1),i=o.at(c-1,u),s=o.at(c,u-1),r=o.at(c,u);if(i&&t&&s&&r){e.push([c,u]);break}if(i&&t&&s)n.push([c,u]),d="b";else if(t&&s&&r)n.push([c,u]),d="r";else if(s&&r&&i)n.push([c,u]),d="t";else if(r&&i&&t)n.push([c,u]),d="l";else if(i&&t)d="l";else if(t&&s)d="b";else if(s&&r)d="r";else if(r&&i)d="t";else if(i&&s)n.push([c,u]),"l"===d?d="t":"r"===d?d="b":e.push([c,u]);else if(t&&r)n.push([c,u]),"t"===d?d="r":"b"===d?d="l":e.push([c,u]);else if(i)n.push([c,u]),d="t";else if(t)n.push([c,u]),d="l";else if(s)n.push([c,u]),d="b";else{if(!r){e.push([c,u]);break}n.push([c,u]),d="r"}if("r"===d?u+=1:"l"===d?u-=1:"b"===d?c+=1:"t"===d&&(c-=1),g+=1,g>=_){e.push([c,u]);break}}this._svg.append("polygon").attr("points",n.reduce(((t,e)=>t+e[1]*this._tileSize[1]+","+e[0]*this._tileSize[0]+" "),"")).attr("fill",null===r?"white":getCategoryColor(r))}if(e.length>0){let t="";e.length>100?(t="[",t+=e.slice(0,50).map(JSON.stringify).join(","),t+=",...,",t+=e.slice(-50).map(JSON.stringify).join(","),t+="]"):t=JSON.stringify(e),console.log("invalid loop condition at "+t)}}}