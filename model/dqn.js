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

class DQNNoWorker {
	constructor() {
		this._models = {}
	}

	initialize(layers, cb) {
		const id = Math.random().toString(32).substring(2);
		this._models[id] = new NeuralNetwork(layers);
		cb && cb({data: id});
	}

	fit(id, train_x, train_y, iteration, rate, cb) {
		this._models[id].fit(train_x, train_y, iteration, rate);
		cb && cb();
	}

	predict(id, x, cb) {
		const t = this._models[id].calc(x).toArray();
		cb && cb({data: t});
	}

	remove(id) {
		delete this._models[id];
	}

	copy(id, cb) {
		const id0 = Math.random().toString(32).substring(2);
		this._models[id0] = this._models[id].copy();
		cb && cb({data: id0});
	}

	terminate() {
		this._models = {}
	}
}

class DQN {
	// https://qiita.com/sugulu/items/bc7c70e6658f204f85f9
	constructor(env, resolution = 20, use_worker = false, cb) {
		this._resolution = resolution;
		this._states = env.states;
		this._actions = env.actions;
		this._action_sizes = env.actions.map(a => {
			if (Array.isArray(a)) {
				return a.length
			} else {
				return resolution
			}
		});
		this._gamma = 0.99
		this._epoch = 0;
		this._method = "DQN";
		this._use_worker = use_worker;

		this._memory = [];
		this._max_memory_size = 100000
		this._batch_size = 10;
		this._do_update_step = 10
		this._fix_param_update_step = 1000
		this._layers = [
			{ type: 'input' },
			{ type: 'full', out_size: 20, activation: 'tanh' },
			{ type: 'full', out_size: 20, activation: 'tanh' },
			{ type: 'full', out_size: this._action_sizes.reduce((s, v) => s * v, 1) },
			{ type: 'output', name: 'output' },
			{ type: 'huber' }
		];
		this._net = (this._use_worker) ? new DQNWorker() : new DQNNoWorker();
		this._target_id = null;
		this._net.initialize(this._layers, (e) => {
			this._id = e.data
			cb && cb();
		})
	}

	set method(value) {
		this._method = value;
		if (value === "DQN" && this._target_id) {
			this._net.remove(this._target_id)
			this._target_id = null
		}
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

	_action_pos(action) {
		let i = 0;
		for (let k = 0; k < action.length; k++) {
			i = i * this._action_sizes[k]
			if (Array.isArray(this._actions[k])) {
				i += this._actions[k].indexOf(action[k])
			} else if (this._actions[k] instanceof RLRealRange) {
				i += this._actions[k].indexOf(action[k], this._resolution);
			} else {
				throw "Not implemented";
			}
		}
		return i
	}

	update(action, state, next_state, reward, done, learning_rate, cb) {
		this._memory.push([action, state, next_state, Math.sign(reward)]);
		if (this._memory.length < this._batch_size) {
			cb && cb();
			return;
		} else if (this._memory.length > this._max_memory_size) {
			this._memory.shift()
		}

		if (++this._epoch % this._do_update_step > 0) {
			cb && cb()
			return;
		}

		const idx = []
		for (let i = 0; i < this._batch_size; i++) {
			let r = Math.floor(Math.random() * (this._memory.length - i))
			let j = 0
			for (; j < idx.length && idx[j] <= r; j++, r++);
			idx.splice(j, 0, r)
		}
		const select_data = idx.map(i => this._memory[i]);

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
				const a_idx = this._action_pos(data[i][0])
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
					const a_idx = this._action_pos(data[i][0])
					q[i][a_idx] = data[i][3] + this._gamma * next_t_q[i][argmax(next_q[i])];
				}
				this._net.fit(this._id, x, q, 1, learning_rate, () => {
					if (this._epoch % this._fix_param_update_step) {
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
	constructor(env, resolution, use_worker, cb) {
		this._net = new DQN(env, resolution, use_worker, cb);
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
			cb(env.sample_action(this));
		}
	}

	update(action, state, next_state, reward, done, learning_rate, cb) {
		this._net.update(action, state, next_state, reward, done, learning_rate, cb);
	}
}

var dispDQN = function(elm, env) {
	let resolution = 20
	if (env.type === 'grid') {
		env.env._reward = {
			step: -1,
			wall: -1,
			goal: 1,
			fail: -1
		}
		env.env._max_step = 3000
		resolution = Math.max(...env.env.size)
	}

	const use_worker = false
	let readyNet = false
	let agent = new DQAgent(env, resolution, use_worker, () => {
		readyNet = true;
		setTimeout(() => {
			render_score(() => {
				elm.selectAll(".buttons input").property("disabled", false);
			});
		}, 0)
	});
	let cur_state = env.reset(agent);
	let episodes = 1;
	let stepCount = 0;
	let score_history = [];

	const render_score = (cb) => {
		if (env.type === 'grid') {
			agent.get_score(env, score => {
				env.render(() => score)
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
			let [next_state, reward, done] = env.step(action, agent);
			agent.update(action, cur_state, next_state, reward, done, learning_rate, () => {
				const end_proc = () => {
					elm.select(".buttons [name=step]").text(++stepCount)
					cur_state = next_state;
					if (done) {
						score_history.push(env.cumulativeReward());
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
		cur_state = env.reset(agent);
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
			agent = new DQAgent(env, resolution, use_worker, () => {
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
		.attr("value", 0.3)
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
							setTimeout(() => done ? reset(loop) : loop());
						})
					} else {
						setTimeout(() => {
							render_score(() => {
								epochButton.attr("value", "Epoch");
							})
						}, 0)
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
						let dn = false;
						step(done => {
							dn = done;
							if (use_worker) {
								done ? reset(loop) : loop();
							}
						}, true)
						if (use_worker) {
							return
						}
						const curt = new Date().getTime();
						if (dn) {
							reset();
						}
						if (curt - lastt > 200) {
							lastt = curt;
							setTimeout(loop, 0);
							return;
						}
					}
					render_score(() => {
						skipButton.attr("value", "Skip");
					})
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


var dqn_init = function(platform) {
	const root = platform.setting.ml.configElement
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Data point becomes wall. Click "step" to update.');
	div.append("div").classed("buttons", true);
	const terminator = dispDQN(root, platform);

	setting.terminate = () => {
		terminator()
	};
}

export default dqn_init

