import SVR from"../../lib/model/svr.js";import Controller from"../controller.js";var dispSVR=function(t,e){const n=new Controller(e);let a=null,l=0;t.append("select").attr("name","kernel").on("change",(function(){"gaussian"===d3.select(this).property("value")?t.select("input[name=gamma]").style("display","inline"):t.select("input[name=gamma]").style("display","none")})).selectAll("option").data(["gaussian","linear"]).enter().append("option").property("value",(t=>t)).text((t=>t)),t.append("input").attr("type","number").attr("name","gamma").attr("value",.1).attr("min",.1).attr("max",10).attr("step",.1);const p=n.stepLoopButtons().init((()=>{const n=t.select("[name=kernel]").property("value"),p=[];"gaussian"===n&&p.push(+t.select("input[name=gamma]").property("value")),e.fit(((t,e)=>{a=new SVR(n,p),a.init(t,e)})),l=0,e.init()}));t.append("span").text(" Iteration "),t.append("select").attr("name","iteration").selectAll("option").data([1,10,100,1e3]).enter().append("option").property("value",(t=>t)).text((t=>t)),p.step((function(n){e.fit(((p,i,o)=>{let r=+t.select("[name=iteration]").property("value");for(let t=0;t<r;t++)a.fit();l+=r,e.predict(((t,e)=>{e(a.predict(t)),n&&n()}),8)}))})).epoch((()=>l))};export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',dispSVR(t.setting.ml.configElement,t)}