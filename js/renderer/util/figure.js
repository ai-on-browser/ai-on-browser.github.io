var S=Object.defineProperty;var g=(d,t)=>S(d,"name",{value:t,configurable:!0});import{getCategoryColor as v,specialCategory as x}from"../../utils.js";class P{static{g(this,"DataPointCirclePlotter")}constructor(t,i){this._svg=t,this.item=i,i||(this.item=document.createElementNS("http://www.w3.org/2000/svg","circle"),this._svg.append(this.item))}attr(t,i){return i!==void 0?(this.item.setAttribute(t,i),this):this.item.getAttribute(t)}cx(t){return this.attr("cx",t)}cy(t){return this.attr("cy",t)}color(t){return this.attr("fill",t)}radius(t){return this.attr("r",t)}title(t){if(this.item.replaceChildren(),t&&t!==""){const i=document.createElementNS("http://www.w3.org/2000/svg","title");this.item.append(i),i.replaceChildren(t)}return this}remove(){return this.item.remove()}}export class DataPointStarPlotter{static{g(this,"DataPointStarPlotter")}constructor(t,i,e){this._svg=t,this._c=[0,0],this._r=5,i?(this.g=i,this.polygon=e):(this.g=document.createElementNS("http://www.w3.org/2000/svg","g"),this._svg.append(this.g),this.polygon=document.createElementNS("http://www.w3.org/2000/svg","polygon"),this.g.append(this.polygon),this.polygon.setAttribute("points",this._path()),this.polygon.setAttribute("stroke","black"))}_path(){return[[-Math.sin(Math.PI*2/5),-Math.cos(Math.PI*2/5)],[-Math.sin(Math.PI/5)/2,-Math.cos(Math.PI/5)/2],[0,-1],[Math.sin(Math.PI/5)/2,-Math.cos(Math.PI/5)/2],[Math.sin(Math.PI*2/5),-Math.cos(Math.PI*2/5)],[Math.sin(Math.PI*3/5)/2,-Math.cos(Math.PI*3/5)/2],[Math.sin(Math.PI*4/5),-Math.cos(Math.PI*4/5)],[0,1/2],[-Math.sin(Math.PI*4/5),-Math.cos(Math.PI*4/5)],[-Math.sin(Math.PI*3/5)/2,-Math.cos(Math.PI*3/5)/2]].reduce((t,i)=>t+i[0]*this._r+","+i[1]*this._r+" ","")}cx(t){return this._c[0]=t||this._c[0],t!==void 0?(this.g.setAttribute("transform","translate("+this._c[0]+", "+this._c[1]+")"),this):this._c[0]}cy(t){return this._c[1]=t||this._c[1],t!==void 0?(this.g.setAttribute("transform","translate("+this._c[0]+", "+this._c[1]+")"),this):this._c[1]}color(t){return t!==void 0?(this.polygon.setAttribute("fill",t),this):this.polygon.getAttribute("fill")}radius(t){return this._r=t||this._r,t!==void 0?(this.polygon.setAttribute("points",this._path()),this):this._r}title(t){if(this.polygon.replaceChildren(),t&&t!==""){const i=document.createElementNS("http://www.w3.org/2000/svg","title");this.polygon.append(i),i.replaceChildren(t)}return this}duration(t){return this.g.style.transitionDuration=t+"ms",this.g.style.transitionTimingFunction="linear",this.polygon.style.transitionDuration=t+"ms",this.polygon.style.transitionTimingFunction="linear",this}remove(){return this.g.remove()}}export class DataPoint{static{g(this,"DataPoint")}constructor(t,i=[0,0],e=0){this.svg=t,this._pos=i,this._color=v(e),this._category=e,this._radius=5,this._plotter=new P(this.svg),this._binds=[],this.display()}display(){this._plotter.cx(""+this._pos[0]).cy(""+this._pos[1]).radius(this._radius).color(this._color),this._binds.forEach(t=>t.display())}get item(){return this._plotter.item}get at(){return this._pos}set at(t){this._pos=t,this.display()}get color(){return this._color}get category(){return this._category}set category(t){this._category=t,this._color=v(t),this.display()}get radius(){return this._radius}set radius(t){this._radius=t,this.display()}set title(t){this._plotter.title(t)}plotter(t){this._plotter.remove(),this._plotter=new t(this.svg),this.display()}remove(){this._plotter.remove(),this._binds.forEach(t=>t.remove())}move(t,i=1e3){this._pos=t,this._plotter.duration(i).cx(this._pos[0]).cy(this._pos[1]),this._binds.forEach(e=>e.move(i))}bind(t){this._binds.push(t)}removeBind(t){this._binds=this._binds.filter(i=>i!==t)}}export class DataCircle{static{g(this,"DataCircle")}constructor(t,i){this._svg=t,this.item=document.createElementNS("http://www.w3.org/2000/svg","circle"),this._svg.append(this.item),this.item.setAttribute("fill-opacity",0),this._at=i,this._color=null,this._width=4,i.bind(this),this.display()}get color(){return this._color||this._at.color}set color(t){this._color=t,this.display()}set title(t){if(this.item.replaceChildren(),t&&t.length>0){const i=document.createElementNS("http://www.w3.org/2000/svg","title");this.item.append(i),i.replaceChildren(t)}}display(){this.item.setAttribute("cx",this._at.at[0]),this.item.setAttribute("cy",this._at.at[1]),this.item.setAttribute("stroke",this.color),this.item.setAttribute("stroke-width",this._width),this.item.setAttribute("r",this._at._radius)}remove(){this.item.remove(),this._at.removeBind(this)}}export class DataLine{static{g(this,"DataLine")}constructor(t,i,e){this._svg=t,this.item=document.createElementNS("http://www.w3.org/2000/svg","line"),this._svg.append(this.item),this._from=i,this._to=e,this._remove_listener=null,i&&i.bind(this),e&&e.bind(this),this.display()}set from(t){this._from&&this._from.removeBind(this),this._from=t,this._from.bind(this)}set to(t){this._to&&this._to.removeBind(this),this._to=t,this._to.bind(this)}display(){!this._from||!this._to||(this.item.setAttribute("x1",this._from.at[0]),this.item.setAttribute("y1",this._from.at[1]),this.item.setAttribute("x2",this._to.at[0]),this.item.setAttribute("y2",this._to.at[1]),this.item.setAttribute("stroke",this._from.color))}move(t=1e3){if(!this._from||!this._to)return;if(t===0){this.display();return}const i=+this.item.getAttribute("x1"),e=+this.item.getAttribute("y1"),s=+this.item.getAttribute("x2"),l=+this.item.getAttribute("y2"),o=this._from.at[0]-i,u=this._from.at[1]-e,n=this._to.at[0]-s,p=this._to.at[1]-l;let m=0,a=0;const c=g(w=>{m||(m=w);const f=Math.min(1,(w-m)/t);if(Math.abs(w-a)>15){if(o!==0&&this.item.setAttribute("x1",i+o*f),u!==0&&this.item.setAttribute("y1",e+u*f),n!==0&&this.item.setAttribute("x2",s+n*f),p!==0&&this.item.setAttribute("y2",l+p*f),f>=1)return;a=w}requestAnimationFrame(c)},"step");requestAnimationFrame(c)}remove(){this.item.remove(),this._from&&this._from.removeBind(this),this._from=null,this._to&&this._to.removeBind(this),this._to=null,this._remove_listener&&this._remove_listener(this)}setRemoveListener(t){this._remove_listener=t}}export class DataConvexHull{static{g(this,"DataConvexHull")}constructor(t,i){this._svg=t,this.item=document.createElementNS("http://www.w3.org/2000/svg","polygon"),this._svg.append(this.item),this._points=i,this._color=null,this.display()}get color(){return this._color||this._points[0].color}set color(t){this._color=t,this.display()}_argmin(t,i){return t.length===0?-1:(t=i?t.map(i):t,t.indexOf(Math.min(...t)))}_convexPoints(){if(this._points.length<=3)return this._points;const t=[].concat(this._points),i=this._argmin(t,o=>o.at[1]),e=g((o,u)=>o.map((n,p)=>n-u[p]),"sub"),s=t.splice(i,1)[0];t.sort((o,u)=>{let n=e(o.at,s.at),p=e(u.at,s.at);return n[0]/Math.hypot(...n)-p[0]/Math.hypot(...p)});let l=[s];for(let o=0;o<t.length;o++){for(;l.length>=3;){let u=l.length;const n=e(l[u-1].at,l[u-2].at),p=e(t[o].at,l[u-2].at),m=e(s.at,l[u-2].at);if((n[0]*m[1]-n[1]*m[0])*(n[0]*p[1]-n[1]*p[0])>0)break;l.pop()}l.push(t[o])}return l}display(){let t=this._convexPoints().reduce((i,e)=>i+e.at[0]+","+e.at[1]+" ","");this.item.setAttribute("points",t),this.item.setAttribute("stroke",this.color),this.item.setAttribute("fill",this.color),this.item.setAttribute("opacity",.5)}remove(){this.item.remove()}}class A{static{g(this,"DataMap")}constructor(){this._data=[],this._size=[0,0]}get rows(){return this._size[0]}get cols(){return this._size[1]}at(t,i){return t<0||!this._data[t]||i<0?void 0:this._data[t][i]}set(t,i,e){this._data[t]||(this._data[t]=[]),this._data[t][i]=e,this._size[0]=Math.max(this._size[0],t+1),this._size[1]=Math.max(this._size[1],i+1)}}export class DataHulls{static{g(this,"DataHulls")}constructor(t,i,e,s=!1,l=null){this._svg=t,this._categories=i,this._tileSize=e,Array.isArray(this._tileSize)||(this._tileSize=[this._tileSize,this._tileSize]),this._use_canvas=s,this._mousemove=l,this.display()}display(){if(this._use_canvas){const e=document.querySelector("#plot-area svg"),s=document.createElement("canvas");s.width=e.getBoundingClientRect().width,s.height=e.getBoundingClientRect().height;let l=s.getContext("2d");for(let n=0;n<this._categories.length;n++)for(let p=0;p<this._categories[n].length;p++)l.fillStyle=v(this._categories[n][p]),l.fillRect(Math.round(p*this._tileSize[0]),Math.round(n*this._tileSize[1]),Math.ceil(this._tileSize[0]),Math.ceil(this._tileSize[1]));let o=this;const u=document.createElementNS("http://www.w3.org/2000/svg","image");this._svg.append(u),u.setAttribute("x",0),u.setAttribute("y",0),u.setAttribute("width",s.width),u.setAttribute("height",s.height),u.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",s.toDataURL()),u.onmousemove=n=>{const p=d3.pointer(n);this._mousemove&&this._mousemove(o._categories[Math.round(p[1]/o._tileSize)][Math.round(p[0]/o._tileSize)])};return}let t=new A;for(let e=0;e<this._categories.length;e++)for(let s=0;s<this._categories[e].length;s++)this._categories[e][s]===null?t.set(e,s,null):t.set(e,s,Math.round(this._categories[e][s]));const i=[];for(let e=0;e<t.rows;e++)for(let s=0;s<t.cols;s++){if(t.at(e,s)<=x.never)continue;let l=t.at(e,s),o=new A,u=new A,n=[[e,s]],p=!1;for(;n.length>0;){let[r,h]=n.pop();t.at(r,h)===l?(o.set(r,h,1),t.set(r,h,x.never),n.push([r-1,h]),n.push([r+1,h]),n.push([r,h-1]),n.push([r,h+1]),u.set(r,h,o.at(r-1,h)!==1&&t.at(r-1,h)!==l||o.at(r+1,h)!==1&&t.at(r+1,h)!==l||o.at(r,h-1)!==1&&t.at(r,h-1)!==l||o.at(r,h+1)!==1&&t.at(r,h+1)!==l)):t.at(r,h)===void 0&&l===null&&(p=!0)}if(p)continue;let m=[[e,s]],a=e,c=s+1;const w=t.rows*t.cols;let f=0,_="r";for(;a!=e||c!=s;){let r=o.at(a-1,c-1),h=o.at(a-1,c),b=o.at(a,c-1),y=o.at(a,c);if(h&&r&&b&&y){i.push([a,c]);break}else if(h&&r&&b)m.push([a,c]),_="b";else if(r&&b&&y)m.push([a,c]),_="r";else if(b&&y&&h)m.push([a,c]),_="t";else if(y&&h&&r)m.push([a,c]),_="l";else if(h&&r)_="l";else if(r&&b)_="b";else if(b&&y)_="r";else if(y&&h)_="t";else if(h&&b)m.push([a,c]),_==="l"?_="t":_==="r"?_="b":i.push([a,c]);else if(r&&y)m.push([a,c]),_==="t"?_="r":_==="b"?_="l":i.push([a,c]);else if(h)m.push([a,c]),_="t";else if(r)m.push([a,c]),_="l";else if(b)m.push([a,c]),_="b";else if(y)m.push([a,c]),_="r";else{i.push([a,c]);break}if(_==="r"?c+=1:_==="l"?c-=1:_==="b"?a+=1:_==="t"&&(a-=1),f+=1,f>=w){i.push([a,c]);break}}const M=document.createElementNS("http://www.w3.org/2000/svg","polygon");this._svg.append(M),M.setAttribute("points",m.reduce((r,h)=>r+h[1]*this._tileSize[0]+","+h[0]*this._tileSize[1]+" ","")),M.setAttribute("fill",l===null?"white":v(l))}if(i.length>0){let e="";i.length>100?(e="[",e+=i.slice(0,50).map(JSON.stringify).join(","),e+=",...,",e+=i.slice(-50).map(JSON.stringify).join(","),e+="]"):e=JSON.stringify(i),console.log("invalid loop condition at "+e)}}}
