var y=Object.defineProperty;var i=(t,n)=>y(t,"name",{value:n,configurable:!0});import x from"../../lib/model/adaptive_thresholding.js";var k=i(function(t,n){n.colorSpace="gray";const s=i(()=>{const p=t.select("[name=method]").property("value"),g=+t.select("[name=k]").property("value"),h=+t.select("[name=c]").property("value"),m=n._step;n._step=1;const o=n.trainInput,v=new x(p,g,h),c=[];for(let a=0;a<o.length*o[0].length;a++)c[a]=[];for(let a=0;a<o[0][0].length;a++){const u=[];for(let e=0;e<o.length;e++)u[e]=o[e].map(r=>r[a]);const d=v.predict(u);for(let e=0,r=0;e<d.length;e++)for(let l=0;l<d[e].length;l++,r++)c[r].push(d[e][l]*255)}n.trainResult=c,n._step=m},"fitModel");t.append("select").attr("name","method").selectAll("option").data(["mean","gaussian","median","midgray"]).enter().append("option").property("value",p=>p).text(p=>p),t.append("span").text(" k "),t.append("input").attr("type","number").attr("name","k").attr("value",3).attr("min",3).attr("max",99).attr("step",2).on("change",s),t.append("span").text(" c "),t.append("input").attr("type","number").attr("name","c").attr("value",2).attr("min",0).attr("max",100).on("change",s),t.append("input").attr("type","button").attr("value","Fit").on("click",s)},"dispAdaptiveThresholding");export default function b(t){t.setting.ml.usage='Click "Fit" button.',k(t.setting.ml.configElement,t)}i(b,"default");
