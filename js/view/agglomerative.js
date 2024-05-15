var M=Object.defineProperty;var o=(e,u)=>M(e,"name",{value:u,configurable:!0});import{CompleteLinkageAgglomerativeClustering as W,SingleLinkageAgglomerativeClustering as q,GroupAverageAgglomerativeClustering as I,WardsAgglomerativeClustering as B,CentroidAgglomerativeClustering as D,WeightedAverageAgglomerativeClustering as G,MedianAgglomerativeClustering as N}from"../../lib/model/agglomerative.js";import $ from"../controller.js";import{getCategoryColor as y}from"../utils.js";import{DataConvexHull as O}from"../renderer/util/figure.js";const k=o(function(e,u){return e.length===0?-1:(e=u?e.map(u):e,e.indexOf(Math.min(...e)))},"argmin"),L=o(function(e,u){return e.length===0?-1:(e=u?e.map(u):e,e.indexOf(Math.max(...e)))},"argmax");export default function P(e){e.setting.ml.usage='Click and add data point. Next, select distance type and click "Initialize". Finally, select cluster number.';const u=e.svg,S=o(a=>{let i="";for(let s=0;s<a.length;s++)i+=`${s===0?"M":"L"}${a[s][0]},${a[s][1]}`;return i},"line"),f=new $(e);let C=null,x=null,h=null;const d=document.createElementNS("http://www.w3.org/2000/svg","g");u.insertBefore(d,u.firstChild),d.classList.add("grouping");const b=o(a=>{let i=[];const s=g.value;let l=1;const r=[];x.getClusters(s).forEach(t=>{if(t.size>1){let n=[];const p=[t];for(;p.length>0;){const c=p.pop();c.size>1?(c.line||(c.line=a(c.children[0],c.children[1])),n=n.concat(c.line)):c.children||(r[c.index]=l),c.children&&p.push(...c.children)}n=n.map(c=>({path:c.map(E=>e._renderer[0].toPoint(E)),color:y(l)})),i=i.concat(n)}else r[t.index]=l;l+=t.size}),e.trainResult=r,d.querySelectorAll("path").forEach(t=>t.remove());for(const t of i){const n=document.createElementNS("http://www.w3.org/2000/svg","path");n.setAttribute("d",S(t.path)),n.setAttribute("stroke",t.color),d.append(n)}},"plotLink"),v=o(function(){d.querySelectorAll("polygon").forEach(l=>l.remove());const a=g.value;let i=1;const s=[];x.getClusters(a).forEach(l=>{if(l.size>1){const r=[l];for(;r.length>0;){const t=r.pop();t.poly?t.poly.remove():t.children||(s[t.index]=i),t.children&&r.push(...t.children)}l.poly=new O(d,l.leafs.map(t=>e._renderer[0].points[t.index])),l.poly.color=y(i)}else s[l.index]=i;i+=l.size}),e.trainResult=s},"plotConvex"),A={"Complete Linkage":{class:W,plot:o(()=>{b((a,i)=>{const s=a.leafs,l=i.leafs;let r=s.map(n=>[n,l[L(l,p=>n.distances[p.index])]]),t=r[L(r,n=>n[0].distances[n[1].index])];return[[t[0].point,t[1].point]]})},"plot")},"Single Linkage":{class:q,plot:o(()=>{b((a,i)=>{const s=a.leafs,l=i.leafs;let r=s.map(n=>[n,l[k(l,p=>n.distances[p.index])]]),t=r[k(r,n=>n[0].distances[n[1].index])];return[[t[0].point,t[1].point]]})},"plot")},"Group Average":{class:I,plot:o(()=>v(),"plot")},"Ward's":{class:B,plot:o(()=>v(),"plot")},Centroid:{class:D,plot:o(()=>v(),"plot")},"Weighted Average":{class:G,plot:o(()=>v(),"plot")},Median:{class:N,plot:o(()=>v(),"plot")}},w=f.select(["Complete Linkage","Single Linkage","Group Average","Ward's","Centroid","Weighted Average","Median"]).on("change",()=>{C=A[w.value].class,h=A[w.value].plot});C=A["Complete Linkage"].class,h=A["Complete Linkage"].plot;const z=f.select(["euclid","manhattan","chebyshev"]);f.input.button("Initialize").on("click",()=>{C&&(x=new C(z.value),x.fit(e.trainInput),m.element.max=e.datas.length,m.element.value=10,m.element.disabled=!1,g.element.max=e.datas.length,g.element.value=10,g.element.disabled=!1,u.querySelectorAll("path").forEach(a=>a.remove()),d.replaceChildren(),h())});const m=f.input.number({label:"Cluster #",min:1,max:1,value:1,disabled:"disabled"}).on("change",()=>{g.value=m.value,h()}),g=f.input.range({min:1,disabled:"disabled"}).on("change",()=>{m.value=g.value,h()}).on("input",()=>{m.value=g.value});return()=>{document.querySelector("svg .grouping").remove()}}o(P,"default");
