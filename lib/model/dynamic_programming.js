import { QTableBase } from './q_learning.js'

const argmax = function (arr, key) {
	if (arr.length === 0) {
		return -1
	}
	arr = key ? arr.map(key) : arr
	return arr.indexOf(Math.max(...arr))
}

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
				let [y, reward, done] = this._env.test(this._state_value(x), this._action_value(a))
				y = this._state_index(y)
				const [s, e] = this._to_position(this._state_sizes, y)
				const v = reward + this._gamma * lastV[s]
				const [_, ps] = this._q(x, a)
				this._table[ps] = v
				vs.push([v, lastQ[ps]])
			} while (this._step_index(this._action_sizes, a))
			const [s, e] = this._to_position(this._state_sizes, x)
			const maxi = argmax(vs, v => v[1])
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
				let [y, reward, done] = this._env.test(x_state, this._action_value(a))
				y = this._state_index(y)
				const [s, e] = this._to_position(this._state_sizes, y)
				const v = reward + this._gamma * lastV[s]
				const [_, ps] = this._q(x, a)
				this._table[ps] = v
				max_v = Math.max(v, max_v)
			} while (this._step_index(this._action_sizes, a))
			const [s, e] = this._to_position(this._state_sizes, x)
			this._v[s] = max_v
		} while (this._step_index(this._state_sizes, x))
	}
}

/**
 * Dynamic programming agent
 */
export default class DPAgent {
	/**
	 * @param {RLEnvironmentBase} env
	 * @param {number} resolution
	 */
	constructor(env, resolution = 20) {
		this._table = new DPTable(env, resolution)
	}

	/**
	 * Returns a score.
	 * @returns {Array<Array<Array<number>>>}
	 */
	get_score() {
		return this._table.toArray()
	}

	/**
	 * Returns a action.
	 * @param {*[]} state
	 * @returns {*[]}
	 */
	get_action(state) {
		return this._table.best_action(state)
	}

	/**
	 * Update model.
	 * @param {'value' | 'policy'} method
	 */
	update(method) {
		this._table.update(method)
	}
}
