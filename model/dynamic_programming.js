class DPTable extends QTableBase {
	// https://blog.monochromegane.com/blog/2020/01/30/memo-getting-start-reinformation-learning-algorithm/
	// https://qiita.com/MENDY/items/77608bb0561c4630d971
	constructor(env, resolution = 20, gamma = 0.9) {
		super(env, resolution);
		let length = 1;
		for (const s of env.states) {
			length *= s.toArray(resolution).length;
		}
		this._v = Array(length).fill(0);
		this._gamma = gamma;
	}

	_step_index(size, index) {
		for (let i = 0; i < index.length; i++) {
			index[i]++;
			if (index[i] < size[i]) {
				return true;
			}
			index[i] = 0;
		}
		return false;
	}

	update(method = 'value') {
		if (method === 'value') {
			this.valueIteration();
		} else {
			this.policyIteration();
		}
	}

	policyIteration() {
		const lastV = [].concat(this._v);
		const lastQ = [].concat(this._q);
		const greedy_rate = 0.05

		const x = Array(this._states.length).fill(0);
		const a = Array(this._actions.length);
		do {
			let vs = [];
			a.fill(0);
			do {
				let [reward, y] = this._env.test(this._state_value(x), this._action_value(a));
				const [s, e] = this._select_index(this._state_sizes, y);
				const v = reward + this._gamma * lastV[s];
				const [ps, pe] = this._select_index(this._sizes, [...x, ...a]);
				this._q[ps] = v;
				vs.push([v, lastQ[ps]]);
			} while (this._step_index(this._action_sizes, a));
			const [s, e] = this._select_index(this._state_sizes, x);
			const maxi = argmax(vs, (v) => v[1]);
			this._v[s] = vs.reduce((s, v, i) => s + v[0] * (i === maxi ? (1 - greedy_rate) : (greedy_rate / (vs.length - 1))), 0);
		} while (this._step_index(this._state_sizes, x));
	}

	valueIteration() {
		const lastV = [].concat(this._v);

		const x = Array(this._states.length).fill(0);
		const a = Array(this._actions.length);
		do {
			let max_v = -Infinity;
			a.fill(0);
			const x_state = this._state_value(x);
			do {
				let [reward, y] = this._env.test(x_state, this._action_value(a));
				const [s, e] = this._select_index(this._state_sizes, y);
				const v = reward + this._gamma * lastV[s];
				const [ps, pe] = this._select_index(this._sizes, [...x, ...a]);
				this._q[ps] = v;
				max_v = Math.max(v, max_v);
			} while (this._step_index(this._action_sizes, a));
			const [s, e] = this._select_index(this._state_sizes, x);
			this._v[s] = max_v;
		} while (this._step_index(this._state_sizes, x));
	}
}

class DPAgent {
	constructor(env) {
		this._actions = env.actions;
		this._table = new DPTable(env, 20);
	}

	get_score(env) {
		return this._table.toArray();
	}

	get_action(env, state) {
		return this._table.best_action(state);
	}

	update(method) {
		this._table.update(method);
	}
}

var dispDP = function(elm, setting) {
	const svg = d3.select("svg");
	const env = rl_environment;

	let agent = new DPAgent(env);
	let cur_state = env.reset();
	env.render(agent.get_score(env))
	let stepCount = 0;

	const update = () => {
		const method = elm.select(".buttons [name=type").property("value")
		agent.update(method);
		env.render(agent.get_score(env))
		elm.select(".buttons [name=step]").text(++stepCount)
	}

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "New agent")
		.on("click", () => {
			agent = new DPAgent(env);
			cur_state = env.reset();
			env.render(agent.get_score(env))
			elm.select(".buttons [name=scores]").text("")
		});
	elm.select(".buttons")
		.append("select")
		.attr("name", "type")
		.selectAll("option")
		.data(["value", "policy"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	const stepButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", update);
	let isRunning = false;
	const epochButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Run")
		.on("click", () => {
			isRunning = !isRunning;
			epochButton.attr("value", (isRunning) ? "Stop" : "Run");
			stepButton.property("disabled", isRunning);
			(function loop() {
				if (isRunning) {
					update();
					setTimeout(loop, 5);
				}
			})();
		});
	elm.select(".buttons")
		.append("span")
		.text(" Step: ");
	elm.select(".buttons")
		.append("span")
		.attr("name", "step")
		.text(stepCount);

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Reset")
		.on("click", () => {
			cur_state = env.reset();
			env.render(agent.get_score(env))
		});
	let isMoving = false;
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Move")
		.on("click", function() {
			isMoving = !isMoving;
			const moveButton = d3.select(this);
			moveButton.attr("value", (isMoving) ? "Stop" : "Mode");
			(function loop() {
				if (isMoving) {
					const action = agent.get_action(env, cur_state);
					const [next_state, reward, done] = env.step(action);
					env.render(agent.get_score(env))
					cur_state = next_state;
					setTimeout(loop, 100);
				}
			})()
		});

	return () => {
		isRunning = false;
		isMoving = false;
	}
}


var dynamic_programming_init = function(root, mode, setting) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Data point becomes wall. Click "step" to update, click "move" to move agent.');
	div.append("div").classed("buttons", true);
	const terminator = dispDP(root, setting);

	setting.setTerminate(() => {
		d3.selectAll("svg .tile").remove();
		terminator()
	});
}
