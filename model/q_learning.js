class QTableBase {
	constructor(env, resolution = 20) {
		this._env = env;
		this._states = env.states;
		this._actions = env.actions;
		this._resolution = resolution;
		this._state_sizes = env.states.map(s => s.toArray(resolution).length);
		this._action_sizes = env.actions.map(a => a.length);
		this._sizes = [...this._state_sizes, ...this._action_sizes];
		let length = this._sizes.reduce((l, v) => l * v, 1);
		this._table = Array(length).fill(0);
		this._q = this._table;
	}

	_state_index(state) {
		return state.map((s, i) => {
			if (this._states[i] instanceof RLIntRange) {
				return this._states[i].indexOf(s, this._resolution);
			} else if (this._states[i] instanceof RLRealRange) {
				return this._states[i].indexOf(s, this._resolution);
			} else {
				throw "Not implemented";
			}
		});
	}

	_state_value(index) {
		return index.map((s, i) => {
			if (this._states[i] instanceof RLIntRange) {
				return this._states[i].toArray(this._resolution)[s];
			} else if (this._states[i] instanceof RLRealRange) {
				return s * (this._states[i].max - this._states[i].min) / this._resolution + this._states[i].min;
			} else {
				throw "Not implemented";
			}
		});
	}

	_action_index(action) {
		return action.map((a, i) => {
			if (Array.isArray(this._actions[i])) {
				return this._actions[i].indexOf(a);
			} else {
				throw "Not implemented";
			}
		});
	}

	_action_value(index) {
		return index.map((a, i) => {
			if (Array.isArray(this._actions[i])) {
				return this._actions[i][a];
			} else {
				throw "Not implemented";
			}
		});
	}

	_select_index(size, index) {
		let s = 0, e = 0;
		for (let i = 0; i < size.length; i++) {
			s = s * size[i] + (index[i] || 0);
			e = e * size[i] + (index[i] || 0);
			if (index.length === i + 1) e++;
		}
		return [s, e];
	}

	_select(arr, size, index) {
		const [s, e] = this._select_index(size, index);
		return arr.slice(s, e);
	}

	toArray() {
		const root = [null];
		let leaf = [root];
		let c = 0;
		for (let i = 0; i < this._sizes.length; i++) {
			const next_leaf = [];
			for (const l of leaf) {
				for (let k = 0; k < l.length; k++) {
					if (i === this._sizes.length - 1) {
						l[k] = this._q.slice(c, c + this._sizes[i]);
						c += this._sizes[i];
					} else {
						l[k] = Array(this._sizes[i])
					}
					next_leaf.push(l[k])
				}
			}
			leaf = next_leaf;
		}
		return root[0];
	}

	best_action(state) {
		const q = this._select(this._q, this._sizes, state);
		const mv = Math.max(...q);
		const midx = []
		for (let i = 0; i < q.length; i++) {
			if (q[i] === mv) midx.push(i);
		}
		let m = midx[Math.floor(Math.random() * midx.length)]
		const a = [];
		for (let i = this._action_sizes.length - 1; i >= 0; i--) {
			a.unshift(this._actions[i][m % this._action_sizes[i]]);
			m = Math.floor(m / this._action_sizes[i]);
		}
		return a;
	}
}

class QTable extends QTableBase {
	constructor(env, resolution = 20, alpha = 0.2, gamma = 0.99) {
		super(env, resolution);
		this._alpha = alpha;
		this._gamma = gamma;
	}

	update(action, state, next_state, reward) {
		action = this._action_index(action);
		state = this._state_index(state);
		next_state = this._state_index(next_state)

		const next_q = this._select(this._table, this._sizes, next_state);
		const next_max_q = Math.max(...next_q);

		const [qs, qe] = this._select_index(this._sizes, [...state, ...action]);
		const q_value = this._table[qs];

		this._table[qs] += this._alpha * (reward + this._gamma * next_max_q - q_value)
	}
}

