import DBSCAN from"../../lib/model/dbscan.js";var dispDBSCAN=function(t,e){const a=e.svg;a.insert("g",":first-child").attr("class","range").attr("opacity",.4);const n=n=>{a.selectAll(".range *").remove(),e.fit(((e,r,p)=>{const l=t.select("[name=metric]").property("value"),s=+t.select("[name=eps]").property("value"),c=+t.select("[name=minpts]").property("value"),i=new DBSCAN(s,c,l).predict(e);p(i.map((t=>t+1))),t.select("[name=clusters]").text(new Set(i).size);const o=1e3;"euclid"===l?a.select(".range").selectAll("circle").data(e).enter().append("circle").attr("cx",(t=>t[0]*o)).attr("cy",(t=>t[1]*o)).attr("r",s*o).attr("fill-opacity",0).attr("stroke",((t,e)=>getCategoryColor(i[e]+1))):"manhattan"===l?a.select(".range").selectAll("polygon").data(e).enter().append("polygon").attr("points",(t=>{const e=t[0]*o,a=t[1]*o,n=s*o;return`${e-n},${a} ${e},${a-n} ${e+n},${a} ${e},${a+n}`})).attr("fill-opacity",0).attr("stroke",((t,e)=>getCategoryColor(i[e]+1))):"chebyshev"===l&&a.select(".range").selectAll("rect").data(e).enter().append("rect").attr("x",(t=>(t[0]-s)*o)).attr("y",(t=>(t[1]-s)*o)).attr("width",2*s*o).attr("height",2*s*o).attr("fill-opacity",0).attr("stroke",((t,e)=>getCategoryColor(i[e]+1))),n&&n()}))};t.append("select").attr("name","metric").on("change",n).selectAll("option").data(["euclid","manhattan","chebyshev"]).enter().append("option").attr("value",(t=>t)).text((t=>t)),t.append("span").text("eps"),t.append("input").attr("type","number").attr("name","eps").attr("min",.01).attr("max",10).attr("step",.01).attr("value",.05).on("change",n),t.append("span").text("min pts"),t.append("input").attr("type","number").attr("name","minpts").attr("min",2).attr("max",1e3).attr("value",5).on("change",n);t.append("input").attr("type","button").attr("value","Fit").on("click",n);return t.append("span").text(" Clusters: "),t.append("span").attr("name","clusters"),()=>{a.select(".range").remove()}};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Fit" button.',t.setting.terminate=dispDBSCAN(t.setting.ml.configElement,t)}