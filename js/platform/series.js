import{BasePlatform}from"./base.js";class TpPlotter{constructor(t,e){this._platform=t,0===e.select("g.tp-render").size()&&e.append("g").classed("tp-render",!0),this._r=e.select("g.tp-render"),this._r.append("path").attr("stroke","black").attr("fill-opacity",0).style("pointer-events","none"),this._pred=[],this._points=[]}remove(){this._r.remove()}reset(){this._points.forEach((t=>t.remove())),this._points=[],this._r.select("path").attr("opacity",0)}fit(t,e,s,r){s(t.map((t=>[t[t.length-1]])),e,(t=>{this._pred=t,r()}))}plot(t){const e=d3.line().x((t=>t[0])).y((t=>t[1]));this._points.forEach((t=>t.remove())),this._points=[];const s=this._platform.datas;this._platform._renderer._pred_count=this._pred.length;const r=[];s.length>0&&r.push(t([s.length-1,s.series.values[s.length-1]]));for(let e=0;e<this._pred.length;e++){const i=t([e+s.length,this._pred[e]]),h=new DataPoint(this._r,i,specialCategory.dummy);r.push(i),this._points.push(h)}0===r.length?this._r.select("path").attr("opacity",0):this._r.select("path").attr("d",e(r)).attr("opacity",.5)}}class SmoothPlotter{constructor(t,e){this._platform=t,0===e.select("g.smooth-render").size()&&e.append("g").classed("smooth-render",!0),this._r=e.select("g.smooth-render"),this._r.append("path").attr("stroke","red").attr("fill-opacity",0).style("pointer-events","none"),this._pred=[]}remove(){this._r.remove()}fit(t,e,s,r){s(t,e,(t=>{this._pred=t,r()}))}plot(t){const e=d3.line().x((t=>t[0])).y((t=>t[1])),s=[];for(let e=0;e<this._pred.length;e++){const r=t([e,this._pred[e]]);s.push(r)}0===s.length?this._r.select("path").attr("opacity",0):this._r.select("path").attr("d",e(s)).attr("opacity",1)}}class CpdPlotter{constructor(t,e){this._platform=t,0===e.select("g.cpd-render").size()&&e.insert("g",":first-child").classed("cpd-render",!0),this._r=e.select("g.cpd-render"),this._pred=[]}remove(){this._r.remove()}fit(t,e,s,r){t.rolling=e=>{const s=[];for(let r=0;r<t.length-e+1;r++)s.push([].concat(...t.slice(r,r+e)));return s},s(t,e,((t,e)=>{e?(this._pred=t.map((t=>t>e)),this._pred_value=t.concat()):(this._pred=t.concat(),this._pred_value=null),r()}),(t=>{this._pred_value&&(this._pred=this._pred_value.map((e=>e>t)),r())}))}plot(t){if(this._r.selectAll("*").remove(),this._pred_value){let e=Math.max(...this._pred_value);const s=Math.min(...this._pred_value);e===s&&(e+=1);const r=document.createElement("canvas");r.width=this._platform.width,r.height=this._platform.height;const i=r.getContext("2d");let h=0;for(let r=0;r<this._pred_value.length;r++){const a=t([r+.5,[0]])[0],l=(this._pred_value[r]-s)/(e-s);i.fillStyle=getCategoryColor(specialCategory.errorRate(l)),i.fillRect(h,0,a-h+1,this._platform.height),h=a}this._r.append("image").attr("x",0).attr("y",0).attr("width",r.width).attr("height",r.height).attr("xlink:href",r.toDataURL()).attr("opacity",.3)}for(let e=0;e<this._pred.length;e++){if(!this._pred[e])continue;const s=t([e,[0]])[0];this._r.append("line").attr("x1",s).attr("x2",s).attr("y1",0).attr("y2",this._platform.height).attr("stroke","red")}}}export default class SeriesPlatform extends BasePlatform{constructor(t,e){super(t,e)}init(){0===this.svg.select("g.ts-render").size()&&("SM"===this._task?this.svg.append("g").classed("ts-render",!0):this.svg.insert("g",":first-child").classed("ts-render",!0),this.svg.insert("g",":first-child").classed("ts-render-path",!0)),this._r=this.svg.select("g.ts-render"),this._r.selectAll("*").remove(),this.svg.selectAll("g.ts-render-path *").remove(),this._path=this.svg.select("g.ts-render-path").append("path").attr("stroke","black").attr("fill-opacity",0).style("pointer-events","none"),"TP"===this._task?this._plotter=new TpPlotter(this,this._r):"SM"===this._task?this._plotter=new SmoothPlotter(this,this._r):"CP"===this._task&&(this._plotter=new CpdPlotter(this,this._r)),this.datas&&(this.datas.clip=!1,this._renderer._pred_count=0,this.render())}render(){this.datas&&(this._renderer.render(),this._plotter.plot(this._renderer.toPoint.bind(this._renderer)),Promise.resolve().then((()=>{if(this.datas){const t=d3.line().x((t=>t[0])).y((t=>t[1]));this._path.attr("d",t(this._renderer.points.map((t=>t.at)))).attr("opacity",.5)}})))}fit(t){let e=this.datas.series.values;this._plotter.fit(e,this.datas.y,t,(()=>{this.render()}))}terminate(){this.datas&&(this.datas.clip=!0),this._r.remove(),this.svg.select("g.ts-render-path").remove(),super.terminate()}}