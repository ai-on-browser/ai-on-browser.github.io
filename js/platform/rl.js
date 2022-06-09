import{BasePlatform,LossPlotter}from"./base.js";import EmptyRLEnvironment from"../../lib/rl/base.js";import GameManager from"./game/base.js";import RLRenderer from"../renderer/rl.js";const LoadedRLEnvironmentClass={},AIEnv={MD:["grid","cartpole","mountaincar","acrobot","pendulum","maze","waterball","breaker"],GM:["reversi","draughts","gomoku"]};export default class RLPlatform extends BasePlatform{constructor(t,e,s){super(t,e),this._type="",this._epoch=0,this._env=new EmptyRLEnvironment,this._game=null,this._is_updated_reward=!1,this._cumulativeReward=0,this._rewardHistory=[],this._renderer.terminate(),this._renderer=new RLRenderer(e),this._load_env(s);const r=this.setting.task.configElement;r.appendChild(document.createTextNode("Environment"));const i=document.createElement("select");i.name="env",i.onchange=()=>{this._plotter&&this._plotter.terminate(),this.setting.rl.configElement.replaceChildren(),this._type=i.value,this.setting.vue.pushHistory(),this._load_env((()=>{this.setting.ml.refresh()}))},i.appendChild(document.createElement("option"));for(const t of AIEnv[this.task]){const e=document.createElement("option");e.value=t,e.innerText=t,i.appendChild(e)}r.appendChild(i)}get params(){return{env:this._type}}set params(t){t.env&&this._type!==t.env&&(this._type=t.env,this._load_env((()=>{const t=this.setting.task.configElement.querySelector("[name=env]");t&&(t.value=this._type)})))}get epoch(){return this._epoch}get actions(){return this._env.actions}get states(){return this._env.states}get type(){return this._type}get env(){return this._env}set reward(t){this._env.reward=t}_load_env(t){this._env&&this._env.close(),LoadedRLEnvironmentClass[this.type]?(this._env=new LoadedRLEnvironmentClass[this.type](this.width,this.height),this.init(),t(this)):""!==this.type?import(`../../lib/rl/${this.type}.js`).then((e=>{this._env=new e.default(this.width,this.height),LoadedRLEnvironmentClass[this.type]=e.default,this.init(),t(this)})):(this._env=new EmptyRLEnvironment,t(this))}cumulativeReward(t){return this._cumulativeReward}rewardHistory(t){return this._rewardHistory}init(){this._game&&this._game.terminate(),"GM"===this._task&&""!==this._type&&(this._game=new GameManager(this)),this._loss&&(this._loss.terminate(),this._loss=null),this._renderer.init()}reset(...t){return this._epoch=0,this._agents&&this._agents.some(((e,s)=>e!==t[s]))&&(this._is_updated_reward=!1,this._rewardHistory=[],this._loss&&(this._loss.terminate(),this._loss=null)),this._agents=t,this._is_updated_reward&&this._rewardHistory.push(this._cumulativeReward),this._is_updated_reward=!1,this._cumulativeReward=0,this._plotter&&(this._plotter.printEpisode(),this._plotter.printStep(),this._plotter.plotRewards()),this._env.reset(...t)}render(t){this._renderer.render(t)}terminate(){this._plotter?.terminate(),this._game?.terminate(),this.setting.rl.configElement.replaceChildren(),this.setting.task.configElement.replaceChildren(),this._env.close(),super.terminate()}state(t){return this._env.state(t)}step(t,e){this._epoch++;const s=this._env.step(t,e);return this._is_updated_reward=!0,this._cumulativeReward+=s.reward,this._plotter&&(this._plotter.printEpisode(),this._plotter.printStep(),this._plotter.plotRewards()),s}test(t,e,s){return this._env.test(t,e,s)}sample_action(t){return this._env.sample_action(t)}plotRewards(t){this._plotter=new RewardPlotter(this,t),this._plotter.printEpisode(),this._plotter.printStep(),this._plotter.plotRewards()}plotLoss(t){this._loss||(this._loss=new LossPlotter(this,this.setting.footer)),this._loss.add(t)}}class RewardPlotter{constructor(t,e){this._platform=t,this._r=e.select("span.reward_plotarea"),0===this._r.size()&&(this._r=e.append("span").classed("reward_plotarea",!0)),this._r.style("white-space","nowrap"),this._plot_rewards_count=1e3,this._print_rewards_count=10,this._plot_smooth_window=20}terminate(){this._r.remove()}lastHistory(t=0){if(t<=0)return this._platform._rewardHistory;const e=this._platform._rewardHistory.length;return this._platform._rewardHistory.slice(Math.max(0,e-t),e)}printEpisode(){let t=this._r.select("span[name=episode]");0===t.size()&&(t=this._r.append("span").attr("name","episode")),t.text(" Episode: "+(this.lastHistory().length+1))}printStep(){let t=this._r.select("span[name=step]");0===t.size()&&(t=this._r.append("span").attr("name","step")),t.text(" Step: "+this._platform.epoch)}plotRewards(){const t=200;let e=this._r.select("svg"),s=null,r=null,i=null,n=null,a=null;0===e.size()?(e=this._r.append("svg").attr("width",400).attr("height",50),s=e.append("path").attr("name","value").attr("stroke","black").attr("fill-opacity",0),r=e.append("path").attr("name","smooth").attr("stroke","green").attr("fill-opacity",0),i=e.append("text").classed("mintxt",!0).attr("x",t).attr("y",50).attr("fill","red").attr("font-weight","bold"),n=e.append("text").classed("maxtxt",!0).attr("x",t).attr("y",12).attr("fill","red").attr("font-weight","bold"),a=e.append("text").classed("avetxt",!0).attr("x",t).attr("y",24).attr("fill","blue").attr("font-weight","bold")):(s=e.select("path[name=value]"),r=e.select("path[name=smooth]"),i=e.select("text.mintxt"),n=e.select("text.maxtxt"),a=e.select("text.avetxt"));const o=this.lastHistory(this._plot_rewards_count);if(0===o.length)return e.style("display","none"),s.attr("d",null),void r.attr("d",null);e.style("display",null);const h=Math.max(...o),l=Math.min(...o);if(i.text(`Min: ${l}`),n.text(`Max: ${h}`),a.text("Mean: "+o.reduce(((t,e)=>t+e),0)/o.length),h===l)return;const p=(e,s)=>[t*e/(o.length-1),50*(1-(s-l)/(h-l))],_=o.map(((t,e)=>p(e,t))),d=d3.line().x((t=>t[0])).y((t=>t[1]));s.attr("d",d(_));const m=[];for(let t=0;t<o.length-this._plot_smooth_window;t++){let e=0;for(let s=0;s<this._plot_smooth_window;s++)e+=o[t+s];m.push(p(t+this._plot_smooth_window,e/this._plot_smooth_window))}r.attr("d",d(m))}printRewards(){let t=this._r.select("span[name=reward]");0===t.size()&&(t=this._r.append("span").attr("name","reward")),t.text(" ["+this.lastHistory(this._print_rewards_count).reverse().join(",")+"]")}}