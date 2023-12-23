var M=Object.defineProperty;var p=(e,c)=>M(e,"name",{value:c,configurable:!0});import{CompleteLinkageAgglomerativeClustering as W,SingleLinkageAgglomerativeClustering as q,GroupAverageAgglomerativeClustering as I,WardsAgglomerativeClustering as B,CentroidAgglomerativeClustering as D,WeightedAverageAgglomerativeClustering as G,MedianAgglomerativeClustering as N}from"../../lib/model/agglomerative.js";import $ from"../controller.js";import{getCategoryColor as y}from"../utils.js";import{DataConvexHull as O}from"../renderer/util/figure.js";const k=p(function(e,c){return e.length===0?-1:(e=c?e.map(c):e,e.indexOf(Math.min(...e)))},"argmin"),L=p(function(e,c){return e.length===0?-1:(e=c?e.map(c):e,e.indexOf(Math.max(...e)))},"argmax");export default function P(e){e.setting.ml.usage='Click and add data point. Next, select distance type and click "Initialize". Finally, select cluster number.',e.setting.terminate=()=>{document.querySelector("svg .grouping").remove()};const c=e.svg,S=p(o=>{let i="";for(let s=0;s<o.length;s++)i+=`${s===0?"M":"L"}${o[s][0]},${o[s][1]}`;return i},"line"),h=new $(e);let C=null,x=null,f=null;const g=document.createElementNS("http://www.w3.org/2000/svg","g");c.insertBefore(g,c.firstChild),g.classList.add("grouping");const b=p(o=>{let i=[];const s=u.value;let l=1;const a=[];x.getClusters(s).forEach(t=>{if(t.size>1){let n=[];const d=[t];for(;d.length>0;){const r=d.pop();r.size>1?(r.line||(r.line=o(r.children[0],r.children[1])),n=n.concat(r.line)):r.children||(a[r.index]=l),r.children&&d.push(...r.children)}n=n.map(r=>({path:r.map(E=>e._renderer[0].toPoint(E)),color:y(l)})),i=i.concat(n)}else a[t.index]=l;l+=t.size}),e.trainResult=a,g.querySelectorAll("path").forEach(t=>t.remove());for(const t of i){const n=document.createElementNS("http://www.w3.org/2000/svg","path");n.setAttribute("d",S(t.path)),n.setAttribute("stroke",t.color),g.append(n)}},"plotLink"),v=p(function(){g.querySelectorAll("polygon").forEach(l=>l.remove());const o=u.value;let i=1;const s=[];x.getClusters(o).forEach(l=>{if(l.size>1){const a=[l];for(;a.length>0;){const t=a.pop();t.poly?t.poly.remove():t.children||(s[t.index]=i),t.children&&a.push(...t.children)}l.poly=new O(g,l.leafs.map(t=>e._renderer[0].points[t.index])),l.poly.color=y(i)}else s[l.index]=i;i+=l.size}),e.trainResult=s},"plotConvex"),A={"Complete Linkage":{class:W,plot:()=>{b((o,i)=>{const s=o.leafs,l=i.leafs;let a=s.map(n=>[n,l[L(l,d=>n.distances[d.index])]]),t=a[L(a,n=>n[0].distances[n[1].index])];return[[t[0].point,t[1].point]]})}},"Single Linkage":{class:q,plot:()=>{b((o,i)=>{const s=o.leafs,l=i.leafs;let a=s.map(n=>[n,l[k(l,d=>n.distances[d.index])]]),t=a[k(a,n=>n[0].distances[n[1].index])];return[[t[0].point,t[1].point]]})}},"Group Average":{class:I,plot:()=>v()},"Ward's":{class:B,plot:()=>v()},Centroid:{class:D,plot:()=>v()},"Weighted Average":{class:G,plot:()=>v()},Median:{class:N,plot:()=>v()}},w=h.select(["Complete Linkage","Single Linkage","Group Average","Ward's","Centroid","Weighted Average","Median"]).on("change",()=>{C=A[w.value].class,f=A[w.value].plot});C=A["Complete Linkage"].class,f=A["Complete Linkage"].plot;const z=h.select(["euclid","manhattan","chebyshev"]);h.input.button("Initialize").on("click",()=>{C&&(x=new C(z.value),x.fit(e.trainInput),m.element.max=e.datas.length,m.element.value=10,m.element.disabled=!1,u.element.max=e.datas.length,u.element.value=10,u.element.disabled=!1,c.querySelectorAll("path").forEach(o=>o.remove()),g.replaceChildren(),f())});const m=h.input.number({label:"Cluster #",min:1,max:1,value:1,disabled:"disabled"}).on("change",()=>{u.value=m.value,f()}),u=h.input.range({min:1,disabled:"disabled"}).on("change",()=>{m.value=u.value,f()}).on("input",()=>{m.value=u.value})}p(P,"default");
