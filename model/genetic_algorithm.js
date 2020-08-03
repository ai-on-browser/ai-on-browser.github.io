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
		const t = dst || new GeneticQTable(this._env, this.resolution)
		for (let i = 0; i < this._tensor.length; i++) {
			t._table[i] = (Math.random() < rate) ? other._table[i] : this._table[i]
		}
		return t;
	}
}

class GeneticAlgorithmAgent {
	constructor(env, resolution = 20, table = null) {
		this._env = env
		this._resolution = resolution
		this._table = table || new GeneticQTable(env, resolution);
		this._total_reward = 0;
		this._max_epoch = 1000;
	}

	reset() {
		this._total_reward = 0;
	}

	get_score(env) {
		return this._table.toArray();
	}

	get_action(env, state, greedy_rate = 0.002) {
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

	copy(dst) {
		return new GeneticAlgorithmAgent(this._env, this._resolution, this._table.copy(dst._table))
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
	constructor(env, size = 100, resolution = 20, agents = null) {
		this._env = env
		this._size = size
		this._resolution = resolution
		if (agents) {
			this._agents = agents
		} else {
			this._agents = []
			for (let i = 0; i < size; i++) {
				this._agents.push(new GeneticAlgorithmAgent(env, resolution))
			}
		}
	}

	get_score(env) {
		return this._agents[0].get_score(env)
	}

	top_agent() {
		return this._agents[0]
	}

	run(env) {
		this._agents.forEach((a, i) => {
			a.run(env);
		})
	}

	next() {
		this._agents.sort((a, b) => b._total_reward - a._total_reward)

		const next_agents = []
		const k = Math.floor(this._size / 4)
		for (let i = 0; i < k; i++) {
			next_agents.push(this._agents[i])
		}
		for (let i = k; i < this._size; i++) {
			const s = Math.floor(Math.random() * k)
			let t = Math.floor(Math.random() * (k - 1))
			if (t >= s) t++
			next_agents[i] = this._agents[s].mixCopy(this._agents[t], this._agents[i])
			if (Math.random() < 0.1) {
				next_agents[i].mutation()
			}
		}
		next_agents.forEach(a => a.reset())
		return new GeneticAlgorithmGeneration(this._env, this._size, this._resolution, next_agents)
	}
}

var dispGeneticAlgorithm = function(elm, setting) {
	const svg = d3.select("svg");
	const env = setting.rl.env;
	const initResolution = env.type === 'grid' ? Math.max(...env._env.size) : 10;

	let agent = new GeneticAlgorithmGeneration(env, 100, initResolution);
	let cur_state = env.reset(agent);
	env.render(() => agent.get_score(env));
	let generation = 0;
	let score_history = [];

	const step = (render = true) => {
		agent.run(env);
		agent = agent.next();
		env.render(() => agent.get_score(env))
		elm.select(".buttons [name=generation]").text(++generation)
		if (false) {
			score_history.push(stepCount);
			elm.select(".buttons [name=scores]").text(" [" + score_history.slice(-10).reverse().join(",") + "]")
		}
		return true;
	}

	const test = (cb) => {
		const topAgent = agent.top_agent();
		let state = env.reset(topAgent);
		(function loop(c) {
			const action = topAgent.get_action(env, state);
			const [next_state, reward, done] = env.step(action, topAgent);
			state = next_state
			env.render()
			if (!done && c > 0) {
				setTimeout(() => loop(c - 1), 0)
			} else {
				cb && cb()
			}
		})(5000)
	}

	const reset = () => {
		cur_state = env.reset(agent);
		env.render(() => agent.get_score(env))
	}

	elm.select(".buttons")
		.append("span")
		.text("Resolution")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "resolution")
		.attr("min", 2)
		.attr("max", 100)
		.attr("value", initResolution)
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "New agent")
		.on("click", () => {
			const resolution = +elm.select(".buttons [name=resolution]").property("value")
			agent = new GeneticAlgorithmGeneration(env, 100, initResolution);
			generation = 0
			score_history = []
			reset();
			elm.select(".buttons [name=generation]").text(generation)
		});
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Reset")
		.on("click", reset);
	const stepButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", step);
	let isRunning = false;
	const epochButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Epoch")
		.on("click", () => {
			isRunning = !isRunning;
			epochButton.attr("value", (isRunning) ? "Stop" : "Epoch");
			stepButton.property("disabled", isRunning);
			if (isRunning) {
				(function loop() {
					if (isRunning) {
						step()
						setTimeout(loop, 5);
					} else {
						env.render(() => agent.get_score(env))
						epochButton.attr("value", "Epoch");
					}
				})();
			}
		});
	elm.select(".buttons")
		.append("span")
		.text(" Generation: ");
	elm.select(".buttons")
		.append("span")
		.attr("name", "generation")
		.text(generation);
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Test")
		.on("click", function() {
			const e = d3.select(this)
			e.property("disabled", true);
			test(() => {
				e.property("disabled", false);
			})
		});

	elm.select(".buttons")
		.append("span")
		.attr("name", "scores")

	return () => {
		isRunning = false;
	}
}


var genetic_algorithm_init = function(root, mode, setting) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Data point becomes wall. Click "step" to update.');
	div.append("div").classed("buttons", true);
	const terminator = dispGeneticAlgorithm(root, setting);

	setting.terminate = () => {
		d3.selectAll("svg .tile").remove();
		terminator()
	};
}
