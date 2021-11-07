import{Matrix}from"../../lib/util/math.js";import{GMM,SemiSupervisedGMM,GMR}from"../../lib/model/gmm.js";class GMMPlotter{constructor(t,e,r=!1){this._r=t.append("g").attr("class","centroids2"),this._model=e,this._size=0,this._circle=[],this._grayscale=r,this._duration=200}terminate(){this._r.remove()}_set_el_attr(t,e){if(!this._model._m[e])return;const r=this._model._m[e].value,a=this._model._s[e].value,i=(a[0]+a[3]+Math.sqrt((a[0]-a[3])**2+4*a[1]**2))/2,s=(a[0]+a[3]-Math.sqrt((a[0]-a[3])**2+4*a[1]**2))/2;let n=360*Math.atan((i-a[0])/a[1])/(2*Math.PI);isNaN(n)&&(n=0),t.attr("rx",2.146*Math.sqrt(i)*1e3).attr("ry",2.146*Math.sqrt(s)*1e3).attr("transform","translate("+1e3*r[0]+","+1e3*r[1]+") rotate("+n+")")}add(t){this._size++;const e=this._r.append("ellipse").attr("cx",0).attr("cy",0).attr("stroke",this._grayscale?"gray":getCategoryColor(t||this._size)).attr("stroke-width",2).attr("fill-opacity",0);this._set_el_attr(e,this._size-1),this._circle.push(e)}clear(){this._circle.forEach((t=>t.remove())),this._circle=[],this._size=0}move(){this._circle.forEach(((t,e)=>{this._set_el_attr(t.transition().duration(this._duration),e)}))}}var dispGMM=function(t,e){const r=e.svg,a=e.task,i="CT"!==a&&"SC"!==a&&"RG"!==a;let s=new GMM;"SC"===a?s=new SemiSupervisedGMM:"RG"===a&&(s=new GMR);const n=new GMMPlotter(r,s,i),l=(r,l)=>{"AD"===a?e.fit(((a,i,n)=>{const l=+t.select("[name=threshold]").property("value");r&&s.fit(a);n(s.probability(a).map((t=>1-t.reduce(((t,e)=>t*Math.exp(-e)),1)<l))),e.predict(((t,e)=>{e(s.probability(t).map((t=>1-t.reduce(((t,e)=>t*Math.exp(-e)),1)<l)))}),3)})):"DE"===a?e.fit(((t,a)=>{r&&s.fit(t),e.predict(((t,e)=>{const r=s.probability(t).map((t=>Math.max(...t))),a=Math.min(...r),i=Math.max(...r);e(r.map((t=>specialCategory.density((t-a)/(i-a)))))}),8)})):"SC"===a?e.fit(((t,a,i)=>{r&&s.fit(t,a.map((t=>t[0]))),i(s.predict(t)),e.predict(((t,e)=>{e(s.predict(t))}),4)})):"GR"===a?e.fit(((t,e,a)=>{r&&s.fit(t);const i=[];if(s._k>0)for(let e=0;e<t.length;e++){let e=Math.random(),r=0;for(;r<s._p.length&&!((e-=s._p[r])<=0);r++);i.push(Matrix.randn(1,t[0].length,s._m[r],s._s[r]).value)}a(i)})):"RG"===a?e.fit(((t,a)=>{r&&(s.fit(t,a),e.predict(((t,e)=>{e(s.predict(t))}),4))})):e.fit(((t,e,a)=>{r&&s.fit(t),a(s.predict(t).map((t=>t+1)))})),"RG"===a||(n.move(),e.centroids(s._m.map((t=>t.value)),i?0:"SC"===a?s.categories:s._m.map(((t,e)=>e+1)),{duration:200})),t.select("[name=clusternumber]").text(s._k+" clusters")},o=e.setting.ml.controller.stepLoopButtons();return"SC"===a?o.init((()=>{e.fit(((t,e)=>{s.clear(),s.init(t,e.map((t=>t[0])));for(let t=0;t<s._k;t++)n.add(s.categories[t]);l(!1)}))})):t.append("input").attr("type","button").attr("value","Add cluster").on("click",(()=>{s.add(),n.add(),l(!1)})),t.append("span").attr("name","clusternumber").style("padding","0 10px").text("0 clusters"),"AD"===a&&(t.append("span").text(" threshold = "),t.append("input").attr("type","number").attr("name","threshold").attr("value",.5).attr("min",0).attr("max",1).property("required",!0).attr("step",.1).on("change",(()=>l(!1)))),o.step((t=>{l(!0),setTimeout((()=>t&&t()),200)})),"SC"!==a&&t.append("input").attr("type","button").attr("value","Clear").on("click",(()=>{s&&s.clear(),n.clear(),t.select("[name=clusternumber]").text("0 clusters"),e.init()})),()=>{n.terminate()}};export default function(t){t.setting.ml.usage='Click and add data point. Finally, click "Step" button repeatedly.',t.setting.terminate=dispGMM(t.setting.ml.configElement,t)}