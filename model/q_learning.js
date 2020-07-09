class QTable {
	constructor(env, resolution = 20, alpha = 0.2, gamma = 0.99) {
		this._states = env.states;
		this._actions = env.actions;
		this._sizes = [];
		let length = 1;
		for (const s of env.states) {
			this._sizes.push(s.toArray(resolution).length);
			length *= this._sizes[this._sizes.length - 1];
		}
		for (const a of env.actions) {
			this._sizes.push(a.length);
			length *= this._sizes[this._sizes.length - 1];
		}
		this._table = Array(length).fill(0);
		this._alpha = alpha;
		this._gamma = gamma;
	}

	_state_index(state) {
		return state.map((s, i) => {
			if (this._states[i] instanceof RLIntRange) {
				return s - this._states[i].min;
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
						l[k] = this._table.slice(c, c + this._sizes[i]);
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
		const q = this._select(this._table, this._sizes, state);
		const mv = Math.max(...q);
		const midx = []
		for (let i = 0; i < q.length; i++) {
			if (q[i] === mv) midx.push(i);
		}
		let m = midx[Math.floor(Math.random() * midx.length)]
		const a = [];
		for (let i = this._sizes.length - 1; i >= state.length; i--) {
			a.unshift(this._actions[i - state.length][m % this._sizes[i]]);
			m = Math.floor(m / this._sizes[i]);
		}
		return a;
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
		this._actions = env.actions;
		this._table = new QTable(env, 20);
	}

	get_score(env) {
		return this._table.toArray();
	}

	get_action(env, state) {
		if (Math.random() > 0.002) {
			return this._table.best_action(state);
		} else {
			return this._actions.map(action => {
				if (Array.isArray(action)) {
					const i = Math.floor(Math.random() * action.length);
					return action[i];
				} else {
					throw "Not implemented";
				}
			})
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
	let cur_state = env.reset();
	env.render();
	let episodes = 1;
	let stepCount = 0;
	let scores = null
	let score_history = [];

	const step = (render = true) => {
		const action = agent.get_action(env, cur_state);
		const [next_state, reward, done] = env.step(action);
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
		cur_state = env.reset();
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
					epochButton.attr("value", "Epoch");
				}
			})();
		});
	const skipButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Skip")
		.on("click", () => {
			isRunning = !isRunning;
			skipButton.attr("value", (isRunning) ? "Stop" : "Skip");
			epochButton.property("disabled", isRunning);
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
					step()
					skipButton.attr("value", "Skip");
				}
			})();
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
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	const terminator = dispQLearning(root, setting);

	setting.setTerminate(() => {
		d3.selectAll("svg .tile").remove();
		terminator()
	});
}
