import DQNAgent from"../../lib/model/dqn.js";class DQNCBAgent{constructor(t,e,a,n,r,p){this._agent=new DQNAgent(t,e,a,n),p&&p()}set method(t){this._agent.method=t}terminate(){}get_score(t){const e=this._agent.get_score();t&&t(e)}get_action(t,e=.002,a){const n=this._agent.get_action(t,e);a&&a(n)}update(t,e,a,n,r,p,i,o){this._agent.update(t,e,a,n,r,p,i),o&&o()}}var dispDQN=function(t,e){let a=20;"grid"===e.type&&(e.env._reward={step:-1,wall:-1,goal:1,fail:-1},e.env._max_step=3e3,a=Math.max(...e.env.size));const n=new NeuralNetworkBuilder,r=!1;let p=!1,i=null,o=e.reset(i);const l=t=>{"grid"===e.type?i.get_score((a=>{e.render((()=>a)),t&&t()})):(e.render(),t&&t())},s=(a,n=!0)=>{if(!p)return void(a&&a());const r=+t.select("[name=greedy_rate]").property("value"),s=+t.select("[name=min_greedy_rate]").property("value"),u=+t.select("[name=greedy_rate_update]").property("value"),d=+t.select("[name=learning_rate]").property("value"),m=+t.select("[name=batch]").property("value");i.get_action(o,Math.max(s,r*u),(p=>{const{state:s,reward:c,done:g}=e.step(p,i);i.update(p,o,s,c,g,d,m,(()=>{const p=()=>{o=s,(g||e.epoch%1e3==999)&&t.select("[name=greedy_rate]").property("value",r*u),a&&a(g)};n?l(p):p()}))}))},u=t=>{p?(o=e.reset(i),l((()=>{t&&t()}))):t&&t()};t.append("span").text(" Hidden Layers "),n.makeHtml(t,{optimizer:!0}),i=new DQNCBAgent(e,a,n.layers,n.optimizer,r,(()=>{p=!0,setTimeout((()=>{l((()=>{t.selectAll("input").property("disabled",!1)}))}),0)})),t.append("input").attr("type","button").attr("value","New agent").on("click",(()=>{i.terminate(),i=new DQNCBAgent(e,a,n.layers,n.optimizer,r,(()=>{p=!0,u()})),t.select("[name=greedy_rate]").property("value",1)})),t.append("input").attr("type","button").attr("value","Reset").on("click",u),t.append("select").attr("name","method").on("change",(function(){const t=d3.select(this);i.method=t.property("value")})).selectAll("option").data(["DQN","DDQN"]).enter().append("option").property("value",(t=>t)).text((t=>t)),t.append("span").text("greedy rate = max("),t.append("input").attr("type","number").attr("name","min_greedy_rate").attr("min",0).attr("max",1).attr("step","0.01").attr("value",.01),t.append("span").text(", "),t.append("input").attr("type","number").attr("name","greedy_rate").attr("min",0).attr("max",1).attr("step","0.01").attr("value",1),t.append("span").text(" * "),t.append("input").attr("type","number").attr("name","greedy_rate_update").attr("min",0).attr("max",1).attr("step","0.01").attr("value",.995),t.append("span").text(") "),t.append("span").text(" Learning rate "),t.append("input").attr("type","number").attr("name","learning_rate").attr("min",0).attr("max",100).attr("step",.01).attr("value",.001),t.append("span").text(" Batch size "),t.append("input").attr("type","number").attr("name","batch").attr("value",10).attr("min",1).attr("max",100).attr("step",1),t.append("input").attr("type","button").attr("value","Step").on("click",(()=>s()));let d=!1;const m=t.append("input").attr("type","button").attr("value","Epoch").on("click",(()=>{d=!d,m.attr("value",d?"Stop":"Epoch"),c.property("disabled",d),d&&function t(){d?s((e=>{setTimeout((()=>e?u(t):t()))})):setTimeout((()=>{l((()=>{m.attr("value","Epoch")}))}),0)}()})),c=t.append("input").attr("type","button").attr("value","Skip").on("click",(()=>{if(d=!d,c.attr("value",d?"Stop":"Skip"),m.property("disabled",d),d){let t=(new Date).getTime();!function e(){for(;d;){let a=!1;s((t=>{a=t}),!0);const n=(new Date).getTime();if(a&&u(),n-t>200)return t=n,void setTimeout(e,0)}l((()=>{c.attr("value","Skip")}))}()}}));return e.plotRewards(t),t.selectAll("input").property("disabled",!0),()=>{d=!1,i.terminate()}};export default function(t){t.setting.ml.usage='Click "step" to update.',t.setting.terminate=dispDQN(t.setting.ml.configElement,t)}