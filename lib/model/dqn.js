import { RLEnvironmentBase, RLRealRange } from '../rl/base.js'
import NeuralNetwork from './neuralnetwork.js'

/**
 * @ignore
 * @typedef {import("./nns/graph").LayerObject} LayerObject
 */

const argmax = function (arr) {
	if (arr.length === 0) {
		return -1
	}
	return arr.indexOf(Math.max(...arr))
}

class DQN {
	// https://qiita.com/sugulu/items/bc7c70e6658f204f85f9
	constructor(env, resolution = 20, layers = [], optimizer = 'sgd') {
		this._resolution = resolution
		this._states = env.states
		this._actions = env.actions
		this._action_sizes = env.actions.map(a => {
			if (Array.isArray(a)) {
				return a.length
			} else {
				return resolution
			}
		})
		this._gamma = 0.99
		this._epoch = 0
		this._method = 'DQN'

		this._memory = []
		this._max_memory_size = 100000
		this._batch_size = 1000
		this._do_update_step = 10
		this._fix_param_update_step = 1000
		this._layers = [{ type: 'input' }]
		this._layers.push(...layers)
		this._layers.push(
			{ type: 'full', out_size: this._action_sizes.reduce((s, v) => s * v, 1) },
			{ type: 'output', name: 'output' },
			{ type: 'huber' }
		)
		this._target = null
		this._net = NeuralNetwork.fromObject(this._layers, null, optimizer)
	}

	set method(value) {
		this._method = value
		if (value === 'DQN' && this._target) {
			this._target = null
		}
	}

	get_best_action(state) {
		state = this._state_to_input(state)
		const data = this._net.calc([state])
		return this._pos_action(argmax(data.toArray()[0]))
	}

	_state_to_input(s) {
		const state = []
		for (let i = 0; i < s.length; i++) {
			if (Array.isArray(this._states[i])) {
				for (let k = 0; k < this._states[i].length; k++) {
					state.push(this._states[i][k] === s[i] ? 1 : 0)
				}
			} else {
				state.push(s[i])
			}
		}
		return state
	}

	get_score() {
		if (!this._states_data) {
			const state_sizes = this._states.map(s => s.toArray(this._resolution).length)
			this._states_data = []
			const next_idx = n => {
				for (let i = 0; i < n.length; i++) {
					n[i]++
					if (n[i] < state_sizes[i]) return true
					n[i] = 0
				}
				return false
			}

			const state = Array(this._states.length).fill(0)
			do {
				this._states_data.push([].concat(state))
			} while (next_idx(state))
		}

		const a = this._net.calc(this._states_data).toArray()
		const d = []
		const m = this._states.length
		for (let i = 0; i < this._states_data.length; i++) {
			let di = d
			for (let k = 0; k < m - 1; k++) {
				if (!di[this._states_data[i][k]]) di[this._states_data[i][k]] = []
				di = di[this._states_data[i][k]]
			}
			di[this._states_data[i][m - 1]] = a[i]
		}
		return d
	}

	_action_pos(action) {
		let i = 0
		for (let k = 0; k < action.length; k++) {
			i = i * this._action_sizes[k]
			if (Array.isArray(this._actions[k])) {
				i += this._actions[k].indexOf(action[k])
			} else if (this._actions[k] instanceof RLRealRange) {
				i += this._actions[k].indexOf(action[k], this._resolution)
			} else {
				throw 'Not implemented'
			}
		}
		return i
	}

	_pos_action(i) {
		const action = []
		for (let k = this._action_sizes.length - 1; k >= 0; k--) {
			const p = i % this._action_sizes[k]
			i = Math.floor(i / this._action_sizes[k])
			if (Array.isArray(this._actions[k])) {
				action.unshift(this._actions[k][p])
			} else if (this._actions[k] instanceof RLRealRange) {
				action.unshift(this._actions[k].toArray(this._resolution)[p])
			} else {
				throw 'Not implemented'
			}
		}
		return action
	}

