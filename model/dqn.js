class DQNWorker extends BaseWorker {
	constructor() {
		super('model/neuralnetwork_worker.js');
	}

	initialize(layers, cb) {
		this._postMessage({
			mode: "init",
			layers: layers
		}, cb);
	}

	fit(id, train_x, train_y, iteration, rate, cb) {
		this._postMessage({
			id: id,
			mode: "fit",
			x: train_x,
			y: train_y,
			iteration: iteration,
			rate: rate
		}, cb);
	}

	predict(id, x, cb) {
		this._postMessage({
			id: id,
			mode: "predict",
			x: x
		}, cb);
	}

	remove(id) {
		this._postMessage({
			id: id,
			mode: "close"
		});
	}

	copy(id, cb) {
		this._postMessage({
			id: id,
			mode: "copy"
		}, cb);
	}
}

class DQN {
	// https://qiita.com/sugulu/items/bc7c70e6658f204f85f9
	constructor(env, resolution = 20, cb) {
		this._batch_size = 100;
		this._resolution = resolution;
		this._states = env.states;
		this._actions = env.actions;
		this._action_sizes = env.actions.map(a => a.length);
		this._gamma = 0.9
		this._epoch = 0;
		this._method = "DQN";

		this._memory = [];
		this._layers = [
			{ type: 'input' },
			{ type: 'full', out_size: 20 },
			{ type: 'tanh' },
			{ type: 'full', out_size: 20 },
			{ type: 'tanh' },
			{ type: 'full', out_size: 20 },
			{ type: 'tanh' },
			{ type: 'full', out_size: this._action_sizes.reduce((s, v) => s * v, 1) },
			{ type: 'output', name: 'output' },
			{ type: 'huber' }
		];
		this._net = new DQNWorker();
		this._net.initialize(this._layers, (e) => {
			this._id = e.data
			cb && cb();
		})
		this._target_id = null;
	}

	set method(value) {
		this._method = value;
	}

	terminate() {
		this._net.terminate();
	}

	get_best_action(state, cb) {
		this._net.predict(this._id, [state], (e) => {
			const data = e.data;
			cb([argmax(data[0])]);
		})
	}

	get_state_sizes() {
		return this._states.map(s => s.toArray(this._resolution).length);
	}

	get_score(cb) {
		if (!this._states_data) {
			const state_sizes = this._states.map(s => s.toArray(this._resolution).length);
			this._states_data = [];
			const next_idx = (n) => {
				for (let i = 0; i < n.length; i++) {
					n[i]++;
					if (n[i] < state_sizes[i]) return true;
					n[i] = 0;
				}
				return false;
			}

			let p = 0;
			const state = Array(this._states.length).fill(0);
			do {
				this._states_data.push([].concat(state));
			} while (next_idx(state));
		}

		this._net.predict(this._id, this._states_data, (e) => {
			const a = e.data;
			const d = [];
			const m = this._states.length
			for (let i = 0; i < this._states_data.length; i++) {
				let di = d;
				for (let k = 0; k < m - 1; k++) {
					if (!di[this._states_data[i][k]]) di[this._states_data[i][k]] = [];
					di = di[this._states_data[i][k]]
				}
				di[this._states_data[i][m - 1]] = a[i];
			}
			cb && cb(d);
		})
	}

	_action_index(action) {
		let i = 0;
		for (let k = 0; k < action.length; k++) {
			i = i * this._action_sizes[k] + this._actions[k].indexOf(action[k])
		}
		return i
	}

	update(action, state, next_state, reward, done, learning_rate, cb) {
		this._memory.push([action, state, next_state, Math.sign(reward)]);
		if (this._memory.length < this._batch_size) {
			cb();
			return;
		} else if (this._memory.length > 100000) {
			this._memory.shift()
		}

		if (++this._epoch % 10 > 0) {
			cb && cb()
			return;
		}

		const idx = Array(this._memory.length);
		for (let i = 0; i < idx.length; idx[i] = i++);
		shuffle(idx);
		const select_data = idx.slice(0, this._batch_size).map(i => this._memory[i]);

		if (this._method === "DDQN") {
			this._update_ddqn(select_data, learning_rate, cb);
		} else {
			this._update_dqn(select_data, learning_rate, cb);
		}
	}

	_update_dqn(data, learning_rate, cb) {
		const x = data.map(d => d[1]);
		const next_x = data.map(d => d[2]);
		const xx = [].concat(x, next_x);
		this._net.predict(this._id, xx, (e) => {
			const q = e.data.slice(0, x.length);
			const next_q = e.data.slice(x.length);
			for (let i = 0; i < q.length; i++) {
				const a_idx = this._action_index(data[i][0])
				q[i][a_idx] = data[i][3] + this._gamma * Math.max(...next_q[i]);
			}
			this._net.fit(this._id, x, q, 1, learning_rate, cb);
		});
	}

