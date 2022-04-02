import Matrix from"../../lib/util/matrix.js";import BayesianNetwork from"../../lib/model/bayesian_network.js";var dispQuadraticDiscriminant=function(t,a){t.append("span").text(" discrete = "),t.append("input").attr("type","number").attr("name","discrete").attr("value",10).attr("min",2).attr("max",100),t.append("input").attr("type","button").attr("value","Calculate").on("click",(e=>{let n=a.trainInput,i=a.trainOutput;const r=+t.select("[name=discrete]").property("value"),l=Matrix.fromArray(n),o=l.max(),p=l.min();n=n.map((t=>t.map((t=>Math.floor((t-p)/(o-p)*r))))),n=n.map(((t,a)=>[...t,...i[a]]));const s=new BayesianNetwork(1);s.fit(n);const m=[...new Set(i.map((t=>t[0])))];let c=a.testInput(3);c=c.map((t=>t.map((t=>Math.floor((t-p)/(o-p)*r)))));const u=[];for(let t=0;t<c.length;t++)for(let a=0;a<m.length;a++)u.push([...c[t],m[a]]);const d=s.probability(u),f=[];for(let t=0,a=0;t<d.length;a++){let e=0;f[a]=-1;for(let n=0;n<m.length;n++,t++)d[t]>e&&(e=d[t],f[a]=m[n])}a.testResult(f),e&&e()}))};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',dispQuadraticDiscriminant(t.setting.ml.configElement,t)}