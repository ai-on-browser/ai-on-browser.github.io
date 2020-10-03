import { BasePlatform } from './base.js'
import EmptyRLEnvironment, { RLRealRange } from './rlenv/base.js'

const LoadedRLEnvironmentClass = {}

export default class RLPlatform extends BasePlatform {
	constructor(task, manager, cb) {
		super(task, manager)
		const type = this._type = this.setting.rl.environmentName;
		this._epoch = 0;
		this._env = new EmptyRLEnvironment()
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
		return this._env.step(action, agent);
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
}

