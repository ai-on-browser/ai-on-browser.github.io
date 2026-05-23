import { RLEnvironmentBase } from '../rl/base.js'
import NeuralNetwork from './neuralnetwork.js'

/**
 * @ignore
 * @typedef {import("./nns/graph").LayerObject} LayerObject
 */

const argmax = arr => {
	if (arr.length === 0) {
		return -1
	}
	return arr.indexOf(Math.max(...arr))
}

const normal_random = (m, s) => {
	const std = Math.sqrt(s)
	const x = Math.random()
	const y = Math.random()
	const X = Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y)
	const Y = Math.sqrt(-2 * Math.log(x)) * Math.sin(2 * Math.PI * y)
	return [X * std + m, Y * std + m]
}

class DDPG {
	// https://horomary.hatenablog.com/entry/2020/06/26/003806
	constructor(env, resolution = 20, layers = [], optimizer = 'sgd') {
		this._resolution = resolution
		this._states = env.states
		this._actions = env.actions
		this._action_sizes = env.actions.map(a => {
			if (Array.isArray(a)) {
				return a.length
			}
			return 1
		})
		this._gamma = 0.99
		this._tau = 0.001
		this._epoch = 0

		this._memory = []
		this._max_memory_size = 100000
		this._batch_size = 1000
		this._do_update_step = 10
		this._critic_layers = [
			{ type: 'input', name: 'state' },
			{ type: 'input', name: 'action' },
			{ type: 'concat', input: ['state', 'action'] },
			...layers,
			{ type: 'full', out_size: 1 },
			{ type: 'output', name: 'output' },
			{ type: 'mse' },
		]
		this._critic_net = NeuralNetwork.fromObject(this._critic_layers, null, optimizer)

		this._actor_net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'state' },
				...layers,
				{ type: 'full', out_size: this._action_sizes.reduce((s, v) => s * v, 1), name: 'action' },
				{
					type: 'include',
					net: this._critic_net,
					input_to: 'action',
					train: false,
				},
				{ type: 'identity', name: 'output' },
				{ type: 'mean' },
				{ type: 'negative' },
			],
			null,
			optimizer
		)
		this._target = null
	}

	get_best_action(state) {
		state = this._state_to_input(state)
		const data = this._actor_net.calc([state], undefined, ['action'])
		return this._actor_output_to_action(data.action.toArray()[0])
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

	_action_to_input(a) {
		const action = []
		for (let i = 0; i < a.length; i++) {
			if (Array.isArray(this._actions[i])) {
				for (let k = 0; k < this._actions[i].length; k++) {
					action.push(this._actions[i][k] === a[i] ? 1 : 0)
				}
			} else {
				action.push(a[i])
			}
		}
		return action
	}

	_actor_output_to_action(ao) {
		const action = []
		for (let i = 0; i < ao.length; i++) {
			if (Array.isArray(this._actions[i])) {
				action.push(this._actions[i][argmax(ao.slice(i, i + this._actions[i].length))])
				i += this._actions[i].length - 1
			} else {
				action.push(Math.min(this._actions[i].max, Math.max(this._actions[i].min, ao[i])))
			}
		}
		return action
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

		const a = this._actor_net.calc(this._states_data, undefined, ['action']).action.toArray()
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

	update(action, state, next_state, reward, learning_rate, batch) {
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

		return this._update(select_data, learning_rate, batch)
	}

	_update(data, learning_rate, batch) {
		const x = data.map(d => d[1])
		const next_x = data.map(d => d[2])
		const actions = data.map(d => this._action_to_input(d[0]))

		this._actor_net.fit({ state: x }, undefined, 1, learning_rate, batch)
		if (!this._target) {
			this._target = this._actor_net.copy()
		}

		const next_q = this._target.calc({ state: next_x }, undefined, ['output']).output.toArray()
		for (let i = 0; i < next_q.length; i++) {
			next_q[i][0] = data[i][3] + this._gamma * next_q[i][0]
		}
		const loss = this._critic_net.fit({ state: x, action: actions }, next_q, 1, learning_rate, batch)
		const targetValues = this._target.toObject()
		const actorValues = this._actor_net.toObject()
		const update = (t, a) => {
			if (t === a || typeof t === 'string') {
				return t
			}
			if (typeof t === 'number') {
				return this._tau * a + (1 - this._tau) * t
			}
			if (Array.isArray(t)) {
				return t.map((v, i) => update(v, a[i]))
			}
			const o = {}
			for (const k of Object.keys(t)) {
				o[k] = update(t[k], a[k])
			}
			return o
		}
		this._target = NeuralNetwork.fromObject(update(targetValues, actorValues))
		return loss[0]
	}
}

/**
 * Deep Deterministic Policy Gradient agent
 */
export default class DDPGAgent {
	/**
	 * @param {RLEnvironmentBase} env Environment
	 * @param {number} resolution Resolution of actions
	 * @param {LayerObject[]} layers Network layers
	 * @param {string} optimizer Optimizer of the network
	 */
	constructor(env, resolution, layers, optimizer) {
		this._env = env
		this._net = new DDPG(env, resolution, layers, optimizer)
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
	 * @param {number} factor Random factor
	 * @returns {*[]} Action
	 */
	get_action(state, factor) {
		const action = this._net.get_best_action(state)
		for (let i = 0; i < action.length; i++) {
			const ai = this._env.actions[i]
			if (Array.isArray(ai)) {
				if (factor >= Math.random()) {
					action[i] = ai[Math.floor(Math.random() * ai.length)]
				}
			} else {
				const max = ai.max
				const min = ai.min
				action[i] += normal_random(0, (factor * (max - min)) / 3.93)[0]
				action[i] = Math.min(max, Math.max(min, action[i]))
			}
		}
		return action
	}

	/**
	 * Update model.
	 * @param {*[]} action Action
	 * @param {*[]} state Current states
	 * @param {*[]} next_state Next states
	 * @param {number} reward Reward
	 * @param {number} learning_rate Learning rate
	 * @param {number} batch Batch size
	 * @returns {number=} Loss value
	 */
	update(action, state, next_state, reward, learning_rate, batch) {
		return this._net.update(action, state, next_state, reward, learning_rate, batch)
	}
}
