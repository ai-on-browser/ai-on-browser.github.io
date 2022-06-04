import Matrix from"../../lib/util/matrix.js";import{DecisionTreeClassifier,DecisionTreeRegression}from"../../lib/model/decision_tree.js";import Controller from"../controller.js";import{getCategoryColor}from"../utils.js";class DecisionTreePlotter{constructor(t){this._platform=t,this._mode=t.task,this._svg=t.svg,this._r=null,this._lineEdge=[]}remove(){this._svg.select(".separation").remove()}plot(t){if(this._svg.select(".separation").remove(),0!==this._platform.datas.length&&(1===this._platform.datas.dimension?this._r=this._svg.insert("g").attr("class","separation"):this._r=this._svg.insert("g",":first-child").attr("class","separation").attr("opacity",.5),this._lineEdge=[],this._dispRange(t._tree),1===this._platform.datas.dimension)){const t=d3.line().x((t=>t[0])).y((t=>t[1]));this._r.append("path").attr("stroke","red").attr("fill-opacity",0).attr("d",t(this._lineEdge))}}_dispRange(t,e){if(e=e||this._platform.datas.domain,0===t.children.length){const i=this._r;let s=0,r=0;if("CF"===this._mode?t.value.forEach(((t,e)=>{t>r&&(r=t,s=e)})):s=t.value,1===this._platform.datas.dimension){const t=this._platform._renderer.toPoint([e[0][0],s]),i=this._platform._renderer.toPoint([e[0][1],s]);this._lineEdge.push(t),this._lineEdge.push(i)}else{const t=this._platform._renderer.toPoint([e[0][0],e[1][0]]),r=this._platform._renderer.toPoint([e[0][1],e[1][1]]);i.append("rect").attr("x",t[0]).attr("y",t[1]).attr("width",r[0]-t[0]).attr("height",r[1]-t[1]).attr("fill",getCategoryColor(s))}}else t.children.forEach(((i,s)=>{let r=[[].concat(e[0]),[].concat(e[1])],o=0===s?1:0;r[t.feature][o]=t.threshold,this._dispRange(i,r)}))}}export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Separate".';const e=new Controller(t),i=t.task,s=new DecisionTreePlotter(t);let r=null;const o=function(){if("FS"===t.task){const e=r.importance().map(((t,e)=>[t,e]));e.sort(((t,e)=>e[0]-t[0]));const i=t.dimension,s=e.map((t=>t[1])).slice(0,i),o=Matrix.fromArray(t.trainInput);t.trainResult=o.col(s).toArray()}else if(t.datas.dimension<=2)s.plot(r);else{let e=r.predict(t.testInput(2));t.testResult(e)}t.evaluate(((t,e)=>{e(r.predict(t))}))},a="CF"===i?["CART","ID3"]:["CART"],n=e.select(a);e.input.button("Initialize").on("click",(()=>{r="CF"===i?new DecisionTreeClassifier(n.value):new DecisionTreeRegression,r.init(t.trainInput,t.trainOutput.map((t=>t[0]))),o(),l.value=r.depth})),e.input.button("Separate").on("click",(()=>{r&&(r.fit(),o(),l.value=r.depth)}));const l=e.text("0");e.text(" depth "),t.setting.terminate=()=>{s.remove()}}