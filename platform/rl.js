import { BasePlatform } from './base.js'

export class RLRealRange {
	constructor(min, max, space = 'equal') {
		this.min = min;
		this.max = max;
		this._space = space;
	}

	toSpace(resolution) {
		const r = [this.min];
		if (this._space === 'equal') {
			const d = (this.max - this.min) / resolution;
			for (let i = 1; i < resolution; i++) {
				r.push(this.min + i * d);
			}
		} else if (this._space === 'log') {
			const odd = resolution % 2;
			const n = Math.floor((resolution - 1) / 2);
			let max = this.max;
			let min = this.min;
			const m = [];
			for (let i = 0; i < n; i++) {
				r.push(min /= 3);
				m.push(max /= 3);
			}
			if (!odd) r.push(0);
			for (let i = 0; i < n; i++) {
				r.push(m[n - i - 1]);
			}
		}
		r.push(this.max);
		return r
	}

	toArray(resolution) {
		const s = this.toSpace(resolution);
		return s.slice(1).map((v, i) => (v + s[i]) / 2);
	}

	indexOf(value, resolution) {
		if (value <= this.min) return 0;
		if (value >= this.max) return resolution - 1;
		if (this._space === 'equal') {
			return Math.floor((value - this.min) / (this.max - this.min) * resolution)
		} else {
			const s = this.toSpace(resolution);
			for (let i = 0; i < s.length - 1; i++) {
				if (value < s[i + 1]) return i;
			}
			return s.length - 1;
		}
	}
}

export class RLIntRange {
	constructor(min, max) {
		this.min = min;
		this.max = max;
	}

	get length() {
		return this.max - this.min + 1;
	}

	toArray(resolution) {
		const r = [];
		if (this.length <= resolution) {
			for (let i = this.min; i <= this.max; r[i] = i++);
		} else {
			const d = (this.max - this.min) / (resolution - 1);
			for (let i = 0; i < resolution - 1; i++) {
				r[i] = this.min + Math.round(i * d);
			}
			r.push(this.max);
		}
		return r;
	}

	indexOf(value, resolution) {
		if (this.length <= resolution) {
			return Math.round(value - this.min);
		}
		if (value <= this.min) return 0;
		if (value >= this.max) return resolution - 1;
		return Math.floor((value - this.min) / (this.max - this.min) * resolution)
	}
}

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
		if (this._svg.select("g.rl-render").size() === 0) {
			this._svg.insert("g", ":first-child").classed("rl-render", true);
		}
		this._r = this._svg.select("g.rl-render");
		this._r.selectAll("*").remove();

		const svgNode = this._svg.node();
		this._svg.selectAll("g:not(.rl-render)").filter(function() {
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
		this._svg.selectAll("g").style("visibility", null);
	}

	terminate() {
		this.clean();
		this._setting.rl.configElement.selectAll("*").remove();
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

export class RLEnvironmentBase {
	constructor(platform) {
		this._platform = platform
	}

	get epoch() {
		return this._platform.epoch
	}

	get platform() {
		return this._platform
	}

	get setting() {
		return this._platform._setting
	}

	get svg() {
		return this._platform._svg
	}

	set reward(value) {}

	init() {}

	close() {}

	reset(...agents) {}

	render(r) {}

	step(action, agent) {
		throw "Not implemented"
	}

	test(state, action, agent) {
		throw "Not implemented"
	}
}

class EmptyRLEnvironment extends RLEnvironmentBase {
	constructor() {
		super()
		this.actions = []
		this.states = []
		this.state = []
		this.reward = null
	}

	reset() {
		return this.state
	}

	step() {
		return [this.state, 0, true]
	}

	test() {
		return [this.state, 0, true]
	}
}

