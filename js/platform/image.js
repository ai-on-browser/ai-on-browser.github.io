import{BasePlatform}from"./base.js";import ImageData from"../data/image.js";export default class ImagePlatform extends BasePlatform{constructor(t,e){super(t,e),this._reduce_algorithm="mean",this._color_space="rgb",this._normalize=!1,this._org_width=null,this._org_height=null,this._binary_threshold=180;const a=this.setting.task.configElement;a.append("span").text("Color space");const s=a.append("select").attr("name","space").on("change",(()=>{this._color_space=s.property("value"),r.style("display","binary"===this._color_space?null:"none"),this.render()}));s.selectAll("option").data(Object.keys(ImageData.colorSpaces).map((t=>ImageData.colorSpaces[t]))).enter().append("option").property("value",(t=>t)).text((t=>t));const r=a.append("input").attr("name","threshold").attr("type","number").attr("min",0).attr("max",255).attr("value",this._binary_threshold).style("display","none").on("change",(()=>{this._binary_threshold=r.property("value"),this.render()}))}set colorSpace(t){this._color_space=t,this.setting.task.configElement.select("[name=space]").property("value",t),this.setting.task.configElement.select("[name=threshold]").style("display","binary"===this._color_space?null:"none"),this.render()}init(){0===this.svg.select("g.im-render").size()&&this.svg.append("g").classed("im-render",!0).style("transform","scale(1, -1) translate(0, -100%)"),this._r=this.svg.select("g.im-render"),this._r.selectAll("*").remove(),this.render()}render(){let t=this._r.select("g.target-image");if(0===t.size()&&(t=this._r.insert("g",":first-child").classed("target-image",!0)),!(this.datas&&this.datas.x&&Array.isArray(this.datas.x[0])&&Array.isArray(this.datas.x[0][0])))return;const e=this.datas.x[0],a=this.datas._applySpace(e,this._color_space,this._normalize,this._binary_threshold),s=a[0][0].length,r=document.createElement("canvas");r.width=e[0].length,r.height=e.length;const i=r.getContext("2d"),h=i.createImageData(r.width,r.height);for(let t=0,e=0;t<r.height;t++)for(let i=0;i<r.width;i++,e+=4)h.data[e]=a[t][i][0],1===s?(h.data[e+1]=a[t][i][0],h.data[e+2]=a[t][i][0],h.data[e+3]=255):3===s?(h.data[e+1]=a[t][i][1],h.data[e+2]=a[t][i][2],h.data[e+3]=255):(h.data[e+1]=a[t][i][1],h.data[e+2]=a[t][i][2],h.data[e+3]=a[t][i][3]);i.putImageData(h,0,0),t.selectAll("*").remove(),t.append("image").attr("x",0).attr("y",0).attr("width",r.width).attr("height",r.height).attr("xlink:href",r.toDataURL()),this._org_width||(this._org_width=this._manager.platform.width,this._org_height=this._manager.platform.height),this._manager.platform.width=r.width,this._manager.platform.height=r.height}fit(t,e=8){const a=this.datas.x[0],s=this.datas._applySpace(this.datas._reduce(a,e,this._reduce_algorithm),this._color_space,this._normalize,this._binary_threshold);t(s,null,(t=>{this._pred=t,this._displayResult(s,t,e)}))}predict(t,e=8){const a=this.datas.x[0],s=this.datas._reduce(a,e,this._reduce_algorithm);if("DN"===this.task)for(let t=0;t<s.length;t++)for(let e=0;e<s[t].length;e++)for(let a=0;a<s[t][e].length;a++)s[t][e][a]=Math.max(0,Math.min(255,s[t][e][a]+Math.floor(510*Math.random()-255)));const r=this.datas._applySpace(s,this._color_space,this._normalize,this._binary_threshold);t(r,(t=>{if(!Array.isArray(t[0])){const e=[];for(let a=0;a<t.length;a+=r[0][0].length){const s=[];for(let e=0;e<r[0][0].length;e++)s.push(t[a+e]);e.push(s)}t=e}this._pred=t,this._displayResult(s,t,e)}))}_displayResult(t,e,a){let s=this._r.select("g.predict-img");0===s.size()&&(s=this._r.append("g").attr("opacity",.5).classed("predict-img",!0)),s.selectAll("*").remove();const r=document.createElement("canvas");r.width=this.width,r.height=this.height;const i=r.getContext("2d"),h=i.createImageData(r.width,r.height);for(let s=0,i=0;s<t.length;s++)for(let l=0;l<t[s].length;l++,i++){const t=[0,0,0,0];if(Array.isArray(e[i]))t[0]=e[i][0],t[3]=255,1===e[i].length?(t[1]=e[i][0],t[2]=e[i][0]):(t[1]=e[i][1],t[2]=e[i][2]);else if(!0===e[i]||!1===e[i])if(e[i]){const e=getCategoryColor(specialCategory.error);t[0]=e.r,t[1]=e.g,t[2]=e.b,t[3]=255*e.opacity}else t[0]=255,t[1]=255,t[2]=255,t[3]=255;else{const a=getCategoryColor(e[i]);t[0]=a.r,t[1]=a.g,t[2]=a.b,t[3]=255*a.opacity}for(let e=0;e<a;e++)for(let i=0;i<a;i++){const o=4*((s*a+e)*r.width+l*a+i);h.data[o]=t[0],h.data[o+1]=t[1],h.data[o+2]=t[2],h.data[o+3]=t[3]}}i.putImageData(h,0,0),s.append("image").attr("x",0).attr("y",0).attr("width",r.width).attr("height",r.height).attr("xlink:href",r.toDataURL())}terminate(){this._r.remove(),this.setting.task.configElement.selectAll("*").remove(),this._org_width&&(this._manager.platform.width=this._org_width,this._manager.platform.height=this._org_height),super.terminate()}}