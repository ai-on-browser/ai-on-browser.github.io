import { RLRealRange } from '../platform/rlenv/base.js'
import NeuralNetwork from './neuralnetwork.js'

const argmax = function (arr, key) {
	if (arr.length == 0) {
		return -1
	}
	arr = key ? arr.map(key) : arr
	return arr.indexOf(Math.max(...arr))
}

class DQNWorker extends BaseWorker {
	constructor() {
		super('model/worker/neuralnetwork_worker.js', { type: 'module' })
	}

	initialize(layers, optimizer, cb) {
		this._postMessage(
			{
				mode: 'init',
				layers: layers,
				optimizer: optimizer,
			},
			cb
		)
	}

	fit(id, train_x, train_y, iteration, rate, batch, cb) {
		this._postMessage(
			{
				id: id,
				mode: 'fit',
				x: train_x,
				y: train_y,
				iteration: iteration,
				batch_size: batch,
				rate: rate,
			},
			cb
		)
	}

	predict(id, x, cb) {
		this._postMessage(
			{
				id: id,
				mode: 'predict',
				x: x,
			},
			cb
		)
	}

	remove(id) {
		this._postMessage({
			id: id,
			mode: 'close',
		})
	}

	copy(id, cb) {
		this._postMessage(
			{
				id: id,
				mode: 'copy',
			},
			cb
		)
	}
}

class DQNNoWorker {
	constructor() {
		this._models = {}
	}

	initialize(layers, optimizer, cb) {
		const id = Math.random().toString(32).substring(2)
		this._models[id] = new NeuralNetwork(layers, null, optimizer)
		Promise.resolve().then(() => cb && cb({ data: id }))
	}

	fit(id, train_x, train_y, iteration, rate, batch, cb) {
		this._models[id].fit(train_x, train_y, iteration, rate, batch)
		cb && cb()
	}

	predict(id, x, cb) {
		const t = this._models[id].calc(x).toArray()
		cb && cb({ data: t })
	}

	remove(id) {
		delete this._models[id]
	}

	copy(id, cb) {
		const id0 = Math.random().toString(32).substring(2)
		this._models[id0] = this._models[id].copy()
		cb && cb({ data: id0 })
	}

	terminate() {
		this._models = {}
	}
}

class DQN {
	// https://qiita.com/sugulu/items/bc7c70e6658f204f85f9
	constructor(env, resolution = 20, layers = [], optimizer = 'sgd', use_worker = false, cb) {
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
		this._use_worker = use_worker

		this._memory = []
		this._max_memory_size = 100000
		this._batch_size = 10
		this._do_update_step = 10
		this._fix_param_update_step = 1000
		this._layers = [{ type: 'input' }]
		this._layers.push(...layers)
		this._layers.push(
			{ type: 'full', out_size: this._action_sizes.reduce((s, v) => s * v, 1) },
			{ type: 'output', name: 'output' },
			{ type: 'huber' }
		)
		this._net = this._use_worker ? new DQNWorker() : new DQNNoWorker()
		this._target_id = null
		this._net.initialize(this._layers, optimizer, e => {
			this._id = e.data
			cb && cb()
		})
	}

	set method(value) {
		this._method = value
		if (value === 'DQN' && this._target_id) {
			this._net.remove(this._target_id)
			this._target_id = null
		}
	}

	terminate() {
		this._net.terminate()
	}

	get_best_action(state, cb) {
		state = this._state_to_input(state)
		this._net.predict(this._id, [state], e => {
			const data = e.data
			cb([argmax(data[0])])
		})
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

	get_score(cb) {
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

			let p = 0
			const state = Array(this._states.length).fill(0)
			do {
				this._states_data.push([].concat(state))
			} while (next_idx(state))
		}

		this._net.predict(this._id, this._states_data, e => {
			const a = e.data
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
			cb && cb(d)
		})
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

	update(action, state, next_state, reward, done, learning_rate, batch, cb) {
		const rstate = this._state_to_input(state)
		const rnstate = this._state_to_input(next_state)
		this._memory.push([action, rstate, rnstate, reward])
		if (this._memory.length < this._batch_size) {
			cb && cb()
			return
		} else if (this._memory.length > this._max_memory_size) {
			this._memory.shift()
		}

		if (++this._epoch % this._do_update_step > 0) {
			cb && cb()
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
			this._update_ddqn(select_data, learning_rate, batch, cb)
		} else {
			this._update_dqn(select_data, learning_rate, batch, cb)
		}
	}

	_update_dqn(data, learning_rate, batch, cb) {
		const x = data.map(d => d[1])
		const next_x = data.map(d => d[2])
		const xx = [].concat(x, next_x)
		this._net.predict(this._id, xx, e => {
			const q = e.data.slice(0, x.length)
			const next_q = e.data.slice(x.length)
			for (let i = 0; i < q.length; i++) {
				const a_idx = this._action_pos(data[i][0])
				q[i][a_idx] = data[i][3] + this._gamma * Math.max(...next_q[i])
			}
			this._net.fit(this._id, x, q, 1, learning_rate, batch, cb)
		})
	}

	_update_ddqn(data, learning_rate, batch, cb) {
		const x = data.map(d => d[1])
		const next_x = data.map(d => d[2])
		const xx = [].concat(x, next_x)
		this._net.predict(this._id, xx, e => {
			const q = e.data.slice(0, x.length)
			const next_q = e.data.slice(x.length)
			this._net.predict(this._target_id || this._id, next_x, e => {
				const next_t_q = e.data
				for (let i = 0; i < q.length; i++) {
					const a_idx = this._action_pos(data[i][0])
					q[i][a_idx] = data[i][3] + this._gamma * next_t_q[i][argmax(next_q[i])]
				}
				this._net.fit(this._id, x, q, 1, learning_rate, batch, () => {
					if (this._epoch % this._fix_param_update_step) {
						this._net.copy(this._id, e => {
							this._net.remove(this._target_id)
							this._target_id = e.data
							cb && cb()
						})
					} else {
						cb && cb()
					}
				})
			})
		})
	}
}

export default class DQAgent {
	constructor(env, resolution, layers, optimizer, use_worker, cb) {
		this._net = new DQN(env, resolution, layers, optimizer, use_worker, cb)
	}

	set method(value) {
		this._net.method = value
	}

	terminate() {
		this._net.terminate()
	}

	get_score(env, cb) {
		return this._net.get_score(cb)
	}

	get_action(env, state, greedy_rate = 0.002, cb) {
		if (Math.random() > greedy_rate) {
			this._net.get_best_action(state, cb)
		} else {
			cb(env.sample_action(this))
		}
	}

	update(action, state, next_state, reward, done, learning_rate, batch, cb) {
		this._net.update(action, state, next_state, reward, done, learning_rate, batch, cb)
	}
}