	_update_ddqn(data, learning_rate, cb) {
		const x = data.map(d => d[1]);
		const next_x = data.map(d => d[2]);
		const xx = [].concat(x, next_x);
		this._net.predict(this._id, xx, (e) => {
			const q = e.data.slice(0, x.length);
			const next_q = e.data.slice(x.length);
			this._net.predict(this._target_id || this._id, next_x, e => {
				const next_t_q = e.data;
				for (let i = 0; i < q.length; i++) {
					const a_idx = this._action_index(data[i][0])
					q[i][a_idx] = data[i][3] + this._gamma * next_t_q[i][argmax(next_q[i])];
				}
				this._net.fit(this._id, x, q, 1, learning_rate, () => {
					if (this._epoch % 100) {
						this._net.copy(this._id, (e) => {
							this._net.remove(this._target_id);
							this._target_id = e.data
							cb && cb();
						})
					} else {
						cb && cb()
					}
				});
			});
		});
	}
}

class DQAgent {
	constructor(env, cb) {
		this._actions = env.actions;
		this._net = new DQN(env, 20, cb);
	}

	set method(value) {
		this._net.method = value;
	}

	terminate() {
		this._net.terminate();
	}

	get_score(env, cb) {
		return this._net.get_score(cb);
	}

	get_action(env, state, greedy_rate = 0.002, cb) {
		if (Math.random() > greedy_rate) {
			this._net.get_best_action(state, cb);
		} else {
			const action = this._actions.map(action => {
				if (Array.isArray(action)) {
					const i = Math.floor(Math.random() * action.length);
					return action[i];
				} else {
					throw "Not implemented";
				}
			})
			cb(action)
		}
	}

	update(action, state, next_state, reward, done, learning_rate, cb) {
		this._net.update(action, state, next_state, reward, done, learning_rate, cb);
	}
}

var dispDQN = function(elm, setting) {
	const svg = d3.select("svg");
	const env = rl_environment;
	if (env.type === 'grid') {
		env._env._dim = 2
		env._env._size = [5, 5];
		env._env._reward = {
			step: 0,
			wall: 0,
			goal: 1,
			max_step: -1
		}
		env._env._max_step = 500
		env._env._position = [0, 0]
		env._env._init(env._r)
	}

	let readyNet = false
	let agent = new DQAgent(env, () => {
		readyNet = true;
		render_score(() => {
			elm.selectAll(".buttons input").property("disabled", false);
		});
	});
	let cur_state = env.reset();
	let scores = null
	let episodes = 1;
	let stepCount = 0;
	let score_history = [];

	const render_score = (cb) => {
		if (env.type === 'grid') {
			agent.get_score(env, score => {
				env.render(scores = score)
				cb && cb()
			})
		} else {
			env.render();
			cb && cb();
		}
	}

	const step = (cb, render = true) => {
		if (!readyNet) {
			cb && cb();
			return;
		}
		const greedy_rate = +elm.select(".buttons [name=greedy_rate]").property("value")
		const learning_rate = +elm.select(".buttons [name=learning_rate]").property("value")
		agent.get_action(env, cur_state, greedy_rate, action => {
			let [next_state, reward, done] = env.step(action);
			agent.update(action, cur_state, next_state, reward, done, learning_rate, () => {
				const end_proc = () => {
					elm.select(".buttons [name=step]").text(++stepCount)
					cur_state = next_state;
					if (done) {
						score_history.push(stepCount);
						elm.select(".buttons [name=scores]").text(" [" + score_history.slice(-10).reverse().join(",") + "]")
					}
					cb && cb(done);
				}
				if (render) {
					render_score(end_proc);
				} else {
					end_proc();
				}
			});
		});
	}

	const reset = (cb) => {
		if (!readyNet) {
			cb && cb();
			return;
		}
		cur_state = env.reset();
		render_score(() => {
			elm.select(".buttons [name=episodes]").text(++episodes)
			elm.select(".buttons [name=step]").text(stepCount = 0)
			cb && cb()
		})
	}

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "New agent")
		.on("click", () => {
			agent.terminate();
			agent = new DQAgent(env, () => {
				readyNet = true;
				reset();
			});
			episodes = 0;
			score_history = []
			elm.select(".buttons [name=scores]").text("")
		});
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Reset")
		.on("click", reset);
	elm.select(".buttons")
		.append("select")
		.attr("name", "method")
		.on("change", function() {
			const e = d3.select(this);
			agent.method = e.property("value")
		})
		.selectAll("option")
		.data(["DQN", "DDQN"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "greedy_rate")
		.attr("min", 0)
		.attr("max", 1)
		.attr("step", "0.01")
		.attr("value", 0.9)
	elm.select(".buttons")
		.append("span")
		.text(" Learning rate ");
	elm.select(".buttons")
		.append("select")
		.attr("name", "learning_rate")
		.selectAll("option")
		.data([0.001, 0.01, 0.1, 1, 10])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.select(".buttons [name=learning_rate]")
		.property("value", 0.01);
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => step());
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
						step(done => {
							done ? reset(loop) : loop();
						})
					} else {
						render_score(() => {
							epochButton.attr("value", "Epoch");
						})
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
						step(done => {
							done ? reset(loop) : loop();
						}, false)
					} else {
						render_score(() => {
							skipButton.attr("value", "Skip");
						})
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
	elm.selectAll(".buttons input").property("disabled", true);

	return () => {
		isRunning = false;
		agent.terminate();
	}
}


var dqn_init = function(root, mode, setting) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Data point becomes wall. Click "step" to update.');
	div.append("div").classed("buttons", true);
	const terminator = dispDQN(root, setting);

	setting.setTerminate(() => {
		d3.selectAll("svg .tile").remove();
		terminator()
	});
}
