import { RLEnvironmentBase } from '../rl/base.js'
import { QTableBase } from './q_learning.js'

class SARSATable extends QTableBase {
	constructor(env, resolution = 20, alpha = 0.2, gamma = 0.99) {
		super(env, resolution)
		this._alpha = alpha
		this._gamma = gamma
	}

	update(action, state, next_action, next_state, reward) {
		action = this._action_index(action)
		state = this._state_index(state)
		next_action = this._action_index(next_action)
		next_state = this._state_index(next_state)

		const [next_q_value] = this._q(next_state, next_action)
		const [q_value, qs] = this._q(state, action)

		this._table[qs] += this._alpha * (reward + this._gamma * next_q_value - q_value)
	}
}

/**
 * SARSA agent
 */
export default class SARSAAgent {
	/**
	 * @param {RLEnvironmentBase} env Environment
	 * @param {number} [resolution] Resolution
	 */
	constructor(env, resolution = 20) {
		this._env = env
		this._table = new SARSATable(env, resolution)
	}

	/**
	 * Reset agent.
	 */
	reset() {
		this._last_action = null
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
	get_action(state, greedy_rate = 0.002) {
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
	 * @param {*[]} state Current states
	 * @param {*[]} next_state Next states
	 * @param {number} reward Reward
	 */
	update(action, state, next_state, reward) {
		if (this._last_action) {
			this._table.update(this._last_action, this._last_state, action, state, this._last_reward)
		}
		this._last_action = action
		this._last_state = state
		this._last_reward = reward
	}
}
