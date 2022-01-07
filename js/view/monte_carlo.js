import MCAgent from"../../lib/model/monte_carlo.js";var dispMC=function(t,e){const n="grid"===e.type?Math.max(...e.env.size):20;let r=new MCAgent(e,n),a=e.reset(r);e.render((()=>r.get_score()));const o=(n=!0)=>{const o=+t.select("[name=greedy_rate]").property("value"),s=r.get_action(a,o),{state:p,reward:i,done:u}=e.step(s,r);return r.update(s,a,i,u),n&&e.render(),a=p,u},s=()=>{a=e.reset(r),r.reset(),e.render((()=>r.get_score()))};t.append("span").text("Resolution"),t.append("input").attr("type","number").attr("name","resolution").attr("min",2).attr("max",100).attr("value",n);const p=e.setting.ml.controller.stepLoopButtons().init((()=>{const n=+t.select("[name=resolution]").property("value");r=new MCAgent(e,n),s()}));t.append("input").attr("type","button").attr("value","Reset").on("click",s),t.append("input").attr("type","number").attr("name","greedy_rate").attr("min",0).attr("max",1).attr("step","0.01").attr("value",.5),p.step((t=>{o()?setTimeout((()=>{s(),t&&setTimeout(t,10)})):t&&setTimeout(t,5)})).skip((()=>{o(!1)&&s()})),e.plotRewards(t)};export default function(t){t.setting.ml.usage='Click "step" to update.',dispMC(t.setting.ml.configElement,t)}