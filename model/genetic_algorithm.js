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
		return t;
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
		return t;
	}
}

class GeneticQTable extends QTableBase {
	constructor(env, resolution = 20) {
		super(env, resolution);
		for (let i = 0; i < this._tensor.length; i++) {
			this._tensor.value[i] = Math.random() * 2 - 1
		}
	}

	copy(dst) {
		const t = dst || new GeneticQTable(this._env, this.resolution)
		for (let i = 0; i < this._tensor.length; i++) {
			t._table[i] = this._table[i]
		}
		return t;
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
		return t;
	}
}

class GeneticAlgorithmAgent {
	constructor(env, resolution = 20, table = null) {
		this._env = env
		this._resolution = resolution
		this._table = table || new GeneticPTable(env, resolution);
		this._total_reward = 0;
		this._max_epoch = 1000;
	}

	get total_reward() {
		return this._total_reward;
	}

	reset() {
		this._total_reward = 0;
	}

	get_score(env) {
		return this._table.toArray();
	}

	get_action(env, state) {
		return this._table.best_action(state);
	}

	run(env) {
		let state = env.reset(this);
		let c = 0;
		while (c++ < this._max_epoch) {
			const action = this.get_action(env, state);
			const [next_state, reward, done] = env.step(action, this);
			state = next_state
			this._total_reward += reward
			if (done) break;
		}
	}

	mutation() {
		this._table.mutation(0.005)
	}

	mix(other) {
		this._table.mix(other._table, 0.5)
	}

	mixCopy(other, dst) {
		return new GeneticAlgorithmAgent(this._env, this._resolution, this._table.mixCopy(other._table, 0.5, dst._table))
	}
}

class GeneticAlgorithmGeneration {
	constructor(env, size = 100, resolution = 20) {
		this._env = env
		this._size = size
		this._resolution = resolution
		this._agents = []
		for (let i = 0; i < size; i++) {
			this._agents.push(new GeneticAlgorithmAgent(env, resolution))
		}
	}

	reset() {
		this._agents.forEach(a => a.reset())
	}

	get_score(env) {
		return this._agents[0].get_score(env)
	}

	top_agent() {
		return this._agents[0]
	}

	run(env) {
		this.reset()
		this._agents.forEach((a, i) => {
			a.run(env);
		})
		this._agents.sort((a, b) => b._total_reward - a._total_reward)
	}

	next(mutation_rate = 0.001) {
		const next_agents = []
		for (let i = 0; i < this._size; i++) {
			if (Math.random() < (this._size - i * 2) / this._size) {
				next_agents.push(this._agents[i])
			} else {
				const s = Math.floor(Math.random() * i)
				let t = Math.floor(Math.random() * (i - 1))
				if (t >= s) t++;
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

var dispGeneticAlgorithm = function(elm, env) {
	const initResolution = env.type === 'grid' ? Math.max(...env.env.size) : 10;
	env.reward = 'achieve'

	let agent = new GeneticAlgorithmGeneration(env, 100, initResolution);
	let generation = 0;
	let score_history = [];
	env.reset(agent);
	env.render(() => agent.get_score(env));

	const step = () => {
		agent.run(env);
		score_history.push(agent.top_agent().total_reward)
		const mutation_rate = +elm.select("[name=mutation_rate]").property("value")
		agent.next(mutation_rate);
		env.reset(agent);
		env.render(() => agent.get_score(env))
		elm.select("[name=generation]").text(++generation)
		elm.select("[name=scores]").text(" [" + score_history.slice(-10).reverse().join(",") + "]")
	}

	elm.append("span")
		.text("Generation size")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "size")
		.attr("min", 5)
		.attr("max", 200)
		.attr("value", 100)
	elm.append("span")
		.text("Resolution")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "resolution")
		.attr("min", 2)
		.attr("max", 100)
		.attr("value", initResolution)
	const slbConf = env.setting.ml.controller.stepLoopButtons().init(() => {
		const size = +elm.select("[name=size]").property("value")
		const resolution = +elm.select("[name=resolution]").property("value")
		agent = new GeneticAlgorithmGeneration(env, size, resolution);
		score_history = []
		env.reset(agent);
		env.render(() => agent.get_score(env))
		elm.select("[name=generation]").text(generation = 0)
		elm.select("[name=scores]").text("")
	})
	elm.append("span")
		.text("Mutation rate")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "mutation_rate")
		.attr("min", 0)
		.attr("max", 1)
		.attr("step", "0.0001")
		.attr("value", "0.001")
	slbConf.step(step)
	elm.append("span")
		.text(" Generation: ");
	elm.append("span")
		.attr("name", "generation")
		.text(generation);
	let isTesting = false;
	const testButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Test")
		.on("click", function() {
			const e = d3.select(this)
			isTesting = !isTesting;
			testButton.attr("value", (isTesting) ? "Stop" : "Test");
			if (isTesting) {
				const topAgent = agent.top_agent();
				let state = env.reset(topAgent)
				void function loop() {
					const action = topAgent.get_action(env, state);
					const [next_state, reward, done] = env.step(action, topAgent);
					state = next_state
					env.render()
					if (isTesting && !done) {
						setTimeout(() => loop(), 0)
					} else {
						isTesting = false
						testButton.attr("value", "Test");
					}
				}()
			}
		});

	elm.append("span")
		.attr("name", "scores")

	return () => {
		isTesting = false;
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Data point becomes wall. Click "step" to update.'
	platform.setting.terminate = dispGeneticAlgorithm(platform.setting.ml.configElement, platform);
}
