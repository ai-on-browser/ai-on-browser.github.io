var b=Object.defineProperty;var d=(t,n)=>b(t,"name",{value:n,configurable:!0});import g from"../../lib/model/mean_shift.js";import h from"../controller.js";import{getCategoryColor as w}from"../utils.js";export default function k(t){t.setting.ml.usage='Click and add data point. Finally, click "Step" button repeatedly.',t.setting.ml.reference={title:"Mean shift (Wikipedia)",url:"https://en.wikipedia.org/wiki/Mean_shift"};let n=null;t.task!=="SG"&&(n=document.createElementNS("http://www.w3.org/2000/svg","g"),t.svg.insertBefore(n,t.svg.firstChild),n.classList.add("centroids"),n.setAttribute("opacity",.8));const l=new h(t);let c=[],i=new g(50,10);const a=d(()=>{const s=t._renderer[0].scale?.[0]??0,o=i.predict(v.value);t.trainResult=o.map(e=>e+1);for(let e=0;e<c.length;e++)c[e].setAttribute("stroke",w(o[e]+1)),c[e].setAttribute("cx",i._centroids[e][0]*s),c[e].setAttribute("cy",i._centroids[e][1]*s)},"plot"),p=l.input.number({min:0,max:10,step:.01,value:.1});l.stepLoopButtons().init(()=>{const s=t._renderer[0].scale?.[0]??0;i=new g(p.value);let o=t.trainInput;t.task==="SG"&&(o=o.flat()),i.init(o),t.task!=="SG"&&s>0&&(c.forEach(e=>e.remove()),c=t._renderer[0].points.map(e=>{const r=document.createElementNS("http://www.w3.org/2000/svg","circle");return r.setAttribute("cx",e.at[0]*s),r.setAttribute("cy",e.at[1]*s),r.setAttribute("r",i.h*s),r.setAttribute("stroke","black"),r.setAttribute("fill-opacity",0),r.setAttribute("stroke-opacity",.5),n.append(r),r})),a(),u.value=i.categories}).step(s=>{i!==null&&(i.fit(),a(),u.value=i.categories,s&&s())});const v=l.input.number({min:0,max:10,step:.01,value:.01}).on("change",()=>{a(),u.value=i.categories}),u=l.text({label:" clusters ",value:0});t.setting.terminate=()=>{n?.remove()}}d(k,"default");
