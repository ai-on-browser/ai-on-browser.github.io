export class RLRealRange {
	constructor(min, max, space = 'equal') {
		this.min = min
		this.max = max
		this._space = space
	}

	toSpace(resolution) {
		const r = [this.min]
		if (this._space === 'equal') {
			const d = (this.max - this.min) / resolution
			for (let i = 1; i < resolution; i++) {
				r.push(this.min + i * d)
			}
		} else if (this._space === 'log') {
			const odd = resolution % 2
			const n = Math.floor((resolution - 1) / 2)
			let max = this.max
			let min = this.min
			const m = []
			for (let i = 0; i < n; i++) {
				r.push((min /= 3))
				m.push((max /= 3))
			}
			if (!odd) r.push(0)
			for (let i = 0; i < n; i++) {
				r.push(m[n - i - 1])
			}
		}
		r.push(this.max)
		return r
	}

	toArray(resolution) {
		const s = this.toSpace(resolution)
		return s.slice(1).map((v, i) => (v + s[i]) / 2)
	}

	indexOf(value, resolution) {
		if (value <= this.min) return 0
		if (value >= this.max) return resolution - 1
		if (this._space === 'equal') {
			return Math.floor(((value - this.min) / (this.max - this.min)) * resolution)
		} else {
			const s = this.toSpace(resolution)
			for (let i = 0; i < s.length - 1; i++) {
				if (value < s[i + 1]) return i
			}
			return s.length - 1
		}
	}
}

export class RLIntRange {
	constructor(min, max) {
		this.min = min
		this.max = max
	}

	get length() {
		return this.max - this.min + 1
	}

	toArray(resolution) {
		const r = []
		if (this.length <= resolution) {
			for (let i = this.min; i <= this.max; r[i] = i++);
		} else {
			const d = (this.max - this.min) / (resolution - 1)
			for (let i = 0; i < resolution - 1; i++) {
				r[i] = this.min + Math.round(i * d)
			}
			r.push(this.max)
		}
		return r
	}

	indexOf(value, resolution) {
		if (this.length <= resolution) {
			return Math.round(value - this.min)
		}
		if (value <= this.min) return 0
		if (value >= this.max) return resolution - 1
		return Math.floor(((value - this.min) / (this.max - this.min)) * resolution)
	}
}

export class RLEnvironmentBase {
	constructor() {
		this._epoch = 0
	}

	get epoch() {
		return this._epoch
	}

	set reward(value) {}

	close() {}

	reset(...agents) {
		this._epoch = 0
	}

	state(agent) {
		throw 'Not implemented'
	}

	step(action, agent) {
		this._epoch++
	}

	test(state, action, agent) {
		throw 'Not implemented'
	}

	sample_action(agent) {
		return this.actions.map(action => {
			if (Array.isArray(action)) {
				return action[Math.floor(Math.random() * action.length)]
			} else if (action instanceof RLRealRange) {
				return Math.random() * (action.max - action.min) + action.min
			}
		})
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
			done: true,
		}
	}

	test() {
		return {
			state: this.state(),
			reward: 0,
			done: true,
		}
	}
}
