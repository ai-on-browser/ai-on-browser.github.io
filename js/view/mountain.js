import Mountain from"../../lib/model/mountain.js";var dispMountain=function(t,e){let a=null;t.append("span").text(" resolution "),t.append("input").attr("type","number").attr("name","resolution").attr("min",1).attr("max",1e3).attr("value",100),t.append("span").text(" alpha "),t.append("input").attr("type","number").attr("name","alpha").attr("min",0).attr("max",100).attr("step",.1).attr("value",5.4),t.append("span").text(" beta "),t.append("input").attr("type","number").attr("name","beta").attr("min",1).attr("max",100).attr("step",.1).attr("value",5.4),t.append("input").attr("type","button").attr("value","Initialize").on("click",(()=>{a=null,t.select("[name=clusters]").text(0),e.init()})),t.append("input").attr("type","button").attr("value","Step").on("click",(()=>{(n=>{const p=+t.select("[name=resolution]").property("value"),r=+t.select("[name=alpha]").property("value"),i=+t.select("[name=beta]").property("value");a||(a=new Mountain(p,r,i),a.init(e.trainInput)),a.fit();const l=a.predict(e.trainInput);e.trainResult=l.map((t=>t+1)),e.testResult(a.predict(e.testInput(4)).map((t=>t+1))),t.select("[name=clusters]").text(a._centroids.length),e.centroids(a._centroids,a._centroids.map(((t,e)=>e+1))),n&&n()})()})),t.append("span").text(" Clusters: "),t.append("span").attr("name","clusters")};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Step" button repeatedly.',dispMountain(t.setting.ml.configElement,t)}