	update(action, state, next_state, reward, done, learning_rate, batch) {
		const rstate = this._state_to_input(state)
		const rnstate = this._state_to_input(next_state)
		this._memory.push([action, rstate, rnstate, reward])
		if (this._memory.length < this._batch_size) {
			return
		} else if (this._memory.length > this._max_memory_size) {
			this._memory.shift()
		}

		if (++this._epoch % this._do_update_step > 0) {
			return
		}

		const idx = []
		for (let i = 0; i < this._batch_size; i++) {
			let r = Math.floor(Math.random() * (this._memory.length - i))
			let j = 0
			for (; j < idx.length && idx[j] <= r; j++, r++);
			idx.splice(j, 0, r)
		}
		const select_data = idx.map(i => this._memory[i])

		if (this._method === 'DDQN') {
			return this._update_ddqn(select_data, learning_rate, batch)
		} else {
			return this._update_dqn(select_data, learning_rate, batch)
		}
	}

	_update_dqn(data, learning_rate, batch) {
		const x = data.map(d => d[1])
		const next_x = data.map(d => d[2])
		const xx = [].concat(x, next_x)

		const est_q = this._net.calc(xx).toArray()
		const q = est_q.slice(0, x.length)
		const next_q = est_q.slice(x.length)
		for (let i = 0; i < q.length; i++) {
			const a_idx = this._action_pos(data[i][0])
			q[i][a_idx] = data[i][3] + this._gamma * Math.max(...next_q[i])
		}
		const loss = this._net.fit(x, q, 1, learning_rate, batch)
		return loss[0]
	}

	_update_ddqn(data, learning_rate, batch) {
		const x = data.map(d => d[1])
		const next_x = data.map(d => d[2])
		const xx = [].concat(x, next_x)

		const est_q = this._net.calc(xx).toArray()
		const q = est_q.slice(0, x.length)
		const next_q = est_q.slice(x.length)

		const next_t_q = (this._target || this._net).calc(next_x).toArray()
		for (let i = 0; i < q.length; i++) {
			const a_idx = this._action_pos(data[i][0])
			q[i][a_idx] = data[i][3] + this._gamma * next_t_q[i][argmax(next_q[i])]
		}
		const loss = this._net.fit(x, q, 1, learning_rate, batch)
		if (this._epoch % this._fix_param_update_step === 0) {
			this._target = this._net.copy()
		}
		return loss[0]
	}
}

/**
 * Deep Q-Network agent
 */
export default class DQNAgent {
	/**
	 * @param {RLEnvironmentBase} env Environment
	 * @param {number} resolution Resolution of actions
	 * @param {LayerObject[]} layers Network layers
	 * @param {string} optimizer Optimizer of the network
	 */
	constructor(env, resolution, layers, optimizer) {
		this._env = env
		this._net = new DQN(env, resolution, layers, optimizer)
	}

	/**
	 * DQN Method
	 * @param {'DQN' | 'DDQN'} value New method name
	 */
	set method(value) {
		this._net.method = value
	}

	terminate() {}

	/**
	 * Returns a score.
	 * @returns {Array<Array<Array<number>>>} Score values
	 */
	get_score() {
		return this._net.get_score()
	}

	/**
	 * Returns a action.
	 * @param {*[]} state Current states
	 * @param {number} greedy_rate Greedy rate
	 * @returns {*[]} Action
	 */
	get_action(state, greedy_rate = 0.002) {
		if (Math.random() > greedy_rate) {
			return this._net.get_best_action(state)
		} else {
			return this._env.sample_action(this)
		}
	}

	/**
	 * Update model.
	 * @param {*[]} action Action
	 * @param {*[]} state Current states
	 * @param {*[]} next_state Next states
	 * @param {number} reward Reward
	 * @param {boolean} done Done epoch or not
	 * @param {number} learning_rate Learning rate
	 * @param {number} batch Batch size
	 * @returns {number=} Loss value
	 */
	update(action, state, next_state, reward, done, learning_rate, batch) {
		return this._net.update(action, state, next_state, reward, done, learning_rate, batch)
	}
}
