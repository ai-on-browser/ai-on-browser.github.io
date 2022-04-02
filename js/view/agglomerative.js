import{CompleteLinkageAgglomerativeClustering,SingleLinkageAgglomerativeClustering,GroupAverageAgglomerativeClustering,WardsAgglomerativeClustering,CentroidAgglomerativeClustering,WeightedAverageAgglomerativeClustering,MedianAgglomerativeClustering}from"../../lib/model/agglomerative.js";const argmin=function(e,t){return 0===e.length?-1:(e=t?e.map(t):e).indexOf(Math.min(...e))},argmax=function(e,t){return 0===e.length?-1:(e=t?e.map(t):e).indexOf(Math.max(...e))};var dispAgglomerative=function(e,t){const a=t.svg,l=d3.line().x((e=>e[0])).y((e=>e[1]));let n=null,r=null,i=null;a.insert("g",":first-child").attr("class","grouping");const s=n=>{let i=[];const s=e.select("[name=clusternumber]").property("value");let o=1;r.getClusters(s).forEach((e=>{if(e.leafCount()>1){let a=[];e.scan((e=>{e.leafCount()>1?(e.value.line||(e.value.line=n(e.at(0),e.at(1))),a=a.concat(e.value.line)):e.isLeaf()&&(t.datas.at(e.value.index).y=o)})),a=a.map((e=>({path:e.map((e=>t._renderer.toPoint(e))),color:getCategoryColor(o)}))),i=i.concat(a)}else t.datas.at(e.value.index).y=o;o+=e.leafCount()})),a.selectAll(".grouping path").remove(),a.select(".grouping").selectAll("path").data(i).enter().append("path").attr("d",(e=>l(e.path))).attr("stroke",(e=>e.color))},o=function(){a.selectAll(".grouping polygon").remove();const l=e.select("[name=clusternumber]").property("value");let n=1;r.getClusters(l).forEach((e=>{e.leafCount()>1?(e.scan((e=>{e.value.poly?e.value.poly.remove():e.isLeaf()&&(t.datas.at(e.value.index).y=n)})),Promise.resolve().then((()=>{e.value.poly=new DataConvexHull(a.select(".grouping"),e.leafs().map((e=>t.datas.points[e.value.index])))}))):t.datas.at(e.value.index).y=n,n+=e.leafCount()}))};e.append("select").on("change",(function(){var e=d3.select(this);e.selectAll("option").filter((t=>t.value===e.property("value"))).each((e=>n=e.class)).each((e=>i=e.plot))})).selectAll("option").data([{value:"Complete Linkage",class:CompleteLinkageAgglomerativeClustering,plot:()=>{s(((e,t)=>{let a=e.leafValues(),l=t.leafValues(),n=a.map((e=>[e,l[argmax(l,(t=>e.distances[t.index]))]])),r=n[argmax(n,(e=>e[0].distances[e[1].index]))];return[[r[0].point,r[1].point]]}))}},{value:"Single Linkage",class:SingleLinkageAgglomerativeClustering,plot:()=>{s(((e,t)=>{let a=e.leafValues(),l=t.leafValues(),n=a.map((e=>[e,l[argmin(l,(t=>e.distances[t.index]))]])),r=n[argmin(n,(e=>e[0].distances[e[1].index]))];return[[r[0].point,r[1].point]]}))}},{value:"Group Average",class:GroupAverageAgglomerativeClustering,plot:()=>o()},{value:"Ward's",class:WardsAgglomerativeClustering,plot:()=>o()},{value:"Centroid",class:CentroidAgglomerativeClustering,plot:()=>o()},{value:"Weighted Average",class:WeightedAverageAgglomerativeClustering,plot:()=>o()},{value:"Median",class:MedianAgglomerativeClustering,plot:()=>o()}]).enter().append("option").attr("value",(e=>e.value)).text((e=>e.value)).each(((e,t)=>0===t&&(n=e.class))).each(((e,t)=>0===t&&(i=e.plot))),e.append("select").attr("name","metric").selectAll("option").data(["euclid","manhattan","chebyshev"]).enter().append("option").attr("value",(e=>e)).text((e=>e)),e.append("input").attr("type","button").attr("value","Initialize").on("click",(()=>{if(n){const l=e.select("[name=metric]").property("value");r=new n(l),r.fit(t.trainInput),e.selectAll("[name^=clusternumber]").attr("max",t.datas.length).property("value",10).attr("disabled",null),a.selectAll("path").remove(),a.selectAll(".grouping *").remove(),i()}})),e.append("span").text("Cluster #"),e.append("input").attr("type","number").attr("name","clusternumbeript").attr("min",1).attr("max",1).attr("value",1).attr("disabled","disabled").on("change",(function(){e.select("[name=clusternumber]").property("value",d3.select(this).property("value")),i()})),e.append("input").attr("type","range").attr("name","clusternumber").attr("min",1).attr("disabled","disabled").on("change",(function(){e.select("[name=clusternumbeript]").property("value",d3.select(this).property("value")),i()})).on("input",(function(){e.select("[name=clusternumbeript]").property("value",d3.select(this).property("value"))}))};export default function(e){e.setting.ml.usage='Click and add data point. Next, select distance type and click "Initialize". Finally, select cluster number.',dispAgglomerative(e.setting.ml.configElement,e),e.setting.terminate=()=>{d3.selectAll("svg .grouping").remove()}}