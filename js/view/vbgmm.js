var p=Object.defineProperty;var u=(a,e)=>p(a,"name",{value:e,configurable:!0});import v from"../../lib/model/vbgmm.js";import f from"../controller.js";import{getCategoryColor as b}from"../utils.js";class w{static{u(this,"VBGMMPlotter")}constructor(e,t){this._r=document.createElementNS("http://www.w3.org/2000/svg","g"),e.append(this._r),this._model=t,this._size=t._k,this._circle=[],this._rm=[],this._duration=200,this._scale=1e3;for(let s=0;s<this._size;s++)this.add(s+1)}terminate(){this._r.remove()}add(e){const t=document.createElementNS("http://www.w3.org/2000/svg","ellipse");t.setAttribute("cx",0),t.setAttribute("cy",0),t.setAttribute("stroke",b(e)),t.setAttribute("stroke-width",2),t.setAttribute("fill-opacity",0),t.style.transitionDuration=this._duration+"ms",this._r.append(t),this._set_el_attr(t,this._size-1),this._circle.push(t),this._rm.push(!1)}_set_el_attr(e,t){let s=this._model.means.row(t).value,i=this._model.covs[t].value;const o=(i[0]+i[3]+Math.sqrt((i[0]-i[3])**2+4*i[1]**2))/2,h=(i[0]+i[3]-Math.sqrt((i[0]-i[3])**2+4*i[1]**2))/2,c=2.146;let n=360*Math.atan((o-i[0])/i[1])/(2*Math.PI);isNaN(n)&&(n=0),e.setAttribute("rx",c*Math.sqrt(o)*this._scale),e.setAttribute("ry",c*Math.sqrt(h)*this._scale),e.setAttribute("transform","translate("+s[0]*this._scale+","+s[1]*this._scale+") rotate("+n+")")}move(){for(let e=0;e<this._circle.length;e++)this._model.effectivity[e]||(this._rm[e]||this._circle[e].remove(),this._rm[e]=!0);this._circle.forEach((e,t)=>{this._rm[t]||this._set_el_attr(e,t)})}}export default function g(a){a.setting.ml.usage='Click and add data point. Then, click "Fit" button.';const e=new f(a);let t=null,s=null;const i=u(async()=>{t||(t=new v(o.value,h.value,c.value),t.init(a.trainInput)),t.fit();const _=t.predict(a.trainInput);a.trainResult=_.map(r=>r+1),n.value=t.effectivity.reduce((r,l)=>r+(l?1:0),0),s||(s=new w(a.svg,t)),s.move();const d=t.effectivity,m=t.means.toArray().map((r,l)=>[r,l]).filter((r,l)=>d[l]);a.centroids(m.map(r=>r[0]),m.map(r=>r[1]+1),{duration:200}),await new Promise(r=>setTimeout(r,200))},"fitModel"),o=e.input.number({label:" alpha ",min:0,max:10,value:.001}),h=e.input.number({label:" beta ",min:0,max:10,value:.001}),c=e.input.number({label:" k ",min:1,max:1e3,value:10});e.stepLoopButtons().init(()=>{t=null,s?.terminate(),s=null,n.value="0",a.init()}).step(i).epoch();const n=e.text({label:" Clusters: "});return()=>{s?.terminate()}}u(g,"default");
