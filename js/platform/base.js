import ScatterRenderer from"../renderer/scatter.js";import LinePlotter from"../renderer/util/lineplot.js";import{DataPointStarPlotter,specialCategory,DataPoint,DataLine}from"../utils.js";import TableRenderer from"../renderer/table.js";export class BasePlatform{constructor(t,e){this._manager=e,this._renderer=new ScatterRenderer(e)}get task(){return this._manager.task}get setting(){return this._manager.setting}get svg(){return this._renderer.svg}get width(){return this._renderer.width}set width(t){this._renderer.width=t}get height(){return this._renderer.height}set height(t){this._renderer.height=t}get datas(){return this._manager._datas}get params(){return{}}set params(t){}get trainInput(){return null}get trainOutput(){return null}testInput(){return null}init(){}terminate(){this._renderer.terminate()}}export class DefaultPlatform extends BasePlatform{constructor(t,e){super(t,e),this._tablerenderer=new TableRenderer(e);const s=this.setting.task.configElement;if("DR"===this.task||"FS"===this.task){s.appendChild(document.createTextNode("Target dimension"));const t=document.createElement("input");t.type="number",t.min=1,t.max=2,t.value=2,t.name="dimension",s.appendChild(t)}}get dimension(){const t=this.setting.task.configElement.querySelector("[name=dimension]");return t?+t.value:null}get trainInput(){return this.datas.dimension>0?this.datas.x:this.datas.index.map(((t,e)=>[isNaN(t)?e:t]))}get trainOutput(){return this.datas.y.map((t=>[t]))}set trainResult(t){if("CT"===this.task)t.forEach(((t,e)=>{this.datas.y[e]=t})),this.render();else if("AD"===this.task)this._renderer.trainResult=t,this._tablerenderer.trainResult=t;else{if("DR"!==this.task&&"FS"!==this.task&&"TF"!==this.task&&"GR"!==this.task)throw new Error(`Invalid task ${this.task}`);this._renderer.trainResult=t}}testInput(t=10){const e=this._renderer.testData(t);return"CF"!==this.task&&"RG"!==this.task||e.push(...this.datas.dimension>0?this.datas.x:this.datas.index.map(((t,e)=>[isNaN(t)?e:t]))),e}testResult(t){if("AD"===this.task&&(t=t.map((t=>t?specialCategory.error:specialCategory.errorRate(0)))),"CF"===this.task||"RG"===this.task){const e=t.slice(t.length-this.datas.length),s=this.datas.y;if(t=t.slice(0,t.length-this.datas.length),"CF"===this.task){let t=0;for(let r=0;r<s.length;r++)s[r]===e[r]&&t++;this._getEvaluateElm().innerText="Accuracy:"+t/s.length}else if("RG"===this.task){let t=0;for(let r=0;r<s.length;r++)t+=(s[r]-e[r])**2;this._getEvaluateElm().innerText="RMSE:"+Math.sqrt(t/s.length)}this._tablerenderer.trainResult=e}this._renderer.testResult(t)}evaluate(t){"CF"!==this.task&&"RG"!==this.task||t(this.datas.x,(t=>{const e=this.datas.y;if("CF"===this.task){let s=0;for(let r=0;r<e.length;r++)e[r]===t[r]&&s++;this._getEvaluateElm().innerText="Accuracy:"+s/e.length}else if("RG"===this.task){let s=0;for(let r=0;r<e.length;r++)s+=(e[r]-t[r])**2;this._getEvaluateElm().innerText="RMSE:"+Math.sqrt(s/e.length)}}))}init(){this._cur_dimension=this.setting.dimension,this.setting.footer.innerText="",this.svg.select("g.centroids").remove(),this._renderer.init(),this._tablerenderer.init(),this.render(),this._loss&&(this._loss.terminate(),this._loss=null,this.setting.footer.replaceChildren())}render(){this._renderer.render(),this._tablerenderer.render()}centroids(t,e,{line:s=!1,duration:r=0}={}){let i=this.svg.select("g.centroids");0===i.size()&&(i=this.svg.append("g").classed("centroids",!0),i.append("g").classed("c-line",!0),this._centroids_line=[],this._centroids=null);const n=[];this._centroids&&this._centroids.forEach((t=>{Array.isArray(e)&&e.indexOf(t.category)<0?t.remove():n.push(t)}));const a=this._renderer.points;for(let t=0;t<a.length;t++)this._centroids_line[t]?._from===a[t]&&s||(this._centroids_line[t]?.remove(),this._centroids_line[t]=null);this._centroids=t.map(((t,r)=>{let a=Array.isArray(e)?n.find((t=>t.category===e[r])):n[r];if(a||(a=new DataPoint(i,this._renderer.toPoint(t),Array.isArray(e)?e[r]:e),a.plotter(DataPointStarPlotter)),s){const t=this._renderer.points,s=this.datas.y;for(let n=0;n<t.length;n++)s[n]===e[r]&&(this._centroids_line[n]?this._centroids_line[n].to=a:this._centroids_line[n]=new DataLine(i.select(".c-line"),t[n],a))}return a})),Promise.resolve().then((()=>{this._centroids.forEach(((e,s)=>{e.move(this._renderer.toPoint(t[s]),r)}))}))}_getEvaluateElm(){if(this._loss){const t=this.setting.footer.querySelector("div.evaluate_result");if(!t){const t=document.createElement("div");return t.classList.add("evaluate_result"),this.setting.footer.insertBefore(t,this.setting.footer.firstChild),t}return t}return this.setting.footer}plotLoss(t){if(!this._loss){const t=this.setting.footer.innerText;this.setting.footer.innerText="",this._loss=new LinePlotter(this.setting.footer),this._getEvaluateElm().innerText=t}this._loss.add(t)}terminate(){this.setting.task.configElement.replaceChildren(),this.setting.footer.innerText="",super.terminate(),this._tablerenderer.terminate()}}