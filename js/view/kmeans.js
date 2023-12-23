var $=Object.defineProperty;var o=(e,c)=>$(e,"name",{value:c,configurable:!0});import{KMeans as k,KMeanspp as S,KMedoids as p,KMedians as _,SemiSupervisedKMeansModel as h}from"../../lib/model/kmeans.js";import m from"../controller.js";export default function g(e){e.task!=="SC"?e.setting.ml.usage='Click and add data point. Next, select "k-means", "k-means++", "k-medoids" or "k-medians" and click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.':e.setting.ml.usage='Click and add data point. Then, click "Step" button repeatedly.',e.setting.ml.detail=`
$ S_i $ as a set of datas in $ i $th cluster, the objective is to find
$$
  \\argmin_S \\sum_{i=1}^k \\sum_{x \\in S_i} \\| x - \\mu_i \\|^2
$$
where $ \\mu_i $ is the mean of points in $ S_i $.
<br>
The algorithm is simple.
<ol>
<li>Initialize $ \\mu_i $.</li>
<li>Assign the datas to the cluster $ S_i $ with the nearest mean $ \\mu_i $.</li>
<li>Update $ \\mu_i $.
$$
\\mu_i = \\frac{1}{|S_i|} \\sum_{x \\in S_i} x
$$
</li>
<li>Finish if $ \\mu_i $ does not change. Otherwise, go back to step 2.</li>
</ol>
`;const c=new m(e);let i=e.task==="SC"?new h:new k;const r=o(()=>{if(e.init(),e.task!=="SC")i.clear(),a.value=i.size+" clusters";else{i.init(e.trainInput,e.trainOutput.map(n=>n[0]));const t=i.predict(e.trainInput);e.trainResult=t,e.centroids(i.centroids,i.categories,{line:!0})}},"init"),l=c.stepLoopButtons().init(r);let a=null;if(e.task!=="SC"){const t={"k-means":k,"k-means++":S,"k-medoids":p,"k-medians":_},n=c.select(["k-means","k-means++","k-medoids","k-medians"]).on("change",()=>{i=new t[n.value],r()});c.input.button("Add centroid").on("click",()=>{i.add(e.trainInput);const s=i.predict(e.trainInput);e.trainResult=s.map(d=>d+1),e.centroids(i.centroids,i.centroids.map((d,u)=>u+1),{line:!0}),a.value=i.size+" clusters"}),a=c.text("0 clusters")}l.step(t=>{if(i.size===0){t&&t();return}i.fit(e.trainInput,e.trainOutput.map(s=>s[0]));const n=i.predict(e.trainInput);e.trainResult=e.task!=="SC"?n.map(s=>s+1):n,e.centroids(i.centroids,e.task!=="SC"?i.centroids.map((s,d)=>d+1):i.categories,{line:!0,duration:1e3}),t&&setTimeout(t,1e3)}),c.input.button("Skip").on("click",()=>{const t=e.trainInput;let n=e.trainOutput;for(n=n.map(d=>d[0]);i.fit(t,n)>1e-8;);const s=i.predict(t);e.trainResult=e.task!=="SC"?s.map(d=>d+1):s,e.centroids(i.centroids,e.task!=="SC"?i.centroids.map((d,u)=>u+1):i.categories,{line:!0,duration:1e3})}),l.enable=e.task!=="SC"}o(g,"default");
