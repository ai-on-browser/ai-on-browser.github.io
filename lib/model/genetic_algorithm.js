import { QTableBase } from './q_learning.js'

class GeneticPTable extends QTableBase {
	constructor(env, resolution = 20) {
		super(env, resolution)

		this._s = this._action_sizes.reduce((p, v) => p * v, 1)
		for (let i = 0; i < this._table.length; i += this._s) {
			const t = Math.floor(Math.random() * this._s)
			this._table[i + t] = 1
		}
	}

	copy(dst) {
		const t = dst || new GeneticPTable(this._env, this.resolution)
		for (let i = 0; i < this._tensor.length; i++) {
			t._table[i] = this._table[i]
		}
		return t
	}

	mutation(rate) {
		for (let i = 0; i < this._table.length; i += this._s) {
			if (Math.random() < rate) {
				for (let j = 0; j < this._s; j++) {
					this._table[i + j] = 0
				}
				const t = Math.floor(Math.random() * this._s)
				this._table[i + t] = 1
			}
		}
	}

	mix(other, rate) {
		for (let i = 0; i < this._table.length; i += this._s) {
			if (Math.random() < rate) {
				for (let j = 0; j < this._s; j++) {
					this._table[i + j] = other._table[i + j]
				}
			}
		}
	}

	mixCopy(other, rate, dst) {
		const t = this.copy(dst)
		t.mix(other, rate)
		return t
	}
}

class GeneticQTable extends QTableBase {
	constructor(env, resolution = 20) {
		super(env, resolution)
		for (let i = 0; i < this._tensor.length; i++) {
			this._tensor.value[i] = Math.random() * 2 - 1
		}
	}

	copy(dst) {
		const t = dst || new GeneticQTable(this._env, this.resolution)
		for (let i = 0; i < this._tensor.length; i++) {
			t._table[i] = this._table[i]
		}
		return t
	}

	mutation(rate) {
		for (let i = 0; i < this._table.length; i++) {
			if (Math.random() < rate) {
				this._table[i] = Math.random() * 2 - 1
			}
		}
	}

	mix(other, rate) {
		for (let i = 0; i < this._table.length; i++) {
			if (Math.random() < rate) {
				this._table[i] = other._table[i]
			}
		}
	}

	mixCopy(other, rate, dst) {
		const t = this.copy(dst)
		t.mix(other, rate)
		return t
	}
}

class GeneticAlgorithmAgent {
	constructor(env, resolution = 20, table = null) {
		this._env = env
		this._resolution = resolution
		this._table = table || new GeneticPTable(env, resolution)
		this._total_reward = 0
		this._max_epoch = 1000
	}

	get total_reward() {
		return this._total_reward
	}

	reset() {
		this._total_reward = 0
	}

	get_score() {
		return this._table.toArray()
	}

	get_action(state) {
		return this._table.best_action(state)
	}

	run(env) {
		let cur_state = env.reset(this)
		let c = 0
		while (c++ < this._max_epoch) {
			const action = this.get_action(cur_state)
			const { state, reward, done } = env.step(action, this)
			cur_state = state
			this._total_reward += reward
			if (done) break
		}
	}

	mutation() {
		this._table.mutation(0.005)
	}

	mix(other) {
		this._table.mix(other._table, 0.5)
	}

	mixCopy(other, dst) {
		return new GeneticAlgorithmAgent(
			this._env,
			this._resolution,
			this._table.mixCopy(other._table, 0.5, dst._table)
		)
	}
}

/**
 * Genetic algorithm generation
 */
export default class GeneticAlgorithmGeneration {
	/**
	 * @param {RLEnvironmentBase} env
	 * @param {number} [size=100]
	 * @param {number} [resolution=20]
	 */
	constructor(env, size = 100, resolution = 20) {
		this._env = env
		this._size = size
		this._resolution = resolution
		this._agents = []
		for (let i = 0; i < size; i++) {
			this._agents.push(new GeneticAlgorithmAgent(env, resolution))
		}
	}

	/**
	 * Reset all agents.
	 */
	reset() {
		this._agents.forEach(a => a.reset())
	}

	/**
	 * Returns a score.
	 *
	 * @returns {Array<Array<Array<number>>>}
	 */
	get_score() {
		return this._agents[0].get_score()
	}

	/**
	 * Returns the best score agent.
	 *
	 * @returns {GeneticAlgorithmAgent}
	 */
	top_agent() {
		return this._agents[0]
	}

	/**
	 * Run for all agents.
	 */
	run() {
		this.reset()
		this._agents.forEach(a => {
			a.run(this._env)
		})
		this._agents.sort((a, b) => b._total_reward - a._total_reward)
	}

	/**
	 * Update agent to new generation.
	 *
	 * @param {number} mutation_rate
	 */
	next(mutation_rate = 0.001) {
		const next_agents = []
		for (let i = 0; i < this._size; i++) {
			if (Math.random() < (this._size - i * 2) / this._size) {
				next_agents.push(this._agents[i])
			} else {
				const s = Math.floor(Math.random() * i)
				let t = Math.floor(Math.random() * (i - 1))
				if (t >= s) t++
				next_agents[i] = this._agents[s].mixCopy(this._agents[t], this._agents[i])
			}
		}
		for (let i = 0; i < next_agents.length; i++) {
			if (Math.random() < mutation_rate) {
				next_agents[i].mutation()
			}
		}
		this._agents = next_agents
	}
}
