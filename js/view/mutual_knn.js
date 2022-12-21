import MutualKNN from"../../lib/model/mutual_knn.js";import Controller from"../controller.js";export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Fit" button.',t.setting.ml.reference={author:"M. R. Brito, E. Chavez, A. J. Quiroz, J. E. Yukich",title:"Connectivity of the mutual k-nearest-neighbor graph in clustering and outlier detection",year:1997};const e=new Controller(t),n=e.input.number({label:"k",min:1,max:100,value:10});e.input.button("Fit").on("click",(()=>{const e=new MutualKNN(n.value);e.fit(t.trainInput);const l=e.predict();t.trainResult=l.map((t=>t+1)),i.value=e.size}));const i=e.text({label:" Clusters: "})}