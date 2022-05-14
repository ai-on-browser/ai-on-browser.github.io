import VBGMM from"../../lib/model/vbgmm.js";import Controller from"../controller.js";import{getCategoryColor}from"../utils.js";class VBGMMPlotter{constructor(t,e){this._r=t.append("g").attr("class","centroids2"),this._model=e,this._size=e._k,this._circle=[],this._rm=[],this._duration=200,this._scale=1e3;for(let t=0;t<this._size;t++)this.add(t+1)}terminate(){this._r.remove()}add(t){let e=this._r.append("ellipse").attr("cx",0).attr("cy",0).attr("stroke",getCategoryColor(t)).attr("stroke-width",2).attr("fill-opacity",0);this._set_el_attr(e,this._size-1),this._circle.push(e),this._rm.push(!1)}_set_el_attr(t,e){let i=this._model.means.row(e).value,r=this._model.covs[e].value;const a=(r[0]+r[3]+Math.sqrt((r[0]-r[3])**2+4*r[1]**2))/2,s=(r[0]+r[3]-Math.sqrt((r[0]-r[3])**2+4*r[1]**2))/2;let l=360*Math.atan((a-r[0])/r[1])/(2*Math.PI);isNaN(l)&&(l=0),t.attr("rx",2.146*Math.sqrt(a)*this._scale).attr("ry",2.146*Math.sqrt(s)*this._scale).attr("transform","translate("+i[0]*this._scale+","+i[1]*this._scale+") rotate("+l+")")}move(){for(let t=0;t<this._circle.length;t++)this._model.effectivity[t]||(this._rm[t]||this._circle[t].remove(),this._rm[t]=!0);this._circle.forEach(((t,e)=>{this._rm[e]||this._set_el_attr(t.transition().duration(this._duration),e)}))}}export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Fit" button.';const e=new Controller(t);let i=null,r=null;const a=e.input.number({label:" alpha ",min:0,max:10,value:.001}),s=e.input.number({label:" beta ",min:0,max:10,value:.001}),l=e.input.number({label:" k ",min:1,max:1e3,value:10});e.stepLoopButtons().init((()=>{i=null,r?.terminate(),r=null,o.value="0",t.init()})).step((e=>{i||(i=new VBGMM(a.value,s.value,l.value),i.init(t.trainInput)),i.fit();const n=i.predict(t.trainInput);t.trainResult=n.map((t=>t+1)),o.value=i.effectivity.reduce(((t,e)=>t+(e?1:0)),0),r||(r=new VBGMMPlotter(t.svg,i)),r.move();const h=i.effectivity,m=i.means.toArray().map(((t,e)=>[t,e])).filter(((t,e)=>h[e]));t.centroids(m.map((t=>t[0])),m.map((t=>t[1]+1)),{duration:200}),setTimeout((()=>{e&&e()}),200)})).epoch();const o=e.text({label:" Clusters: "});t.setting.terminate=()=>{r?.terminate()}}