var _=Object.defineProperty;var u=(e,n)=>_(e,"name",{value:n,configurable:!0});import g from"../../lib/model/q_learning.js";import x from"../controller.js";export default function k(e){e.setting.ml.usage='Click "step" to update.';const n=new x(e),r=e.type==="grid"?Math.max(...e.env.size):20;let t=new g(e,r),i=e.reset(t);e.render(()=>t.get_score());const c=u((s=!0)=>{const d=t.get_action(i,v.value),{state:l,reward:w,done:R}=e.step(d,t);return t.update(d,i,l,w),s&&(e.epoch%10===0?e.render(()=>t.get_score()):e.render()),i=l,R},"step"),o=u(()=>{i=e.reset(t),e.render(()=>t.get_score())},"reset"),a=n.input.number({label:"Resolution",min:2,max:100,value:r}),p=n.stepLoopButtons().init(()=>{t=new g(e,a.value),o()});n.input.button("Reset").on("click",o);const v=n.input.number({min:0,max:1,step:.01,value:.02});p.step(s=>{c()?setTimeout(()=>{o(),s&&setTimeout(s,10)}):s&&setTimeout(s,5)}).skip(()=>{c(!1)&&o()}),e.plotRewards(n.element)}u(k,"default");
