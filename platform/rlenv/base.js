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
		return this._platform.setting
	}

	get svg() {
		return this._platform.svg
	}

	set reward(value) {}

	init() {}

	close() {}

	reset(...agents) {}

	render(r) {}

	state(agent) {
		throw "Not implemented"
	}

	step(action, agent) {
		throw "Not implemented"
	}

	test(state, action, agent) {
		throw "Not implemented"
	}

	_grid() {
		return new GridWorld(this)
	}
}

export default class EmptyRLEnvironment extends RLEnvironmentBase {
	constructor() {
		super()
		this.actions = []
		this.states = []
		this.reward = null
	}

	reset() {
		return this.state
	}

	state() {
		return []
	}

	step() {
		return {
			state: this.state(),
			reward: 0,
			done: true
		}
	}

	test() {
		return {
			state: this.state(),
			reward: 0,
			done: true
		}
	}
}

class GridWorld {
	constructor(env) {
		this._env = env
		this._size = env._size
		this._r = env.platform.svg.select("g.grid-world")

		this._svg_size = [env.platform.height, env.platform.width]
		this._grid_size = [this._svg_size[0] / this._size[0], this._svg_size[1] / this._size[1]]

		if (this._r.size() === 0) {
			this._r = env.platform.svg.append("g")
				.classed("grid-world", true)
			this.reset()
		}
	}

	get gridSize() {
		return this._grid_size
	}

	reset() {
		this._r.selectAll("*").remove()
		this._grid = []
		for (let i = 0; i < this._size[0]; i++) {
			this._grid[i] = []
		}
	}

	at(i, j) {
		if (!this._grid[i][j]) {
			this._grid[i][j] = this._r.append("g")
				.style("transform", `scale(1, -1) translate(${j * this._grid_size[1]}px, ${-(i + 1) * this._grid_size[0]}px)`)
		}
		return this._grid[i][j]
	}

	close() {
		this._r.remove()
	}
}
