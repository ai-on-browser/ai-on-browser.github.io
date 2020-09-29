import { RLRealRange, RLIntRange } from '../platform/rlenv/base.js'

export class QTableBase {
	constructor(env, resolution = 20) {
		this._env = env;
		this._resolution = resolution;
		this._state_sizes = env.states.map(s => {
			if (Array.isArray(s)) {
				return s.length
			} else {
				return s.toArray(resolution).length
			}
		});
		this._action_sizes = env.actions.map(a => {
			if (Array.isArray(a)) {
				return a.length
			} else {
				return a.toArray(resolution).length
			}
		});
		this._sizes = [...this._state_sizes, ...this._action_sizes];
		this._tensor = new Tensor(this._sizes)
		this._table = this._tensor.value;
	}

	get tensor() {
		return this._tensor;
	}

	get states() {
		return this._env.states;
	}

	get actions() {
		return this._env.actions;
	}

	get resolution() {
		return this._resolution;
	}

	_state_index(state) {
		return state.map((s, i) => {
			const si = this.states[i];
			if (Array.isArray(si)) {
				return si.indexOf(s);
			} else if (si instanceof RLIntRange) {
				return si.indexOf(s, this.resolution);
			} else if (si instanceof RLRealRange) {
				return si.indexOf(s, this.resolution);
			} else {
				throw "Not implemented";
			}
		});
	}

	_state_value(index) {
		return index.map((s, i) => {
			const si = this.states[i];
			if (Array.isArray(si)) {
				return si[s];
			} else if (si instanceof RLIntRange) {
				return si.toArray(this.resolution)[s];
			} else if (si instanceof RLRealRange) {
				return s * (si.max - si.min) / this.resolution + si.min;
			} else {
				throw "Not implemented";
			}
		});
	}

	_action_index(action) {
		return action.map((a, i) => {
			const ai = this.actions[i];
			if (Array.isArray(ai)) {
				return ai.indexOf(a);
			} else if (ai instanceof RLRealRange) {
				return ai.indexOf(a, this.resolution);
			} else {
				throw "Not implemented";
			}
		});
	}

	_action_value(index) {
		return index.map((a, i) => {
			const ai = this.actions[i];
			if (Array.isArray(ai)) {
				return ai[a];
			} else if (ai instanceof RLRealRange) {
				return a * (ai.max - ai.min) / this.resolution + ai.min;
			} else {
				throw "Not implemented";
			}
		});
	}

	_to_position(size, index) {
		let s = 0;
		for (let i = 0; i < index.length; i++) {
			s = s * size[i] + index[i];
		}
		let e = s + 1;
		for (let i = index.length; i < size.length; i++) {
			s *= size[i];
			e *= size[i];
		}
		return [s, e];
	}

	_to_index(size, position) {
		const a = Array(size.length);
		for (let i = size.length - 1; i >= 0; i--) {
			a[i] = position % size[i];
			position = Math.floor(position / size[i]);
		}
		return a;
	}

	_q(state, action) {
		if (!action) {
			const [s, e] = this._to_position(this._sizes, state)
			return [this._table.slice(s, e), [s, e]]
		}
		const [s, e] = this._to_position(this._sizes, [...state, ...action])
		return [this._table[s], s]
	}

	toArray() {
		return this._tensor.toArray()
	}

	best_action(state) {
		const [q] = this._q(this._state_index(state));
		const mv = Math.max(...q);
		const midx = []
		for (let i = 0; i < q.length; i++) {
			if (q[i] === mv) midx.push(i);
		}
		let m = midx[Math.floor(Math.random() * midx.length)]
		const a = this._to_index(this._action_sizes, m);
		return this._action_value(a);
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

		const [next_q] = this._q(next_state);
		const next_max_q = Math.max(...next_q);

		const [q_value, qs] = this._q(state, action);

		this._table[qs] += this._alpha * (reward + this._gamma * next_max_q - q_value)
	}
}

class QAgent {
	constructor(env, resolution = 20) {
		this._table = new QTable(env, resolution);
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

var dispQLearning = function(elm, env) {
	const initResolution = env.type === 'grid' ? Math.max(...env.env.size) : 20;

	let agent = new QAgent(env, initResolution);
	let cur_state = env.reset(agent);
	env.render(() => agent.get_score(env));
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
				env.render(() => agent.get_score(env))
			} else {
				env.render()
			}
		}
		elm.select(".buttons [name=step]").text(++stepCount)
		cur_state = next_state;
		if (done) {
			score_history.push(env._env.cumulativeReward);
			elm.select(".buttons [name=scores]").text(" [" + score_history.slice(-10).reverse().join(",") + "]")
		}
		return done;
	}

	const reset = () => {
		cur_state = env.reset(agent);
		env.render(() => agent.get_score(env))
		elm.select(".buttons [name=episodes]").text(++episodes)
		elm.select(".buttons [name=step]").text(stepCount = 0)
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
			agent = new QAgent(env, resolution);
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
						env.render(() => agent.get_score(env))
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
				let lastt = new Date().getTime();
				(function loop() {
					while (isRunning) {
						if (step(false)) {
							reset();
						}
						const curt = new Date().getTime();
						if (curt - lastt > 200) {
							lastt = curt
							setTimeout(loop, 0);
							return
						}
					}
					env.render(() => agent.get_score(env))
					skipButton.attr("value", "Skip");
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
	const rewardElm = elm.select(".buttons")
		.append("div")

	return () => {
		isRunning = false;
	}
}


var q_learning_init = function(platform) {
	const root = platform.setting.ml.configElement
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Data point becomes wall. Click "step" to update.');
	div.append("div").classed("buttons", true);
	const terminator = dispQLearning(root, platform);

	setting.terminate = () => {
		terminator()
	};
}

export default q_learning_init