class QAgent {
	constructor(env) {
		this._table = new QTable(env, 20);
	}

	get_score(env) {
		return this._table.toArray();
	}

	get_action(env, state, greedy_rate = 0.002) {
		if (Math.random() > greedy_rate) {
			return this._table.best_action(state);
		} else {
			return env.sample_action(this);
		}
	}

	update(action, state, next_state, reward) {
		this._table.update(action, state, next_state, reward);
	}
}

var dispQLearning = function(elm, setting) {
	const svg = d3.select("svg");
	const env = rl_environment;

	let agent = new QAgent(env);
	let cur_state = env.reset(agent);
	let scores = null
	env.render(scores = agent.get_score(env));
	let episodes = 1;
	let stepCount = 0;
	let score_history = [];

	const step = (render = true) => {
		const greedy_rate = +elm.select(".buttons [name=greedy_rate]").property("value")
		const action = agent.get_action(env, cur_state, greedy_rate);
		const [next_state, reward, done] = env.step(action, agent);
		agent.update(action, cur_state, next_state, reward)
		if (render) {
			if (stepCount % 10 === 0) {
				env.render(scores = agent.get_score(env))
			} else {
				env.render(scores)
			}
		}
		elm.select(".buttons [name=step]").text(++stepCount)
		cur_state = next_state;
		if (done) {
			score_history.push(stepCount);
			elm.select(".buttons [name=scores]").text(" [" + score_history.slice(-10).reverse().join(",") + "]")
		}
		return done;
	}

	const reset = () => {
		cur_state = env.reset(agent);
		env.render(scores = agent.get_score(env))
		elm.select(".buttons [name=episodes]").text(++episodes)
		elm.select(".buttons [name=step]").text(stepCount = 0)
	}

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "New agent")
		.on("click", () => {
			agent = new QAgent(env);
			episodes = 0;
			score_history = []
			reset();
			elm.select(".buttons [name=scores]").text("")
		});
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Reset")
		.on("click", reset);
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "greedy_rate")
		.attr("min", 0)
		.attr("max", 1)
		.attr("step", "0.01")
		.attr("value", 0.02)
	elm.select(".buttons")
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
			skipButton.property("disabled", isRunning);
			if (isRunning) {
				(function loop() {
					if (isRunning) {
						if (step()) {
							setTimeout(() => {
								reset();
								setTimeout(loop, 10);
							}, 10);
						} else {
							setTimeout(loop, 5);
						}
					} else {
						env.render(scores = agent.get_score(env))
						epochButton.attr("value", "Epoch");
					}
				})();
			}
		});
	const skipButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Skip")
		.on("click", () => {
			isRunning = !isRunning;
			skipButton.attr("value", (isRunning) ? "Stop" : "Skip");
			epochButton.property("disabled", isRunning);
			if (isRunning) {
				(function loop() {
					if (isRunning) {
						if (!step(false)) {
							setTimeout(loop, 0);
						} else {
							setTimeout(() => {
								reset();
								setTimeout(loop, 10);
							}, 10);
						}
					} else {
						env.render(scores = agent.get_score(env))
						skipButton.attr("value", "Skip");
					}
				})();
			}
		})
	elm.select(".buttons")
		.append("span")
		.text("Episode: ");
	elm.select(".buttons")
		.append("span")
		.attr("name", "episodes")
		.text(episodes);
	elm.select(".buttons")
		.append("span")
		.text(" Step: ");
	elm.select(".buttons")
		.append("span")
		.attr("name", "step")
		.text(stepCount);

	elm.select(".buttons")
		.append("span")
		.attr("name", "scores")

	return () => {
		isRunning = false;
	}
}


var q_learning_init = function(root, mode, setting) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Data point becomes wall. Click "step" to update.');
	div.append("div").classed("buttons", true);
	const terminator = dispQLearning(root, setting);

	setting.setTerminate(() => {
		d3.selectAll("svg .tile").remove();
		terminator()
	});
}
