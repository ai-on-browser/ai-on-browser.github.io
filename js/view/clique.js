import CLIQUE from"../../lib/model/clique.js";import Controller from"../controller.js";export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Fit" button.',t.setting.ml.reference={author:"R. Agrawal, J. Gehrke, D. Gunopulos, P. Raghavan",title:"Automatic subspace clustering of high dimensional data for data mining applications",year:1998};const e=new Controller(t),n=e.input.number({label:"step",min:0,max:100,step:.1,value:.2}),a=e.input.number({label:"threshold",min:0,max:1,step:.01,value:.1});e.input.button("Fit").on("click",(()=>{const e=new CLIQUE(Array(t.datas.dimension).fill(n.value),a.value);e.fit(t.trainInput);const l=e.predict(t.trainInput);t.trainResult=l.map((t=>t+1));const o=e.predict(t.testInput(4));t.testResult(o.map((t=>t<0?-1:t+1))),i.value=e.size}));const i=e.text({label:" Clusters: "})}