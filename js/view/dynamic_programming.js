import DPAgent from"../../lib/model/dynamic_programming.js";import Controller from"../controller.js";export default function(e){e.setting.ml.usage='Click "step" to update, click "move" to move agent.';const t=new Controller(e),o="grid"===e.type?Math.max(...e.env.size):20;let n=new DPAgent(e,o),r=e.reset(n);e.render((()=>n.get_score()));const s=t.input.number({label:"Resolution",min:2,max:100,value:o}),l=t.stepLoopButtons().init((()=>{n=new DPAgent(e,s.value),r=e.reset(n),e.render((()=>n.get_score()))})),i=t.select(["value","policy"]);l.step((()=>{n.update(i.value),e.render((()=>n.get_score()))})).epoch(),t.input.button("Reset").on("click",(()=>{r=e.reset(n),e.render((()=>n.get_score()))}));let c=!1;const u=t.input.button("Move").on("click",(()=>{c=!c,u.value=c?"Stop":"Mode",function t(){if(c){const o=n.get_action(r),{state:s}=e.step(o,n);e.render((()=>n.get_score())),r=s,setTimeout(t,10)}}()}));return()=>{c=!1}}