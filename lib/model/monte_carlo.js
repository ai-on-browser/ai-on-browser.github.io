import { RLEnvironmentBase } from '../rl/base.js'
import { QTableBase } from './q_learning.js'

class MCTable extends QTableBase {
	constructor(env, resolution = 20, gamma = 0.99) {
		super(env, resolution)
		this._g = Array(this._table.length).fill(0)
		this._epoch = 0
		this._gamma = gamma
	}

	update(actions) {
		let last_g = 0
		for (let i = actions.length - 1; i >= 0; i--) {
			const [action, cur_state, reward] = actions[i]
			const [, gs] = this._q(this._state_index(cur_state), this._action_index(action))
			last_g = reward + this._gamma * last_g
			this._g[gs] = (last_g + this._g[gs] * this._epoch) / (this._epoch + 1)
			this._table[gs] = this._g[gs]
		}
		this._epoch++
	}
}

/**
 * Monte Carlo agent
 */
export default class MCAgent {
	/**
	 * @param {RLEnvironmentBase} env Environment
	 * @param {number} [resolution] Resolution
	 */
	constructor(env, resolution = 20) {
		this._env = env
		this._table = new MCTable(env, resolution)

		this._history = []
	}

	/**
	 * Reset agent.
	 */
	reset() {
		this._history = []
	}

	/**
	 * Returns a score.
	 *
	 * @returns {Array<Array<Array<number>>>} Score values
	 */
	get_score() {
		return this._table.toArray()
	}

	/**
	 * Returns a action.
	 *
	 * @param {*[]} state Current states
	 * @param {number} greedy_rate Greedy rate
	 * @returns {*[]} Action
	 */
	get_action(state, greedy_rate = 0.5) {
		if (Math.random() > greedy_rate) {
			return this._table.best_action(state)
		} else {
			return this._env.sample_action(this)
		}
	}

	/**
	 * Update model.
	 *
	 * @param {*[]} action Action
	 * @param {*[]} state Next state
	 * @param {number} reward Reward
	 * @param {boolean} done Done epoch or not
	 */
	update(action, state, reward, done) {
		this._history.push([action, state, reward])
		if (done) {
			this._table.update(this._history)
			this._history = []
		}
	}
}
