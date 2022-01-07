import{BasePlatform}from"./base.js";import EmptyRLEnvironment from"../../lib/rl/base.js";import GameManager from"./game/base.js";const LoadedRLEnvironmentClass={},AIEnv={MD:["grid","cartpole","mountaincar","acrobot","pendulum","maze","waterball","breaker"],GM:["reversi","draughts","gomoku"]};export default class RLPlatform extends BasePlatform{constructor(t,e,s){super(t,e),this._type="",this._epoch=0,this._env=new EmptyRLEnvironment,this._game=null,this._gridworld=null,this._is_updated_reward=!1,this._cumulativeReward=0,this._rewardHistory=[],this._load_env(s);const r=this.setting.task.configElement;r.append("span").text("Environment"),r.append("select").attr("name","env").on("change",(()=>{this._r.remove(),this._plotter&&this._plotter.terminate(),this.setting.rl.configElement.selectAll("*").remove(),this._type=r.select("[name=env]").property("value"),this.setting.vue.pushHistory(),this._load_env((()=>{this.setting.ml.refresh()}))})).selectAll("option").data(["",...AIEnv[this.task]]).enter().append("option").property("value",(t=>t)).text((t=>t))}get params(){return{env:this._type}}set params(t){t.env&&(this._type=t.env,this._load_env((()=>{this.setting.task.configElement.select("[name=env]").property("value",this._type)})))}get epoch(){return this._epoch}get actions(){return this._env.actions}get states(){return this._env.states}get type(){return this._type}get env(){return this._env}set reward(t){this._env.reward=t}_load_env(t){this._env&&this._env.close(),LoadedRLEnvironmentClass[this.type]?(this._env=new LoadedRLEnvironmentClass[this.type](this),this.init(),t(this)):""!==this.type?import(`./rlenv/${this.type}.js`).then((e=>{this._env=new e.default(this),LoadedRLEnvironmentClass[this.type]=e.default,this.init(),t(this)})):(this._env=new EmptyRLEnvironment,t(this))}cumulativeReward(t){return this._cumulativeReward}rewardHistory(t){return this._rewardHistory}init(){0===this.svg.select("g.rl-render").size()&&this.svg.insert("g",":first-child").classed("rl-render",!0),this._r=this.svg.select("g.rl-render"),this._r.selectAll("*").remove();const t=this.svg.node();this.svg.selectAll("g:not(.rl-render)").filter((function(){return this.parentNode===t})).style("visibility","hidden"),this._game&&this._game.terminate(),"GM"===this._task&&""!==this._type&&(this._game=new GameManager(this)),this._env.init?.(this._r)}reset(...t){return this._epoch=0,this._agents&&this._agents.some(((e,s)=>e!==t[s]))&&(this._is_updated_reward=!1,this._rewardHistory=[]),this._agents=t,this._is_updated_reward&&this._rewardHistory.push(this._cumulativeReward),this._is_updated_reward=!1,this._cumulativeReward=0,this._plotter&&(this._plotter.printEpisode(),this._plotter.printStep(),this._plotter.plotRewards()),this._env.reset(...t)}render(t){this._env.render?.(this._r,t)}terminate(){this._r.remove(),this.svg.selectAll("g").style("visibility",null),this._plotter?.terminate(),this._game?.terminate(),this._gridworld?.close(),this.setting.rl.configElement.selectAll("*").remove(),this.setting.task.configElement.selectAll("*").remove(),this._env.close(),super.terminate()}state(t){return this._env.state(t)}step(t,e){this._epoch++;const s=this._env.step(t,e);return this._is_updated_reward=!0,this._cumulativeReward+=s.reward,this._plotter&&(this._plotter.printEpisode(),this._plotter.printStep(),this._plotter.plotRewards()),s}test(t,e,s){return this._env.test(t,e,s)}sample_action(t){return this._env.sample_action(t)}plotRewards(t){this._plotter=new RewardPlotter(this,t),this._plotter.printEpisode(),this._plotter.printStep(),this._plotter.plotRewards()}_grid(){return this._gridworld||(this._gridworld=new GridWorld(this._env)),this._gridworld}}class RewardPlotter{constructor(t,e){this._platform=t,this._r=e.select("span.reward_plotarea"),0===this._r.size()&&(this._r=e.append("span").classed("reward_plotarea",!0)),this._r.style("white-space","nowrap"),this._plot_rewards_count=1e3,this._print_rewards_count=10,this._plot_smooth_window=20}terminate(){this._r.remove()}lastHistory(t=0){if(t<=0)return this._platform._rewardHistory;const e=this._platform._rewardHistory.length;return this._platform._rewardHistory.slice(Math.max(0,e-t),e)}printEpisode(){let t=this._r.select("span[name=episode]");0===t.size()&&(t=this._r.append("span").attr("name","episode")),t.text(" Episode: "+(this.lastHistory().length+1))}printStep(){let t=this._r.select("span[name=step]");0===t.size()&&(t=this._r.append("span").attr("name","step")),t.text(" Step: "+this._platform.epoch)}plotRewards(){const t=200;let e=this._r.select("svg"),s=null,r=null,i=null,a=null,n=null;0===e.size()?(e=this._r.append("svg").attr("width",400).attr("height",50),s=e.append("path").attr("name","value").attr("stroke","black").attr("fill-opacity",0),r=e.append("path").attr("name","smooth").attr("stroke","green").attr("fill-opacity",0),i=e.append("text").classed("mintxt",!0).attr("x",t).attr("y",50).attr("fill","red").attr("font-weight","bold"),a=e.append("text").classed("maxtxt",!0).attr("x",t).attr("y",12).attr("fill","red").attr("font-weight","bold"),n=e.append("text").classed("avetxt",!0).attr("x",t).attr("y",24).attr("fill","blue").attr("font-weight","bold")):(s=e.select("path[name=value]"),r=e.select("path[name=smooth]"),i=e.select("text.mintxt"),a=e.select("text.maxtxt"),n=e.select("text.avetxt"));const l=this.lastHistory(this._plot_rewards_count);if(0===l.length)return e.style("display","none"),s.attr("d",null),void r.attr("d",null);e.style("display",null);const h=Math.max(...l),o=Math.min(...l);if(i.text(`Min: ${o}`),a.text(`Max: ${h}`),n.text("Mean: "+l.reduce(((t,e)=>t+e),0)/l.length),h===o)return;const _=(e,s)=>[t*e/(l.length-1),50*(1-(s-o)/(h-o))],p=l.map(((t,e)=>_(e,t))),d=d3.line().x((t=>t[0])).y((t=>t[1]));s.attr("d",d(p));const m=[];for(let t=0;t<l.length-this._plot_smooth_window;t++){let e=0;for(let s=0;s<this._plot_smooth_window;s++)e+=l[t+s];m.push(_(t+this._plot_smooth_window,e/this._plot_smooth_window))}r.attr("d",d(m))}printRewards(){let t=this._r.select("span[name=reward]");0===t.size()&&(t=this._r.append("span").attr("name","reward")),t.text(" ["+this.lastHistory(this._print_rewards_count).reverse().join(",")+"]")}}class GridWorld{constructor(t){this._env=t,this._size=t._size,this._r=t._platform._r.select("g.grid-world"),this._svg_size=[t._platform.height,t._platform.width],this._grid_size=[this._svg_size[0]/this._size[0],this._svg_size[1]/this._size[1]],0===this._r.size()&&(this._r=t._platform._r.append("g").classed("grid-world",!0),this.reset())}get gridSize(){return this._grid_size}reset(){this._r.selectAll("*").remove(),this._grid=[];for(let t=0;t<this._size[0];t++)this._grid[t]=[]}at(t,e){return this._grid[t][e]||(this._grid[t][e]=this._r.append("g").style("transform",`scale(1, -1) translate(${e*this._grid_size[1]}px, ${-(t+1)*this._grid_size[0]}px)`)),this._grid[t][e]}close(){this._r.remove()}}