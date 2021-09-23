import FittingMode from"../fitting.js";import ManualData from"../data/manual.js";export class BasePlatform{constructor(t,s){this._manager=s,this._task=t}get task(){return this._task}get setting(){return this._manager.setting}get svg(){return this._manager.setting.svg}get width(){return this._width||(this._width=d3.select("#plot-area svg").node().getBoundingClientRect().width),this._width}set width(t){d3.select("#plot-area").style("width",t-2+"px"),this._width=null}get height(){return this._height||(this._height=d3.select("#plot-area svg").node().getBoundingClientRect().height),this._height}set height(t){d3.select("#plot-area").style("height",t-2+"px"),this._height=null}get datas(){return this._manager._datas}get params(){return{}}set params(t){}terminate(){}}export class DefaultPlatform extends BasePlatform{constructor(t,s){super(t,s);const e=this.setting.task.configElement;"DR"!==this._task&&"FS"!==this._task||(e.append("span").text("Target dimension"),e.append("input").attr("type","number").attr("min",1).attr("max",2).attr("value",2).attr("name","dimension"))}get dimension(){const t=this.setting.task.configElement.select("[name=dimension]");return t.node()?+t.property("value"):null}fit(t){const s="RG"===this._task?FittingMode.RG(this.setting.dimension):FittingMode[this._task];return this._cur_dimension!==this.setting.dimension&&this.init(),s.fit(this._r_task,this.datas,t)}predict(t,s=10){const[e,i]=this.datas._renderer.predict(s);"CF"!==this._task&&"RG"!==this._task||e.push(...this.datas.x),t(e,(t=>{if("AD"===this._task&&(t=t.map((t=>t?specialCategory.error:specialCategory.errorRate(0)))),"CF"===this._task||"RG"===this._task){const s=t.slice(e.length-this.datas.length),i=this.datas.y;if(t=t.slice(0,e.length-this.datas.length),"CF"===this._task){let t=0;for(let e=0;e<i.length;e++)i[e]===s[e]&&t++;this.setting.footer.text("Accuracy:"+t/i.length)}else if("RG"===this._task){let t=0;for(let e=0;e<i.length;e++)t+=(i[e]-s[e])**2;this.setting.footer.text("RMSE:"+Math.sqrt(t/i.length))}}i(t,this._r_tile)}))}evaluate(t){"CF"!==this._task&&"RG"!==this._task||t(this.datas.x,(t=>{const s=this.datas.y;if("CF"===this._task){let e=0;for(let i=0;i<s.length;i++)s[i]===t[i]&&e++;this.setting.footer.text("Accuracy:"+e/s.length)}else if("RG"===this._task){let e=0;for(let i=0;i<s.length;i++)e+=(s[i]-t[i])**2;this.setting.footer.text("RMSE:"+Math.sqrt(e/s.length))}}))}init(){this._r&&this._r.remove(),this._cur_dimension=this.setting.dimension;const t=1===this.datas?.dimension&&("RG"===this._task||"IN"===this._task);this._r=t?this.svg.append("g"):this.svg.insert("g",":first-child"),this._r.classed("default-render",!0),this._r_task=this._r.append("g").classed("tasked-render",!0),this._r_tile=this._r.append("g").classed("tile-render",!0).attr("opacity",t?1:.5),this.setting.footer.text(""),this.svg.select("g.centroids").remove(),this.render()}render(){this.datas&&this.datas._renderer.render()}centroids(t,s,{line:e=!1,duration:i=0}={}){let a=this.svg.select("g.centroids");0===a.size()&&(a=this.svg.append("g").classed("centroids",!0),a.append("g").classed("c-line",!0),this._centroids_line=[],this._centroids=null);const r=[];this._centroids&&this._centroids.forEach((t=>{Array.isArray(s)&&s.indexOf(t.category)<0?t.remove():r.push(t)}));const n=this.datas._renderer.points;for(let t=0;t<n.length;t++)this._centroids_line[t]?._from===n[t]&&e||(this._centroids_line[t]?.remove(),this._centroids_line[t]=null);this._centroids=t.map(((t,i)=>{let n=Array.isArray(s)?r.find((t=>t.category===s[i])):r[i];if(n||(n=new DataPoint(a,t.map((t=>t/this.datas.scale)),Array.isArray(s)?s[i]:s),n.plotter(DataPointStarPlotter)),e){const t=this.datas._renderer.points,e=this.datas.y;for(let r=0;r<t.length;r++)e[r]===s[i]&&(this._centroids_line[r]?this._centroids_line[r].to=n:this._centroids_line[r]=new DataLine(a.select(".c-line"),t[r],n))}return n})),Promise.resolve().then((()=>{this._centroids.forEach(((s,e)=>{s.move(t[e].map((t=>t/this.datas.scale)),i)}))}))}terminate(){this._r&&this._r.remove(),this.svg.select("g.centroids").remove(),this.svg.selectAll("g").style("visibility",null);this.setting.task.configElement.selectAll("*").remove(),this.setting.footer.text("")}}const loadedPlatform={"":DefaultPlatform},loadedData={manual:ManualData},loadedModel={};export default class AIManager{constructor(t){this._setting=t,this._platform=new DefaultPlatform(null,this),this._task="",this._datas=new ManualData(this),this._dataset="manual",this._modelname="",this._listener=[]}get platform(){return this._platform}get task(){return this._task}get setting(){return this._setting}get datas(){return this._datas}waitReady(t){if(this._platform&&this._datas)return t();this._listener.push(t)}resolveListeners(){for(const t of this._listener)t();this._listener=[]}resolveListenersIfCan(){this._platform&&this._datas&&this.resolveListeners()}setTask(t,s){if(!this._platform)return void(s&&s());if(this._task===t)return this._platform.init(),void(s&&s());this._platform.terminate(),this._platform=null,this._task=t;let e="";"MD"===this._task||"GM"===this._task?e="./rl.js":"TP"===this._task||"SM"===this._task||"CP"===this._task?e="./series.js":"SG"===this._task||"DN"===this._task||"ED"===this._task?e="./image.js":"WE"===this._task?e="./document.js":"SC"===this._task&&(e="./semisupervised.js");const i=e=>{"MD"!==t&&"GM"!==t?(this._platform=new e(t,this),this._platform.init(),this.resolveListenersIfCan(),s&&s()):new e(t,this,(t=>{this._platform=t,this._platform.init(),this._setting.ml.modelName||t.render(),this.resolveListenersIfCan(),s&&s()}))};loadedPlatform[e]?i(loadedPlatform[e]):import(e).then((t=>{loadedPlatform[e]=t.default,i(t.default)}))}setData(t,s){this._datas.terminate(),this._datas=null,this._dataset=t,loadedData[this._dataset]?(this._datas=new loadedData[this._dataset](this),this._platform&&this._platform.init(),this.resolveListenersIfCan(),s&&s()):import(`../data/${t}.js`).then((e=>{this._datas=new e.default(this),this._platform&&this._platform.init(),this.resolveListenersIfCan(),s&&s(),loadedData[t]=e.default}))}setModel(t,s){if(this._modelname=t,loadedModel[t])try{loadedModel[t](this.platform),s?.()}catch(t){console.error(t),s?.(t)}else import(`../view/${t}.js`).then((e=>{loadedModel[t]=e.default;try{e.default(this.platform),s?.()}catch(t){console.error(t),s?.(t)}}))}}