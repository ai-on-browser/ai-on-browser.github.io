import A2CAgent from"../../lib/model/a2c.js";class A2CCBAgent{constructor(t,e,a,n,r,p){this._agent=new A2CAgent(t.env,e,50,a,n),p&&p()}set method(t){this._agent.method=t}terminate(){}get_score(t){const e=this._agent.get_score();t&&t(e)}get_action(t,e){const a=this._agent.get_action(t);e&&e(a)}update(t,e,a,n){this._agent.update(t,e,a),n&&n()}}var dispA2C=function(t,e){let a=20;"grid"===e.type&&(e.env._max_step=1e3,a=Math.max(...e.env.size));const n=new NeuralNetworkBuilder,r=!1;let p=!1,i=null,o=e.reset(i);const s=t=>{"grid"===e.type?i.get_score((a=>{e.render((()=>a)),t&&t()})):(e.render(),t&&t())},l=(a,n=!0)=>{if(!p)return void(a&&a());const r=+t.select("[name=learning_rate]").property("value"),l=+t.select("[name=batch]").property("value");i.get_action(o,(t=>{const{state:p,done:u}=e.step(t,i);i.update(u,r,l,(()=>{const t=()=>{o=p,a&&a(u)};n?s(t):t()}))}))},u=t=>{p?(o=e.reset(i),s((()=>{t&&t()}))):t&&t()};t.append("span").text(" Hidden Layers "),n.makeHtml(t,{optimizer:!0}),i=new A2CCBAgent(e,a,n.layers,n.optimizer,r,(()=>{p=!0,setTimeout((()=>{s((()=>{t.selectAll("input").property("disabled",!1)}))}),0)})),t.append("input").attr("type","button").attr("value","New agent").on("click",(()=>{i.terminate(),i=new A2CCBAgent(e,a,n.layers,n.optimizer,r,(()=>{p=!0,u()})),t.select("[name=greedy_rate]").property("value",1)})),t.append("input").attr("type","button").attr("value","Reset").on("click",u),t.append("span").text(" Learning rate "),t.append("input").attr("type","number").attr("name","learning_rate").attr("min",0).attr("max",100).attr("step",.01).attr("value",.001),t.append("span").text(" Batch size "),t.append("input").attr("type","number").attr("name","batch").attr("value",10).attr("min",1).attr("max",100).attr("step",1),t.append("input").attr("type","button").attr("value","Step").on("click",(()=>l()));let c=!1;const d=t.append("input").attr("type","button").attr("value","Epoch").on("click",(()=>{c=!c,d.attr("value",c?"Stop":"Epoch"),m.property("disabled",c),c&&function t(){c?l((e=>{setTimeout((()=>e?u(t):t()))})):setTimeout((()=>{s((()=>{d.attr("value","Epoch")}))}),0)}()})),m=t.append("input").attr("type","button").attr("value","Skip").on("click",(()=>{if(c=!c,m.attr("value",c?"Stop":"Skip"),d.property("disabled",c),c){let t=(new Date).getTime();!function e(){for(;c;){let a=!1;l((t=>{a=t}),!0);const n=(new Date).getTime();if(a&&u(),n-t>200)return t=n,void setTimeout(e,0)}s((()=>{m.attr("value","Skip")}))}()}}));return e.plotRewards(t),t.selectAll("input").property("disabled",!0),()=>{c=!1,i.terminate()}};export default function(t){t.setting.ml.usage='Click "step" to update.',t.setting.terminate=dispA2C(t.setting.ml.configElement,t)}