import { QTableBase } from './q_learning.js'

class SARSATable extends QTableBase {
	constructor(env, resolution = 20, alpha = 0.2, gamma = 0.99) {
		super(env, resolution);
		this._alpha = alpha;
		this._gamma = gamma;
	}

	update(action, state, next_action, next_state, reward) {
		action = this._action_index(action);
		state = this._state_index(state);
		next_action = this._action_index(next_action)
		next_state = this._state_index(next_state)

		const [next_q_value] = this._q(next_state, next_action);
		const [q_value, qs] = this._q(state, action)

		this._table[qs] += this._alpha * (reward + this._gamma * next_q_value - q_value)
	}
}

class SARSAAgent {
	constructor(env, resolution = 20) {
		this._table = new SARSATable(env, resolution);
	}

	reset() {
		this._last_action = null
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
		if (this._last_action) {
			this._table.update(this._last_action, this._last_state, action, state, this._last_reward);
		}
		this._last_action = action
		this._last_state = state
		this._last_reward = reward
	}
}

var dispSARSA = function(elm, env) {
	const initResolution = env.type === 'grid' ? Math.max(...env.env.size) : 20;

	let agent = new SARSAAgent(env, initResolution);
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
			agent.reset()
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
			agent = new SARSAAgent(env, resolution);
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

	return () => {
		isRunning = false;
	}
}


var sarsa_init = function(platform) {
	const root = platform.setting.ml.configElement
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Data point becomes wall. Click "step" to update.');
	div.append("div").classed("buttons", true);
	const terminator = dispSARSA(root, platform);

	setting.terminate = () => {
		terminator()
	};
}

export default sarsa_init
