/**
 * Real number range state/actioin
 */
export class RLRealRange {
	/**
	 * @param {number} min
	 * @param {number} max
	 * @param {'equal' | 'log'} space
	 */
	constructor(min, max, space = 'equal') {
		this.min = min
		this.max = max
		this._space = space
	}

	/**
	 * Returns spaces.
	 * @param {number} resolution
	 * @returns {number[]}
	 */
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

	/**
	 * Returns array.
	 * @param {number} resolution
	 * @returns {number[]}
	 */
	toArray(resolution) {
		const s = this.toSpace(resolution)
		return s.slice(1).map((v, i) => (v + s[i]) / 2)
	}

	/**
	 * Returns index of the value.
	 * @param {number} value
	 * @param {number} resolution
	 * @returns {number}
	 */
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

/**
 * Integer number range state/actioin
 */
export class RLIntRange {
	/**
	 * @param {number} min
	 * @param {number} max
	 */
	constructor(min, max) {
		this.min = min
		this.max = max
	}

	/**
	 * Length
	 * @type {number}
	 */
	get length() {
		return this.max - this.min + 1
	}

	/**
	 * Returns array.
	 * @param {number} resolution
	 * @returns {number[]}
	 */
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

	/**
	 * Returns index of the value.
	 * @param {number} value
	 * @param {number} resolution
	 * @returns {number}
	 */
	indexOf(value, resolution) {
		if (this.length <= resolution) {
			return Math.round(value - this.min)
		}
		if (value <= this.min) return 0
		if (value >= this.max) return resolution - 1
		return Math.floor(((value - this.min) / (this.max - this.min)) * resolution)
	}
}

/**
 * Base class for reinforcement learning environment
 * @property {(*[] | RLRealRange | RLIntRange)[]} actions
 * @property {(*[] | RLRealRange | RLIntRange)[]} states
 */
export class RLEnvironmentBase {
	constructor() {
		this._epoch = 0
	}

	/**
	 * Epoch
	 * @type {number}
	 */
	get epoch() {
		return this._epoch
	}

	/**
	 * Reward
	 * @param {object} value
	 */
	set reward(value) {}

	/**
	 * Close environment.
	 */
	close() {}

	/**
	 * Reset environment.
	 * @param  {...*} agents
	 */
	reset(...agents) {
		this._epoch = 0
	}

	/**
	 * Returns current state.
	 * @param {*} agent
	 * @returns {*[]}
	 */
	state(agent) {
		throw 'Not implemented'
	}

	/**
	 * Do action and returns new state.
	 * @param {*[]} action
	 * @param {*} agent
	 * @returns {[*[], number, boolean]} state, reward, done
	 */
	step(action, agent) {
		this._epoch++
	}

	/**
	 * Do actioin without changing environment and returns new state.
	 * @param {*[]} state
	 * @param {*[]} action
	 * @param {*} agent
	 * @returns {[*[], number, boolean]} state, reward, done
	 */
	test(state, action, agent) {
		throw 'Not implemented'
	}

	/**
	 * Sample an action.
	 * @param {*} agent
	 * @returns {*[]}
	 */
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

/**
 * Empty environment
 */
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
