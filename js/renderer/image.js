import BaseRenderer from"./base.js";import{specialCategory,getCategoryColor}from"../utils.js";export default class ImageRenderer extends BaseRenderer{constructor(t){super(t),this._size=[0,0];const e=this.setting.render.addItem("image"),a=document.createElement("div");e.appendChild(a),a.append(" overwrap "),this._opacity=document.createElement("input"),this._opacity.name="opacity",this._opacity.type="range",this._opacity.min=0,this._opacity.max=1,this._opacity.step=.1,this._opacity.value=.5,this._opacity.oninput=()=>{this._overlay&&(this._overlay.style.opacity=this._opacity.value)},a.appendChild(this._opacity),this._root=document.createElement("div"),e.appendChild(this._root),this._root.style.position="relative",this._root.style.border="1px solid black"}get width(){return this._size[0]}set width(t){this._size[0]=t,this._root.style.width=`${t}px`}get height(){return this._size[1]}set height(t){this._size[1]=t,this._root.style.height=`${t}px`}set trainResult(t){this._displayResult(t)}init(){this._overlay?.remove(),this._root.replaceChildren()}render(){if(this._root.querySelector("canvas.base-img")?.remove(),!(this.datas&&this.datas.x&&Array.isArray(this.datas.x[0])&&Array.isArray(this.datas.x[0][0])))return;const t=this.datas.x[0],e=this._manager.platform._color_space?this.datas._applySpace(t,this._manager.platform._color_space,this._manager.platform._normalize,this._manager.platform._binary_threshold):t,a=e[0][0].length,i=document.createElement("canvas");i.classList.add("base-img"),i.style.position="absolute",i.width=t[0].length,i.height=t.length;const s=i.getContext("2d"),r=s.createImageData(i.width,i.height);for(let t=0,s=0;t<i.height;t++)for(let o=0;o<i.width;o++,s+=4)r.data[s]=e[t][o][0],1===a?(r.data[s+1]=e[t][o][0],r.data[s+2]=e[t][o][0],r.data[s+3]=255):3===a?(r.data[s+1]=e[t][o][1],r.data[s+2]=e[t][o][2],r.data[s+3]=255):(r.data[s+1]=e[t][o][1],r.data[s+2]=e[t][o][2],r.data[s+3]=e[t][o][3]);s.putImageData(r,0,0),this._root.firstChild?this._root.insertBefore(i,this._root.firstChild):this._root.appendChild(i),this.width=i.width,this.height=i.height}testResult(t){this._displayResult(t)}_displayResult(t){this._overlay?.remove();const e=document.createElement("canvas");e.classList.add("overlay"),e.style.position="absolute",e.style.opacity=this._opacity.value,e.width=this.width,e.height=this.height;const a=e.getContext("2d"),i=a.createImageData(e.width,e.height);for(let e=0,a=0;e<this.height;e++)for(let s=0;s<this.width;s++,a+=4){const r=[0,0,0,0];if(Array.isArray(t[e][s]))r[0]=t[e][s][0],r[3]=255,1===t[e][s].length?(r[1]=t[e][s][0],r[2]=t[e][s][0]):(r[1]=t[e][s][1],r[2]=t[e][s][2]);else if(!0===t[e][s]||!1===t[e][s])if(t[e][s]){const t=getCategoryColor(specialCategory.error);r[0]=t.r,r[1]=t.g,r[2]=t.b,r[3]=255*t.opacity}else r[0]=255,r[1]=255,r[2]=255,r[3]=255;else{const a=getCategoryColor(t[e][s]);r[0]=a.r,r[1]=a.g,r[2]=a.b,r[3]=255*a.opacity}i.data[a]=r[0],i.data[a+1]=r[1],i.data[a+2]=r[2],i.data[a+3]=r[3]}a.putImageData(i,0,0),this._root.appendChild(e),this._overlay=e}terminate(){this.setting.render.removeItem("image"),super.terminate()}}