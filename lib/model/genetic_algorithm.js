import { RLEnvironmentBase } from '../rl/base.js'
import { QTableBase } from './q_learning.js'

/**
 * @typedef {object} GeneticModel
 * @property {function(...*): void} run Run model
 * @property {function(): GeneticModel} mutation Returns mutated model
 * @property {function(GeneticModel): GeneticModel} mix Returns mixed model
 * @property {function(): number} score Returns a number how good the model is
 */
/**
 * Genetic algorithm
 */
class GeneticAlgorithm {
	/**
	 * @param {number} size Number of models per generation
	 * @param {new () => GeneticModel} model Function to generate the model
	 */
	constructor(size, model) {
		this._size = size
		this._models = []
		for (let i = 0; i < size; i++) {
			this._models.push(new model())
		}
	}

	/**
	 * Models
	 * @type {GeneticModel[]}
	 */
	get models() {
		return this._models
	}

	/**
	 * The best model.
	 * @returns {GeneticModel} Best model
	 */
	get bestModel() {
		return this._models[0]
	}

	/**
	 * Run for all models.
	 * @param {...*} args Arguments for run
	 */
	run(...args) {
		for (let i = 0; i < this._models.length; i++) {
			this._models[i].run(...args)
		}
		const modelsScore = this._models.map(v => [v, v.score()])
		modelsScore.sort((a, b) => b[1] - a[1])
		this._models = modelsScore.map(v => v[0])
	}

	/**
	 * Update models to new generation.
	 * @param {number} [mutation_rate] Mutation rate
	 */
	next(mutation_rate = 0.001) {
		const nextModels = []
		for (let i = 0; i < this._size; i++) {
			if (Math.random() < (this._size - i * 2) / this._size) {
				nextModels.push(this._models[i])
			} else {
				const s = Math.floor(Math.random() * i)
				let t = Math.floor(Math.random() * (i - 1))
				if (t >= s) t++
				nextModels[i] = this._models[s].mix(this._models[t])
			}
		}
		for (let i = 0; i < nextModels.length; i++) {
			if (Math.random() < mutation_rate) {
				nextModels[i] = nextModels[i].mutation()
			}
		}
		this._models = nextModels
	}
}

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
		const cpTable = this._table.copy()
		cpTable.mutation(0.005)
		return new GeneticAlgorithmAgent(this._env, this._resolution, cpTable)
	}

	mix(other) {
		const cpTable = this._table.copy()
		cpTable.mix(other._table, 0.5)
		return new GeneticAlgorithmAgent(this._env, this._resolution, cpTable)
	}

	score() {
		return this._total_reward
	}
}

/**
 * Genetic algorithm generation
 */
export default class GeneticAlgorithmGeneration {
	/**
	 * @param {RLEnvironmentBase} env Environment
	 * @param {number} [size] Number of models per generation
	 * @param {number} [resolution] Resolution
	 */
	constructor(env, size = 100, resolution = 20) {
		this._env = env
		this._resolution = resolution

		this._model = new GeneticAlgorithm(size, function () {
			return new GeneticAlgorithmAgent(env, resolution)
		})
	}

	/**
	 * Reset all agents.
	 */
	reset() {
		this._model.models.forEach(a => a.reset())
	}

	/**
	 * Returns a score.
	 * @returns {Array<Array<Array<number>>>} Score values
	 */
	get_score() {
		return this._model.bestModel.get_score()
	}

	/**
	 * Returns the best score agent.
	 * @returns {GeneticAlgorithmAgent} Best agent
	 */
	top_agent() {
		return this._model.bestModel
	}

	/**
	 * Run for all agents.
	 */
	run() {
		this.reset()
		this._model.run(this._env)
	}

	/**
	 * Update agent to new generation.
	 * @param {number} mutation_rate Mutation rate
	 */
	next(mutation_rate = 0.001) {
		this._model.next(mutation_rate)
	}
}
