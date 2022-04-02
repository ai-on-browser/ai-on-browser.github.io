import Matrix from"../../lib/util/matrix.js";import LeastSquares from"../../lib/model/least_square.js";import stringToFunction from"../expression.js";import EnsembleBinaryModel from"../../lib/model/ensemble_binary.js";const combination_repetition=(t,e)=>{const n=[],a=Array(e).fill(0);for(;a[a.length-1]<t;){n.push(a.concat());for(let e=a.length-1;e>=0;e--)if(a[e]++,a[e]<t){for(let t=e+1;t<a.length;t++)a[t]=a[e];break}}return n};export class BasisFunctions{constructor(t){this._platform=t,this._f=[],this._name=Math.random().toString(32).substring(2)}get functions(){return this._f.map((t=>stringToFunction(t)))}terminate(){this._e?.remove()}apply(t){const e=t.length,n=t[0].length,a=this.functions,s=new Matrix(e,a.length+n+1);for(let i=0;i<e;i++){s.set(i,0,1);for(let e=0;e<n;e++)s.set(i,e+1,t[i][e]);for(let e=0;e<a.length;e++)s.set(i,e+n+1,a[e]({x:t[i]}))}return s}makeHtml(t){this._e?this._e.selectAll("*").remove():this._e=t.append("div").attr("id",`ls_model_${this._name}`);const e=()=>{const t=this._e.select("[name=preset]").property("value");if(this._f.length=0,n.selectAll(".ls_params").style("display","none"),"linear"===t);else if("polynomial"===t){a.style("display",null);const t=+a.select("[name=p]").property("value");if(t>1)for(let e=2;e<=t;e++){const t=combination_repetition(this._platform.datas.dimension,e);for(const e of t){const t=Array(this._platform.datas.dimension).fill(0);for(const n of e)t[n]++;let n="",a="";for(let e=0;e<t.length;e++)1===t[e]?(n+=a+`x[${e}]`,a="*"):t[e]>1&&(n+=a+`x[${e}]^${t[e]}`,a="*");this._f.push(n)}}}i()},n=this._e.append("div");n.append("span").text("preset"),n.append("select").attr("name","preset").on("change",e).selectAll("option").data(["linear","polynomial"]).enter().append("option").property("value",(t=>t)).text((t=>t));const a=n.append("span").classed("ls_params",!0);a.style("display","none"),a.append("span").text(" p "),a.append("input").attr("type","number").attr("name","p").attr("min",1).attr("max",10).attr("value",2).on("change",e);const s=this._e.append("span"),i=()=>{s.selectAll("*").remove(),s.append("span").text(" f(x) = a0");for(let t=0;t<this._platform.datas?.dimension;t++)s.append("span").text(` + a${t+1}*x[${t}]`);for(let t=0;t<this._f.length;t++)s.append("span").text(` + a${t+this._platform.datas?.dimension+1}*`),s.append("input").attr("type","text").attr("name",`expr${t}`).attr("value",this._f[t]||="x[0] ^ 2").attr("size",8).on("change",(()=>{this._f[t]=s.select(`[name=expr${t}]`).property("value")})),s.append("input").attr("type","button").attr("value","x").on("click",(()=>{this._f.splice(t,1),i()}));s.append("span").text(" "),s.append("input").attr("type","button").attr("value","+").on("click",(()=>{this._f.push(null),i()}))};i()}}var dispLeastSquares=function(t,e){"CF"===e.task&&t.append("select").attr("name","method").selectAll("option").data(["oneone","onerest"]).enter().append("option").property("value",(t=>t)).text((t=>t));const n=new BasisFunctions(e);n.makeHtml(t),t.append("input").attr("type","button").attr("value","Fit").on("click",(()=>(()=>{let a;if("CF"===e.task){const e=t.select("[name=method]").property("value");a=new EnsembleBinaryModel(LeastSquares,e)}else a=new LeastSquares;a.fit(n.apply(e.trainInput).toArray(),e.trainOutput);let s=a.predict(n.apply(e.testInput(2)).toArray());e.testResult(s)})()))};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',dispLeastSquares(t.setting.ml.configElement,t),t.setting.ml.detail="\nThe model form is\n$$\nf(X) = \\sum_{k=1}^m a_k g_k(X) + \\epsilon\n$$\n\nIn the least-squares setting, the loss function can be written as\n$$\nL(W) = \\| f(X) - y \\|^2\n$$\nwhere $ y $ is the observed value corresponding to $ X $.\nTherefore, the optimum parameter $ \\hat{a} $ is estimated as\n$$\n\\hat{a} = \\left( G^T G \\right)^{-1} G^T y\n$$\nwhere $ G_{ij} = g_i(x_j) $.\n"}