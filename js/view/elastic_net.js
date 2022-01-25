import Matrix from"../../lib/util/matrix.js";import{BasisFunctions}from"./least_square.js";import ElasticNet from"../../lib/model/elastic_net.js";var dispElasticNet=function(t,e){let a=new ElasticNet;const n=e.task,l=new BasisFunctions(e);"FS"!==n&&l.makeHtml(t),t.append("span").text("lambda = "),t.append("select").attr("name","lambda").selectAll("option").data([1e-4,.001,.01,.1,1,10,100]).enter().append("option").property("value",(t=>t)).text((t=>t)),t.append("span").text("alpha = "),t.append("input").attr("type","number").attr("name","alpha").attr("value",.5).attr("min",0).attr("max",1).attr("step",.1).on("change",(function(){let e=+d3.select(this).property("value");t.select("[name=sp]").text(0===e?" ridge ":1===e?" lasso ":"")})),t.append("span").attr("name","sp"),e.setting.ml.controller.stepLoopButtons().init((()=>{a=new ElasticNet(+t.select("[name=lambda]").property("value"),+t.select("[name=alpha]").property("value")),e.init()})).step((i=>{e.fit(((p,s,r)=>{if(a._alpha=+t.select("[name=alpha]").property("value"),"FS"===n){a.fit(p,s);const t=a.importance().map(((t,e)=>[t,e]));t.sort(((t,e)=>e[0]-t[0]));const n=e.dimension,l=t.map((t=>t[1])).slice(0,n);r(Matrix.fromArray(p).col(l).toArray()),i&&i()}else a.fit(l.apply(p).toArray(),s),e.predict(((t,e)=>{e(a.predict(l.apply(t).toArray())),i&&i()}),4)}))})).epoch()};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.',dispElasticNet(t.setting.ml.configElement,t),t.setting.ml.detail="\nThe model form is\n$$\nf(X) = X W + \\epsilon\n$$\n\nThe loss function can be written as\n$$\nL(W) = \\| X W - y \\|^2 + \\alpha \\lambda \\| W \\|_1 + (1 - \\alpha) \\lambda \\| W \\|^2\n$$\nwhere $ y $ is the observed value corresponding to $ X $.\n"}