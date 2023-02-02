import ProbabilisticPCA from"../../lib/model/probabilistic_pca.js";import Controller from"../controller.js";var dispPPCA=function(t,e){e.setting.ml.reference={author:"M. E. Tipping, C. M. Bishop",title:"Probabilistic principal component analysis",year:1999};const i=new Controller(e);let n=null;t.append("select").attr("name","method").selectAll("option").data(["analysis","em","bayes"]).enter().append("option").attr("value",(t=>t)).text((t=>t)),i.stepLoopButtons().init((()=>{n=null,e.init()})).step((()=>{if(!n){const i=e.dimension,o=t.select("[name=method]").property("value");n=new ProbabilisticPCA(o,i)}n.fit(e.trainInput);const i=n.predict(e.trainInput);e.trainResult=i})).epoch()};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',dispPPCA(t.setting.ml.configElement,t)}