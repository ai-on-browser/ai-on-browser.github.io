import{Matrix}from"../../lib/util/math.js";import{BasisFunctions}from"./least_square.js";import{Ridge,KernelRidge}from"../../lib/model/ridge.js";import EnsembleBinaryModel from"../../lib/util/ensemble.js";var dispRidge=function(e,t){const n=t.task,a=new BasisFunctions(t);"CF"===n&&e.append("select").attr("name","method").selectAll("option").data(["oneone","onerest"]).enter().append("option").property("value",(e=>e)).text((e=>e)),"FS"!==n?(a.makeHtml(e),e.append("select").attr("name","kernel").selectAll("option").data(["no kernel","gaussian"]).enter().append("option").property("value",(e=>e)).text((e=>e))):e.append("input").attr("type","hidden").attr("name","kernel").property("value",""),e.append("span").text("lambda = "),e.append("select").attr("name","lambda").selectAll("option").data([0,1e-4,.001,.01,.1,1,10,100]).enter().append("option").property("value",(e=>e)).text((e=>e)),e.append("input").attr("type","button").attr("value","Fit").on("click",(()=>(l=>{const i=t.datas.dimension,o=e.select("[name=kernel]").property("value"),r="no kernel"===o?null:o;t.fit(((l,o,p)=>{let s;const d=+e.select("[name=lambda]").property("value");if("CF"===n){const t=e.select("[name=method]").property("value");s=r?new EnsembleBinaryModel(KernelRidge,t,null,[d,r]):new EnsembleBinaryModel(Ridge,t,null,[d])}else s=r?new KernelRidge(d,r):new Ridge(d);if("FS"===n){s.fit(l,o);const e=s.importance().map(((e,t)=>[e,t]));e.sort(((e,t)=>t[0]-e[0]));const n=t.dimension,a=e.map((e=>e[1])).slice(0,n);p(Matrix.fromArray(l).col(a).toArray())}else s.fit(a.apply(l).toArray(),o),t.predict(((e,t)=>{t(s.predict(a.apply(e)))}),r?1===i?1:10:1===i?100:4)}))})()))};export default function(e){e.setting.ml.usage='Click and add data point. Next, click "Fit" button.',dispRidge(e.setting.ml.configElement,e),e.setting.ml.detail="\nThe model form is\n$$\nf(X) = X W + \\epsilon\n$$\n\nThe loss function can be written as\n$$\nL(W) = \\| X W - y \\|^2 + \\lambda \\| W \\|^2\n$$\nwhere $ y $ is the observed value corresponding to $ X $.\nTherefore, the optimum parameter $ \\hat{W} $ is estimated as\n$$\n\\hat{W} = \\left( X^T X + \\lambda I \\right)^{-1} X^T y\n$$\n"}