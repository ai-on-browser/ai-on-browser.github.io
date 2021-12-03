import SARSAAgent from"../../lib/model/sarsa.js";var dispSARSA=function(t,e){const n="grid"===e.type?Math.max(...e.env.size):20;let r=new SARSAAgent(e,n),a=e.reset(r);e.render((()=>r.get_score()));const s=(n=!0)=>{const s=+t.select("[name=greedy_rate]").property("value"),o=r.get_action(a,s),[p,i,u]=e.step(o,r);return r.update(o,a,p,i),n&&(e.epoch%10==0?e.render((()=>r.get_score())):e.render()),a=p,u&&r.reset(),u},o=()=>{a=e.reset(r),e.render((()=>r.get_score()))};t.append("span").text("Resolution"),t.append("input").attr("type","number").attr("name","resolution").attr("min",2).attr("max",100).attr("value",n);const p=e.setting.ml.controller.stepLoopButtons().init((()=>{const n=+t.select("[name=resolution]").property("value");r=new SARSAAgent(e,n),o()}));t.append("input").attr("type","button").attr("value","Reset").on("click",o),t.append("input").attr("type","number").attr("name","greedy_rate").attr("min",0).attr("max",1).attr("step","0.01").attr("value",.02),p.step((t=>{s()?setTimeout((()=>{o(),t&&setTimeout(t,10)})):t&&setTimeout(t,5)})).skip((()=>{s(!1)&&o()})),e.plotRewards(t)};export default function(t){t.setting.ml.usage='Click "step" to update.',dispSARSA(t.setting.ml.configElement,t)}