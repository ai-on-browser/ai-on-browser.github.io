import { BasePlatform } from './base.js'
import EmptyRLEnvironment, { RLRealRange } from './rlenv/base.js'

const LoadedRLEnvironmentClass = {}

export default class RLPlatform extends BasePlatform {
	constructor(task, manager, cb) {
		super(task, manager)
		const type = this._type = this.setting.rl.environmentName;
		this._epoch = 0;
		this._env = new EmptyRLEnvironment()

		this._is_updated_reward = false
		this._cumulativeReward = 0
		this._rewardHistory = []

		this.init();
		if (LoadedRLEnvironmentClass[type]) {
			this._env = new LoadedRLEnvironmentClass[type](this)
			this.init()
			cb(this)
		} else if (type !== '') {
			import(`./rlenv/${type}.js`).then(m => {
				this._env = new m.default(this);
				LoadedRLEnvironmentClass[type] = m.default
				this.init()
				cb(this)
			})
		} else {
			cb(this)
		}
	}

	get epoch() {
		return this._epoch;
	}

	get actions() {
		return this._env.actions;
	}

	get states() {
		return this._env.states;
	}

	get type() {
		return this._type;
	}

	get state() {
		return this._env.state;
	}

	get env() {
		return this._env
	}

	set reward(value) {
		this._env.reward = value;
	}

	cumulativeReward(agent) {
		return this._cumulativeReward
	}

	rewardHistory(agent) {
		return this._rewardHistory
	}

	init() {
		if (this.svg.select("g.rl-render").size() === 0) {
			this.svg.insert("g", ":first-child").classed("rl-render", true);
		}
		this._r = this.svg.select("g.rl-render");
		this._r.selectAll("*").remove();

		const svgNode = this.svg.node();
		this.svg.selectAll("g:not(.rl-render)").filter(function() {
			return this.parentNode === svgNode
		}).style("visibility", "hidden");

		this._env.init(this._r)
	}

	reset(...agents) {
		this._epoch = 0;
		this._agents = agents;

		if (this._is_updated_reward) {
			this._rewardHistory.push(this._cumulativeReward)
		}
		this._is_updated_reward = false
		this._cumulativeReward = 0
		if (this._plotter) {
			this._plotter.printRewards(10)
			this._plotter.plotRewards(1000)
		}

		return this._env.reset(...agents);
	}

	render(best_action) {
		this._env.render(this._r, best_action);
	}

	clean() {
		this._r.remove();
		this.svg.selectAll("g").style("visibility", null);
	}

	terminate() {
		this.clean();
		this.setting.rl.configElement.selectAll("*").remove();
		this._env.close();
	}

	step(action, agent) {
		this._epoch++;
		const [state, reward, done] = this._env.step(action, agent);
		this._is_updated_reward = true
		this._cumulativeReward += reward
		return [state, reward, done]
	}

	test(state, action, agent) {
		return this._env.test(state, action, agent);
	}

	sample_action(agent) {
		return this.actions.map(action => {
			if (Array.isArray(action)) {
				return action[Math.floor(Math.random() * action.length)];
			} else if (action instanceof RLRealRange) {
				return Math.random() * (action.max - action.min) + action.min
			}
		})
	}

	plotRewards(r) {
		this._plotter = new RewardPlotter(this, r)
		this._plotter.printRewards(10)
		this._plotter.plotRewards(1000)
	}
}

class RewardPlotter {
	constructor(platform, r) {
		this._platform = platform
		this._r = r
		this._r = r.select("span.reward_plotarea")
		if (this._r.size() === 0) {
			this._r = r.append("span").classed("reward_plotarea", true)
		}
	}

	lastHistory(length = 0) {
		if (length <= 0) {
			return this._platform._rewardHistory
		}
		const historyLength = this._platform._rewardHistory.length
		return this._platform._rewardHistory.slice(Math.max(0, historyLength - length), historyLength)
	}

	plotRewards(length = 100) {
		const width = 200
		const height = 50
		let svg = this._r.select("svg")
		let path = null
		let mintxt = null
		let maxtxt = null
		if (svg.size() === 0) {
			svg = this._r.append("svg")
				.attr("width", width)
				.attr("height", height)
			path = svg.append("path").attr("stroke", "black").attr("fill-opacity", 0)
			mintxt = svg.append("text").classed("mintxt", true).attr("x", 0).attr("y", height).attr("fill", "red")
			maxtxt = svg.append("text").classed("maxtxt", true).attr("x", 0).attr("y", 12).attr("fill", "red")
		} else {
			path = svg.select("path")
			mintxt = svg.select("text.mintxt")
			maxtxt = svg.select("text.maxtxt")
		}
		const lastHistory = this.lastHistory(length)
		const maxr = Math.max(...lastHistory)
		const minr = Math.min(...lastHistory)
		mintxt.text(minr)
		maxtxt.text(maxr)
		if (maxr === minr) return

		const p = lastHistory.map((v, i) => [width * i / lastHistory.length, (1 - (v - minr) / (maxr - minr)) * height])

		const line = d3.line().x(d => d[0]).y(d => d[1]);
		path.attr("d", line(p));
	}

	printRewards(length = 10) {
		let span = this._r.select("span")
		if (span.size() === 0) {
			span = this._r.append("span")
		}
		span.text(" [" + this.lastHistory(length).reverse().join(",") + "]")
	}
}

