var m=Object.defineProperty;var u=(e,n)=>m(e,"name",{value:n,configurable:!0});import a from"../../lib/model/monte_carlo.js";import x from"../controller.js";export default function C(e){e.setting.ml.usage='Click "step" to update.';const n=new x(e),r=e.type==="grid"?Math.max(...e.env.size):20;let t=new a(e,r),i=e.reset(t);e.render(()=>t.get_score());const c=u((s=!0)=>{const l=t.get_action(i,v.value),{state:w,reward:R,done:d}=e.step(l,t);return t.update(l,i,R,d),s&&e.render(),i=w,d},"step"),o=u(()=>{i=e.reset(t),t.reset(),e.render(()=>t.get_score())},"reset"),g=n.input.number({label:"Resolution",min:2,max:100,value:r}),p=n.stepLoopButtons().init(()=>{t=new a(e,g.value),o()});n.input.button("Reset").on("click",o);const v=n.input.number({min:0,max:1,step:.01,value:.5});p.step(s=>{c()?setTimeout(()=>{o(),s&&setTimeout(s,10)}):s&&setTimeout(s,5)}).skip(()=>{c(!1)&&o()}),e.plotRewards(n.element)}u(C,"default");
