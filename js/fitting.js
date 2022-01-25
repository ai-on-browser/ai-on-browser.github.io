import Matrix from"../lib/util/matrix.js";const ct_fitting=function(t,i,e){e(i.x,i.y.map((t=>[t])),(t=>{t.forEach(((t,e)=>{i.at(e).y=t}))}))},d2_fitting=function(t,i,e){e(i.x,i.y.map((t=>[t])),(()=>{}))},ad_fitting=function(t,i,e){const n=i.x,a=i.y.map((t=>[t]));0===t.select(".tile").size()&&t.insert("g").classed("tile",!0).classed("anormal_point",!0);let o=t.select(".anormal_point");e(n,a,(e=>{t.selectAll(".tile *").remove(),e.forEach(((t,e)=>{if(t){new DataCircle(o,i.points[e]).color=getCategoryColor(specialCategory.error)}}))}))},dr_fitting=function(t,i,e){const n=i._manager.platform.width,a=i._manager.platform.height,o=i.x,s=i.y.map((t=>[t]));0===t.select(".tile").size()&&t.insert("g",":first-child").classed("tile",!0).attr("opacity",.5);let r=t.select(".tile");e(o,s,(t=>{r.selectAll("*").remove();const e=t[0].length;let o=t;1===e&&(o=o.map((t=>[t,0])));let s=[],l=[];for(let t=0;t<o[0].length;t++){const i=o.map((i=>i[t]));s.push(Math.max(...i)),l.push(Math.min(...i))}const c=1===i.dimension?[a,a]:[n,a],f=c.map(((t,i)=>(t-10)/(s[i]-l[i])));let m=Math.min(...f);const g=[5,5];for(let t=0;t<f.length;t++)(!isFinite(m)||f[t]>m)&&(isFinite(f[t])?g[t]+=(f[t]-m)*(s[t]-l[t])/2:g[t]=c[t]/2-l[t]);isFinite(m)||(m=0);let p=1/0,d=null;const _=Matrix.fromArray(i.points.map((t=>t.at)));for(let t=0;t<(1===i.dimension?1:2**e);t++){const i=t.toString(2).padStart(e,"0").split("").map((t=>!!+t)),n=o.map((t=>t.map(((t,e)=>((i[e]?s[e]-t+l[e]:t)-l[e])*m+g[e])))),a=Matrix.fromArray(n);a.sub(_);const r=a.norm();r<p&&(p=r,d=n)}d.forEach(((t,e)=>{const n=new DataPoint(r,1===i.dimension?[i.points[e].at[0],t[0]]:t,i.points[e].category);n.radius=2;new DataLine(r,i.points[e],n).setRemoveListener((()=>n.remove()))}))}))},gr_fitting=function(t,i,e){const n=i.x,a=i.y.map((t=>[t]));0===t.select(".tile").size()&&t.insert("g",":first-child").classed("tile",!0).classed("generated",!0).attr("opacity",.5);let o=t.select(".tile.generated");e(n,a,((t,e)=>{o.selectAll("*").remove(),t.forEach(((t,n)=>{new DataPoint(o,t.map((t=>t/i.scale)),e?e[n][0]:0).radius=2}))}))};export default{CT:ct_fitting,CF:d2_fitting,RG:d2_fitting,DR:dr_fitting,FS:dr_fitting,TF:dr_fitting,AD:ad_fitting,GR:gr_fitting,DE:d2_fitting,IN:d2_fitting};