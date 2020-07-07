class QTable {
	constructor(...sizes) {
		this._sizes = sizes;
		this._table = Array(sizes[0]);
		let leaf = [this._table];
		for (let i = 1; i < sizes.length; i++) {
			const newLeaf = [];
			for (const t of leaf) {
				for (let k = 0; k < t.length; k++) {
					newLeaf.push(t[k] = Array(sizes[i]));
				}
			}
			leaf = newLeaf;
		}
		for (const t of leaf) {
			t.fill(0);
		}
		this._alpha = 0.2;
		this._gamma = 0.99;
	}

	q_values(state) {
		let q = this._table;
		for (const s of state) {
			q = q[s];
		}
		return q;
	}

	update(action, state, next_state, reward) {
		const next_q = this.q_values(next_state);
		const next_max_q = Math.max(...next_q);
		const q = this.q_values(state);
		const q_value = q[action];
		q[action] += this._alpha * (reward + this._gamma * next_max_q - q_value)
	}
}

class QAgent {
	constructor(states, actions) {
		const sizes = [];
		for (let i = 0; i < states.length; i++) {
			sizes.push(states[i].toArray(20).length);
		}
		sizes.push(actions.length);
		this._actions = actions;
		this._table = new QTable(...sizes);
	}

	get_action(env, state) {
		if (Math.random() > 0.002) {
			const q = this._table.q_values(state);
			return this._actions[argmax(q)];
		} else {
			const i = Math.floor(Math.random() * this._actions.length);
			return this._actions[i];
		}
	}

	update(action, state, next_state, reward) {
		const a = this._actions.indexOf(action);
		this._table.update(a, state, next_state, reward);
	}
}

var dispQLearning = function(elm, setting) {
	const svg = d3.select("svg");
	const env = rl_environment;

	const agent = new QAgent(env.states, env.actions[0]);
	let cur_state = env.reset();
	env.render();
	let episodes = 1;
	let stepCount = 0;

	const step = () => {
		const action = agent.get_action(env, cur_state);
		const [next_state, reward, done] = env.step(action);
		agent.update(action, cur_state, next_state, reward)
		env.render()
		cur_state = next_state;
		elm.select(".buttons [name=step]").text(++stepCount)
		return done;
	}

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", step);
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Reset")
		.on("click", () => {
			env.reset();
			env.render();
			elm.select(".buttons [name=episodes]").text(++episodes)
			elm.select(".buttons [name=step]").text(stepCount = 0)
		});
	let isRunning = false;
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Epoch")
		.on("click", function() {
			const epochButton = d3.select(this);
			isRunning = !isRunning;
			epochButton.attr("value", (isRunning) ? "Stop" : "Run");
			(function loop() {
				env.render();
				if (isRunning) {
					if (step()) {
						setTimeout(() => {
							env.render();
							env.reset();
							elm.select(".buttons [name=episodes]").text(++episodes)
							elm.select(".buttons [name=step]").text(stepCount = 0)
							setTimeout(loop, 10);
						}, 10);
					} else {
						setTimeout(loop, 10);
					}
				} else {
					epochButton.attr("value", "Run");
				}
			})();
		});
	elm.select(".buttons")
		.append("span")
		.text("Eposode: ");
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
