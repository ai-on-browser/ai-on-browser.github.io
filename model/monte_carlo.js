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
			const [_, gs] = this._q(this._state_index(cur_state), this._action_index(action))
			last_g = reward + this._gamma * last_g
			this._g[gs] = (last_g + this._g[gs] * this._epoch) / (this._epoch + 1)
			this._table[gs] = this._g[gs]
		}
		this._epoch++
	}
}

export default class MCAgent {
	constructor(env, resolution = 20) {
		this._table = new MCTable(env, resolution)
	}

	get_score(env) {
		return this._table.toArray()
	}

	get_action(env, state, greedy_rate = 0.5) {
		if (Math.random() > greedy_rate) {
			return this._table.best_action(state)
		} else {
			return env.sample_action(this)
		}
	}

	update(actions) {
		this._table.update(actions)
	}
}
