var $=Object.defineProperty;var o=(e,s)=>$(e,"name",{value:s,configurable:!0});import{KMeans as k,KMeanspp as S,KMedians as p,KMedoids as _,SemiSupervisedKMeansModel as h}from"../../lib/model/kmeans.js";import m from"../controller.js";export default function g(e){e.task!=="SC"?e.setting.ml.usage='Click and add data point. Next, select "k-means", "k-means++", "k-medoids" or "k-medians" and click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.':e.setting.ml.usage='Click and add data point. Then, click "Step" button repeatedly.',e.setting.ml.detail=`
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
`;const s=new m(e);let i=e.task==="SC"?new h:new k;const r=o(()=>{if(e.init(),e.task!=="SC")i.clear(),a.value=`${i.size} clusters`;else{i.init(e.trainInput,e.trainOutput.map(t=>t[0]));const n=i.predict(e.trainInput);e.trainResult=n,e.centroids(i.centroids,i.categories,{line:!0})}},"init"),l=s.stepLoopButtons().init(r);let a=null;if(e.task!=="SC"){const n={"k-means":k,"k-means++":S,"k-medoids":_,"k-medians":p},t=s.select(["k-means","k-means++","k-medoids","k-medians"]).on("change",()=>{i=new n[t.value],r()});s.input.button("Add centroid").on("click",()=>{i.add(e.trainInput);const d=i.predict(e.trainInput);e.trainResult=d.map(c=>c+1),e.centroids(i.centroids,i.centroids.map((c,u)=>u+1),{line:!0}),a.value=`${i.size} clusters`}),a=s.text("0 clusters")}l.step(async()=>{if(i.size===0)return;i.fit(e.trainInput,e.trainOutput.map(t=>t[0]));const n=i.predict(e.trainInput);e.trainResult=e.task!=="SC"?n.map(t=>t+1):n,e.centroids(i.centroids,e.task!=="SC"?i.centroids.map((t,d)=>d+1):i.categories,{line:!0,duration:1e3}),await new Promise(t=>setTimeout(t,1e3))}),s.input.button("Skip").on("click",()=>{const n=e.trainInput;let t=e.trainOutput;for(t=t.map(c=>c[0]);i.fit(n,t)>1e-8;);const d=i.predict(n);e.trainResult=e.task!=="SC"?d.map(c=>c+1):d,e.centroids(i.centroids,e.task!=="SC"?i.centroids.map((c,u)=>u+1):i.categories,{line:!0,duration:1e3})}),l.enable=e.task!=="SC"}o(g,"default");
