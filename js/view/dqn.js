var E=Object.defineProperty;var r=(a,e)=>E(a,"name",{value:e,configurable:!0});import A from"../neuralnetwork_builder.js";import C from"../../lib/model/dqn.js";import L from"../controller.js";class b{static{r(this,"DQNCBAgent")}constructor(e,s,l,n,c,u){this._agent=new C(e,s,l,n),u&&u()}set method(e){this._agent.method=e}terminate(){}get_score(e){const s=this._agent.get_score();e&&e(s)}get_action(e,s=.002,l){const n=this._agent.get_action(e,s);l&&l(n)}update(e,s,l,n,c,u,o,m){const d=this._agent.update(e,s,l,n,c,u,o);m&&m(d)}}var H=r(function(a,e){let s=20;e.type==="grid"&&(e.env._reward={step:-1,wall:-1,goal:1,fail:-1},e.env._max_step=3e3,s=Math.max(...e.env.size));const l=new A,n=new L(e),c=!1;let u=!1,o=null;e.reset(o);const m=r(t=>{e.type==="grid"?o.get_score(p=>{e.render(()=>p),t&&t()}):(e.render(),t&&t())},"render_score"),d=r((t,p=!0)=>{if(!u){t&&t();return}const f=e.state();o.get_action(f,Math.max(S.value,_.value*N.value),h=>{const{state:x,reward:B,done:y,invalid:Q}=e.step(h);if(Q){t&&t();return}o.update(h,f,x,B,y,T.value,z.value,v=>{v!=null&&e.plotLoss(v);const D=r(()=>{(y||e.epoch%1e3===999)&&(_.value=_.value*N.value),t&&t(y)},"end_proc");p?m(D):D()})})},"step"),g=r(t=>{if(!u){t&&t();return}e.reset(o),m(()=>{t&&t()})},"reset");a.append("span").text(" Hidden Layers "),l.makeHtml(a,{optimizer:!0}),o=new b(e,s,l.layers,l.optimizer,c,()=>{u=!0,setTimeout(()=>{m(()=>{a.selectAll("input").property("disabled",!1)})},0)}),n.input.button("New agent").on("click",()=>{o.terminate(),o=new b(e,s,l.layers,l.optimizer,c,()=>{u=!0,g()}),_.value=1}),n.input.button("Reset").on("click",()=>g());const R=n.select(["DQN","DDQN"]).on("change",()=>{o.method=R.value}),S=n.input.number({label:"greedy rate = max(",min:0,max:1,step:.01,value:.01}),_=n.input.number({label:", ",min:0,max:1,step:.01,value:1}),N=n.input.number({label:" * ",min:0,max:1,step:.01,value:.995});n.text(") ");const T=n.input.number({label:" Learning rate ",min:0,max:100,step:.01,value:.001}),z=n.input.number({label:" Batch size ",min:1,max:100,value:10});n.input.button("Step").on("click",()=>d());let i=!1;const w=n.input.button("Epoch").on("click",()=>{i=!i,w.element.value=i?"Stop":"Epoch",k.element.disabled=i,i&&r(function t(){i?d(p=>{setTimeout(()=>p?g(t):t())}):setTimeout(()=>{m(()=>{w.element.value="Epoch"})},0)},"loop")()});w.element.disabled=!0;const k=n.input.button("Skip").on("click",()=>{if(i=!i,k.element.value=i?"Stop":"Skip",w.element.disabled=i,i){let t=new Date().getTime();r(function p(){for(;i;){let f=!1;if(d(x=>{f=x,c&&(x?g(p):p())},!0),c)return;const h=new Date().getTime();if(f&&g(),h-t>200){t=h,setTimeout(p,0);return}}m(()=>{k.element.value="Skip"})},"loop")()}});return k.element.disabled=!0,e.plotRewards(a),()=>{i=!1,o.terminate()}},"dispDQN");export default function M(a){a.setting.ml.usage='Click "step" to update.',a.setting.terminate=H(a.setting.ml.configElement,a)}r(M,"default");
