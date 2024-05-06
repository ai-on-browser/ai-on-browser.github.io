import Tensor from '../util/tensor.js'

import { RLEnvironmentBase, RLRealRange, RLIntRange } from '../rl/base.js'

/**
 * Base class for Q-table
 */
export class QTableBase {
	/**
	 * @param {RLEnvironmentBase} env Environment
	 * @param {number} [resolution] Resolution
	 */
	constructor(env, resolution = 20) {
		this._env = env
		this._resolution = resolution
		this._state_sizes = env.states.map(s => {
			if (Array.isArray(s)) {
				return s.length
			} else {
				return s.toArray(resolution).length
			}
		})
		this._action_sizes = env.actions.map(a => {
			if (Array.isArray(a)) {
				return a.length
			} else {
				return a.toArray(resolution).length
			}
		})
		this._sizes = [...this._state_sizes, ...this._action_sizes]
		this._tensor = new Tensor(this._sizes)
		this._table = this._tensor.value
	}

	/**
	 * Tensor
	 * @type {Tensor}
	 */
	get tensor() {
		return this._tensor
	}

	/**
	 * States
	 * @type {(*[] | RLRealRange | RLIntRange)[]}
	 */
	get states() {
		return this._env.states
	}

	/**
	 * Actions
	 * @type {(*[] | RLRealRange | RLIntRange)[]}
	 */
	get actions() {
		return this._env.actions
	}

	/**
	 * Resolution
	 * @type {number}
	 */
	get resolution() {
		return this._resolution
	}

	_state_index(state) {
		return state.map((s, i) => {
			const si = this.states[i]
			if (Array.isArray(si)) {
				return si.indexOf(s)
			} else if (si instanceof RLIntRange) {
				return si.indexOf(s, this.resolution)
			} else if (si instanceof RLRealRange) {
				return si.indexOf(s, this.resolution)
			} else {
				throw 'Not implemented'
			}
		})
	}

	_state_value(index) {
		return index.map((s, i) => {
			const si = this.states[i]
			if (Array.isArray(si)) {
				return si[s]
			} else if (si instanceof RLIntRange) {
				return si.toArray(this.resolution)[s]
			} else if (si instanceof RLRealRange) {
				return (s * (si.max - si.min)) / this.resolution + si.min
			} else {
				throw 'Not implemented'
			}
		})
	}

	_action_index(action) {
		return action.map((a, i) => {
			const ai = this.actions[i]
			if (Array.isArray(ai)) {
				return ai.indexOf(a)
			} else if (ai instanceof RLRealRange) {
				return ai.indexOf(a, this.resolution)
			} else {
				throw 'Not implemented'
			}
		})
	}

	_action_value(index) {
		return index.map((a, i) => {
			const ai = this.actions[i]
			if (Array.isArray(ai)) {
				return ai[a]
			} else if (ai instanceof RLRealRange) {
				return (a * (ai.max - ai.min)) / this.resolution + ai.min
			} else {
				throw 'Not implemented'
			}
		})
	}

	_to_position(size, index) {
		let s = 0
		for (let i = 0; i < index.length; i++) {
			s = s * size[i] + index[i]
		}
		let e = s + 1
		for (let i = index.length; i < size.length; i++) {
			s *= size[i]
			e *= size[i]
		}
		return [s, e]
	}

	_to_index(size, position) {
		const a = Array(size.length)
		for (let i = size.length - 1; i >= 0; i--) {
			a[i] = position % size[i]
			position = Math.floor(position / size[i])
		}
		return a
	}

	_q(state, action) {
		if (!action) {
			const [s, e] = this._to_position(this._sizes, state)
			return [this._table.slice(s, e), [s, e]]
		}
		const [s] = this._to_position(this._sizes, [...state, ...action])
		return [this._table[s], s]
	}

	/**
	 * Returns Q-table as array.
	 * @returns {*[]} Nested array
	 */
	toArray() {
		return this._tensor.toArray()
	}

	/**
	 * Returns the best action.
	 * @param {*[]} state Current states
	 * @returns {*[]} Action
	 */
	best_action(state) {
		const [q] = this._q(this._state_index(state))
		const mv = Math.max(...q)
		const midx = []
		for (let i = 0; i < q.length; i++) {
			if (q[i] === mv) midx.push(i)
		}
		let m = midx[Math.floor(Math.random() * midx.length)]
		const a = this._to_index(this._action_sizes, m)
		return this._action_value(a)
	}
}

class QTable extends QTableBase {
	constructor(env, resolution = 20, alpha = 0.2, gamma = 0.99) {
		super(env, resolution)
		this._alpha = alpha
		this._gamma = gamma
	}

	update(action, state, next_state, reward) {
		action = this._action_index(action)
		state = this._state_index(state)
		next_state = this._state_index(next_state)

		const [next_q] = this._q(next_state)
		const next_max_q = Math.max(...next_q)

		const [q_value, qs] = this._q(state, action)

		this._table[qs] += this._alpha * (reward + this._gamma * next_max_q - q_value)
	}
}

/**
 * Q-learning agent
 */
export default class QAgent {
	/**
	 * @param {RLEnvironmentBase} env Environment
	 * @param {number} [resolution] Resolution
	 */
	constructor(env, resolution = 20) {
		this._env = env
		this._table = new QTable(env, resolution)
	}

	/**
	 * Returns a score.
	 * @returns {Array<Array<Array<number>>>} Score values
	 */
	get_score() {
		return this._table.toArray()
	}

	/**
	 * Returns a action.
	 * @param {*[]} state Current states
	 * @param {number} greedy_rate Greedy rate
	 * @returns {*[]} Action
	 */
	get_action(state, greedy_rate = 0.002) {
		if (Math.random() > greedy_rate) {
			return this._table.best_action(state)
		} else {
			return this._env.sample_action(this)
		}
	}

	/**
	 * Update model.
	 * @param {*[]} action Action
	 * @param {*[]} state Current state
	 * @param {*[]} next_state Next state
	 * @param {number} reward Reward
	 */
	update(action, state, next_state, reward) {
		this._table.update(action, state, next_state, reward)
	}
}
