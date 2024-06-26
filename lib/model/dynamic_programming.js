import { RLEnvironmentBase } from '../rl/base.js'
import { QTableBase } from './q_learning.js'

class DPTable extends QTableBase {
	// https://blog.monochromegane.com/blog/2020/01/30/memo-getting-start-reinformation-learning-algorithm/
	// https://qiita.com/MENDY/items/77608bb0561c4630d971
	constructor(env, resolution = 20, gamma = 0.9) {
		super(env, resolution)
		let length = this._state_sizes.reduce((s, v) => s * v, 1)
		this._v = Array(length).fill(0)
		this._gamma = gamma
	}

	_step_index(size, index) {
		for (let i = 0; i < index.length; i++) {
			index[i]++
			if (index[i] < size[i]) {
				return true
			}
			index[i] = 0
		}
		return false
	}

	update(method = 'value') {
		if (method === 'value') {
			this.valueIteration()
		} else {
			this.policyIteration()
		}
	}

	policyIteration() {
		const lastV = [].concat(this._v)
		const lastQ = [].concat(this._table)
		const greedy_rate = 0.05

		const x = Array(this.states.length).fill(0)
		const a = Array(this.actions.length)
		do {
			let vs = []
			a.fill(0)
			do {
				const { state, reward } = this._env.test(this._state_value(x), this._action_value(a))
				const y = this._state_index(state)
				const [s] = this._to_position(this._state_sizes, y)
				const v = reward + this._gamma * lastV[s]
				const [, ps] = this._q(x, a)
				this._table[ps] = v
				vs.push([v, lastQ[ps]])
			} while (this._step_index(this._action_sizes, a))
			const [s] = this._to_position(this._state_sizes, x)

			let maxv = -Infinity
			let maxi = -1
			for (let i = 0; i < vs.length; i++) {
				if (vs[i][1] > maxv) {
					maxv = vs[i][1]
					maxi = i
				}
			}
			this._v[s] = vs.reduce(
				(s, v, i) => s + v[0] * (i === maxi ? 1 - greedy_rate : greedy_rate / (vs.length - 1)),
				0
			)
		} while (this._step_index(this._state_sizes, x))
	}

	valueIteration() {
		const lastV = [].concat(this._v)

		const x = Array(this.states.length).fill(0)
		const a = Array(this.actions.length)
		do {
			let max_v = -Infinity
			a.fill(0)
			const x_state = this._state_value(x)
			do {
				const { state, reward } = this._env.test(x_state, this._action_value(a))
				const y = this._state_index(state)
				const [s] = this._to_position(this._state_sizes, y)
				const v = reward + this._gamma * lastV[s]
				const [, ps] = this._q(x, a)
				this._table[ps] = v
				max_v = Math.max(v, max_v)
			} while (this._step_index(this._action_sizes, a))
			const [s] = this._to_position(this._state_sizes, x)
			this._v[s] = max_v
		} while (this._step_index(this._state_sizes, x))
	}
}

/**
 * Dynamic programming agent
 */
export default class DPAgent {
	/**
	 * @param {RLEnvironmentBase} env Environment
	 * @param {number} [resolution] Resolution
	 */
	constructor(env, resolution = 20) {
		this._table = new DPTable(env, resolution)
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
	 * @returns {*[]} Action
	 */
	get_action(state) {
		return this._table.best_action(state)
	}

	/**
	 * Update model.
	 * @param {'value' | 'policy'} method Method name
	 */
	update(method) {
		this._table.update(method)
	}
}
