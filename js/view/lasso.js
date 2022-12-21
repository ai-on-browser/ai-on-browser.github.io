import Matrix from"../../lib/util/matrix.js";import{BasisFunctions}from"./least_square.js";import Lasso from"../../lib/model/lasso.js";import Controller from"../controller.js";var dispLasso=function(t,e){e.setting.ml.reference={title:"Lasso (Wikipedia)",url:"https://en.wikipedia.org/wiki/Lasso_(statistics)"};const n=new Controller(e);let a=null;const i=e.task,o=new BasisFunctions(e);"FS"!==i&&o.makeHtml(t),t.append("select").attr("name","method").selectAll("option").data(["CD","ISTA","LARS"]).enter().append("option").property("value",(t=>t)).text((t=>t)),t.append("span").text("lambda = "),t.append("select").attr("name","lambda").selectAll("option").data([0,1e-4,.001,.01,.1,1,10,100]).enter().append("option").property("value",(t=>t)).text((t=>t)),n.stepLoopButtons().init((()=>{a=new Lasso(+t.select("[name=lambda]").property("value"),t.select("[name=method]").property("value")),e.init()})).step((t=>{if("FS"===i){a.fit(e.trainInput,e.trainOutput);const n=a.importance().map(((t,e)=>[t,e]));n.sort(((t,e)=>e[0]-t[0]));const i=e.dimension,o=n.map((t=>t[1])).slice(0,i),s=Matrix.fromArray(e.trainInput);e.trainResult=s.col(o).toArray(),t&&t()}else{a.fit(o.apply(e.trainInput).toArray(),e.trainOutput);const n=a.predict(o.apply(e.testInput(4)).toArray());e.testResult(n),t&&t()}})).epoch()};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.',dispLasso(t.setting.ml.configElement,t),t.setting.ml.detail="\nThe model form is\n$$\nf(X) = X W + \\epsilon\n$$\n\nThe loss function can be written as\n$$\nL(W) = \\| X W - y \\|^2 + \\lambda \\| W \\|_1\n$$\nwhere $ y $ is the observed value corresponding to $ X $.\n"}