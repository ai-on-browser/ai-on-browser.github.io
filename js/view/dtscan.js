var c=Object.defineProperty;var i=(e,n)=>c(e,"name",{value:n,configurable:!0});import r from"../../lib/model/dtscan.js";import d from"../controller.js";export default function m(e){e.setting.ml.usage='Click and add data point. Then, click "Fit" button.',e.setting.ml.reference={author:"J. Kim, J. Cho",title:"Delaunay Triangulation-Based Spatial Clustering Technique for Enhanced Adjacent Boundary Detection and Segmentation of LiDAR 3D Point Clouds",year:2019};const n=new d(e),t=i(()=>{const o=new r(a.value,l.value).predict(e.trainInput);e.trainResult=o.map(s=>s+1),u.value=new Set(o).size},"fitModel"),a=n.input.number({label:"min pts",min:2,max:1e3,value:5}).on("change",t),l=n.input.number({label:"threshold",min:0,max:10,step:.1,value:1}).on("change",t);n.input.button("Fit").on("click",t);const u=n.text({label:" Clusters: "})}i(m,"default");
