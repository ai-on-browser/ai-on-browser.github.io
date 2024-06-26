/**
 * Real number range state/actioin
 */
export class RLRealRange {
	/**
	 * @param {number} min Minimum value
	 * @param {number} max Maximum value
	 */
	constructor(min, max) {
		this.min = min
		this.max = max
	}

	/**
	 * Returns spaces.
	 * @param {number} resolution Resolution value
	 * @returns {number[]} Representative value
	 */
	toSpace(resolution) {
		const r = [this.min]
		const d = (this.max - this.min) / resolution
		for (let i = 1; i < resolution; i++) {
			r.push(this.min + i * d)
		}
		r.push(this.max)
		return r
	}

	/**
	 * Returns array.
	 * @param {number} resolution Resolution value
	 * @returns {number[]} Array of center values
	 */
	toArray(resolution) {
		const s = this.toSpace(resolution)
		return s.slice(1).map((v, i) => (v + s[i]) / 2)
	}

	/**
	 * Returns index of the value.
	 * @param {number} value Check value
	 * @param {number} resolution Resolution value
	 * @returns {number} Index of the value
	 */
	indexOf(value, resolution) {
		if (value <= this.min) return 0
		if (value >= this.max) return resolution - 1
		return Math.floor(((value - this.min) / (this.max - this.min)) * resolution)
	}
}

/**
 * Integer number range state/actioin
 */
export class RLIntRange {
	/**
	 * @param {number} min Minimum value
	 * @param {number} max Maximum value
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
	 * @param {number} resolution Resolution value
	 * @returns {number[]} Representative value
	 */
	toArray(resolution) {
		const r = []
		if (this.length <= resolution) {
			for (let i = this.min; i <= this.max; r.push(i++));
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
	 * @param {number} value Check value
	 * @param {number} resolution Resolution value
	 * @returns {number} Index of the value
	 */
	indexOf(value, resolution) {
		if (this.length <= resolution) {
			return Math.max(0, Math.min(this.length - 1, Math.round(value - this.min)))
		}
		if (value <= this.min) return 0
		if (value >= this.max) return resolution - 1
		return Math.floor(((value - this.min) / (this.max - this.min)) * resolution)
	}
}

/**
 * Base class for reinforcement learning environment
 * @property {(*[] | RLRealRange | RLIntRange)[]} actions Action variables
 * @property {(*[] | RLRealRange | RLIntRange)[]} states States variables
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
	 * @param {object} value Reward object
	 */
	set reward(value) {}

	/**
	 * Returns cloned environment.
	 * @returns {RLEnvironmentBase} Cloned environment
	 */
	clone() {
		const obj = Object.create(Object.getPrototypeOf(this))
		const deepcopy = value => {
			if (value === null) {
				return null
			} else if (Array.isArray(value)) {
				return value.map(v => deepcopy(v))
			} else if (typeof value === 'object') {
				const o = Object.create(Object.getPrototypeOf(value))
				for (const k in value) {
					o[k] = deepcopy(value[k])
				}
				return o
			}
			return value
		}
		for (const key in this) {
			obj[key] = deepcopy(this[key])
		}
		return obj
	}

	/**
	 * Reset environment.
	 */
	reset() {
		this._epoch = 0
	}

	/**
	 * Returns current state.
	 * @param {*} agent Agent
	 * @returns {*[]} Current state
	 */
	state(agent) {
		throw 'Not implemented'
	}

	/**
	 * Set new state.
	 * @param {*[]} state New state
	 * @param {*} agent Agent
	 */
	setState(state, agent) {
		throw 'Not implemented'
	}

	/**
	 * Do action and returns new state.
	 * @param {*[]} action Actions to be performed by the agent
	 * @param {*} agent Agent
	 * @returns {{state: *[], reward: number, done: boolean, invalid?: boolean}} state, reward, done
	 */
	step(action, agent) {
		const state = this.state(agent)
		const info = this.test(state, action, agent)
		if (!info.invalid) {
			this._epoch++
			this.setState(info.state, agent)
		}
		return info
	}

	/**
	 * Do actioin without changing environment and returns new state.
	 * @param {*[]} state Environment state
	 * @param {*[]} action Actions to be performed by the agent
	 * @param {*} agent Agent
	 * @returns {{state: *[], reward: number, done: boolean, invalid?: boolean}} state, reward, done
	 */
	test(state, action, agent) {
		throw 'Not implemented'
	}

	/**
	 * Sample an action.
	 * @param {*} agent Agent
	 * @returns {*[]} Sampled action
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
		return this.state()
	}

	state() {
		return []
	}

	setState() {}

	test() {
		return {
			state: this.state(),
			reward: 0,
			done: true,
		}
	}
}
