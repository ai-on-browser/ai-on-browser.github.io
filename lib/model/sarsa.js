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

export default class SARSAAgent {
	constructor(env, resolution = 20) {
		this._table = new SARSATable(env, resolution)
	}

	reset() {
		this._last_action = null
	}

	get_score(env) {
		return this._table.toArray()
	}

	get_action(env, state, greedy_rate = 0.002) {
		if (Math.random() > greedy_rate) {
			return this._table.best_action(state)
		} else {
			return env.sample_action(this)
		}
	}

	update(action, state, next_state, reward) {
		if (this._last_action) {
			this._table.update(this._last_action, this._last_state, action, state, this._last_reward)
		}
		this._last_action = action
		this._last_state = state
		this._last_reward = reward
	}
}