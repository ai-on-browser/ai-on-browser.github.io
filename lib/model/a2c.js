import { RLRealRange } from '../rl/base.js'
import NeuralNetwork from './neuralnetwork.js'

class ActorCriticNet {
	// https://horomary.hatenablog.com/entry/2020/05/30/163441
	// https://ailog.site/2019/10/31/torch13/
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
		this._advanced_step = 5

		this._memory = []
		this._max_memory_size = 100000
		this._batch_size = 1000
		this._do_update_step = 10
		this._layers = [{ type: 'input', name: 'state' }]
		this._layers.push(...layers)
		this._layers.push(
			{ type: 'linear', name: 'd' },
			{ type: 'full', out_size: 1, name: 'value' },
			{ type: 'full', out_size: this._action_sizes.reduce((s, v) => s * v, 1), input: ['d'], name: 'actor' },

			{ type: 'softmax', name: 'prob' },
			{ type: 'log', name: 'log_prob' },
			{ type: 'input', name: 'action' },
			{ type: 'mult', input: ['log_prob', 'action'] },
			{ type: 'sum', axis: 1, name: 'action_log_prob' },
			{ type: 'mult', input: ['log_prob', 'prob'] },
			{ type: 'sum', axis: 1 },
			{ type: 'mean' },
			{ type: 'negative', name: 'entropy' },

			{ type: 'input', name: 'reward' },
			{ type: 'sub', input: ['reward', 'value'], name: 'advantages' },
			{ type: 'power', n: 2 },
			{ type: 'mean', name: 'value_loss' },

			{ type: 'detach', input: ['advantages'], name: 'detach_adv' },
			{ type: 'mult', input: ['action_log_prob', 'detach_adv'] },
			{ type: 'mean', name: 'action_gain' },

			{ type: 'mult', input: [0.5, 'value_loss'], name: 'value_c' },
			{ type: 'mult', input: [0.01, 'entropy'], name: 'entropy_c' },
			{ type: 'sub', input: ['value_c', 'action_gain', 'entropy_c'] },

			{ type: 'mean' }
		)
		this._net = new NeuralNetwork(this._layers, null, optimizer)
	}

	get_action(state) {
		state = this._state_to_input(state)
		const data = this._net.calc([state], null, ['prob'])
		const prob = data.prob.toArray()[0]
		let r = Math.random()
		for (let i = 0; i < prob.length; i++) {
			r -= prob[i]
			if (r < 0) {
				return [i]
			}
		}
		return [0]
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

	get_score(state) {
		if (state) {
			return this._net
				.calc(
					state.map(s => this._state_to_input(s)),
					null,
					['value']
				)
				.value.toArray()
		}
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

		const a = this._net.calc(this._states_data, null, ['prob']).prob.toArray()
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

	update(states, actions, rewards, learning_rate, batch) {
		states = states.map(s => this._state_to_input(s))
		actions = actions.map(a => {
			const i = this._action_pos(a)
			const lst = Array(this._action_sizes.reduce((s, v) => s * v, 1)).fill(0)
			lst[i] = 1
			return lst
		})
		this._net.fit({ state: states, action: actions, reward: rewards }, null, 1, learning_rate, batch)
	}
}

/**
 * A2C agent
 */
export default class A2CAgent {
	/**
	 * @param {RLEnvironmentBase} env
	 * @param {number} resolution
	 * @param {number} procs
	 * @param {Record<string, *>[]} layers
	 * @param {string} optimizer
	 */
	constructor(env, resolution, procs, layers, optimizer) {
		this._net = new ActorCriticNet(env, resolution, layers, optimizer)
		this._procs = procs
		this._env = env.env
		this._advanced_step = 5
		this._gamma = 0.99

		this._init_states = []
		for (let i = 0; i < 1000; i++) {
			this._init_states.push(this._env.reset())
		}
		this._states = []
		for (let i = 0; i < this._procs; i++) {
			this._states[i] = this._env.reset()
		}
	}

	terminate() {}

	/**
	 * Returns a score.
	 * @param {RLEnvironmentBase} env
	 * @returns {Array<Array<Array<number>>>}
	 */
	get_score(env) {
		return this._net.get_score()
	}

	/**
	 * Returns a action.
	 * @param {RLEnvironmentBase} env
	 * @param {*[]} state
	 * @returns {*[]}
	 */
	get_action(env, state) {
		return this._net.get_action(state)
	}

	/**
	 * Update model.
	 * @param {*[]} action
	 * @param {*[]} state
	 * @param {*[]} next_state
	 * @param {number} reward
	 * @param {boolean} done
	 * @param {number} learning_rate
	 * @param {number} batch
	 */
	update(action, state, next_state, reward, done, learning_rate, batch) {
		const actions = []
		const states = []
		const next_states = []
		const rewards = []
		const dones = []
		for (let i = 0; i < this._advanced_step; i++) {
			for (let k = 0; k < this._procs; k++) {
				const action = this._net.get_action(this._states[k])
				const info = this._env.test(this._states[k], action)
				;(actions[k] ||= []).push(action)
				;(states[k] ||= []).push(this._states[k])
				;(next_states[k] ||= []).push(info.state)
				;(rewards[k] ||= []).push(info.reward)
				;(dones[k] ||= []).push(info.done)

				if (info.done) {
					this._states[k] = this._init_states.pop()
				} else {
					this._states[k] = info.state
				}
			}
		}

		const score = this._net.get_score(next_states.map(s => s[s.length - 1]))
		const returns = []
		for (let k = 0; k < this._procs; k++) {
			returns[k] = []
			returns[k][this._advanced_step - 1] = score[k][0]
		}

		for (let i = this._advanced_step - 2; i >= 0; i--) {
			for (let k = 0; k < this._procs; k++) {
				returns[k][i] = rewards[k][i]
				if (!dones[k][i]) {
					returns[k][i] += returns[k][i + 1] * this._gamma
				}
			}
		}

		this._net.update(
			states.flat(1),
			actions.flat(1),
			returns.flat(1).map(v => [v]),
			learning_rate,
			batch
		)

		if (done) {
			while (this._init_states.length < 1000) {
				this._init_states.push(this._env.reset())
			}
		}
	}
}