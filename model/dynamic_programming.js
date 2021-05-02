import { QTableBase } from './q_learning.js'

class DPTable extends QTableBase {
	// https://blog.monochromegane.com/blog/2020/01/30/memo-getting-start-reinformation-learning-algorithm/
	// https://qiita.com/MENDY/items/77608bb0561c4630d971
	constructor(env, resolution = 20, gamma = 0.9) {
		super(env, resolution);
		let length = this._state_sizes.reduce((s, v) => s * v, 1);
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
		const lastQ = [].concat(this._table);
		const greedy_rate = 0.05

		const x = Array(this.states.length).fill(0);
		const a = Array(this.actions.length);
		do {
			let vs = [];
			a.fill(0);
			do {
				let [y, reward, done] = this._env.test(this._state_value(x), this._action_value(a));
				y = this._state_index(y)
				const [s, e] = this._to_position(this._state_sizes, y);
				const v = reward + this._gamma * lastV[s];
				const [_, ps] = this._q(x, a);
				this._table[ps] = v;
				vs.push([v, lastQ[ps]]);
			} while (this._step_index(this._action_sizes, a));
			const [s, e] = this._to_position(this._state_sizes, x);
			const maxi = argmax(vs, (v) => v[1]);
			this._v[s] = vs.reduce((s, v, i) => s + v[0] * (i === maxi ? (1 - greedy_rate) : (greedy_rate / (vs.length - 1))), 0);
		} while (this._step_index(this._state_sizes, x));
	}

	valueIteration() {
		const lastV = [].concat(this._v);

		const x = Array(this.states.length).fill(0);
		const a = Array(this.actions.length);
		do {
			let max_v = -Infinity;
			a.fill(0);
			const x_state = this._state_value(x);
			do {
				let [y, reward, done] = this._env.test(x_state, this._action_value(a));
				y = this._state_index(y)
				const [s, e] = this._to_position(this._state_sizes, y);
				const v = reward + this._gamma * lastV[s];
				const [_, ps] = this._q(x, a);
				this._table[ps] = v;
				max_v = Math.max(v, max_v);
			} while (this._step_index(this._action_sizes, a));
			const [s, e] = this._to_position(this._state_sizes, x);
			this._v[s] = max_v;
		} while (this._step_index(this._state_sizes, x));
	}
}

class DPAgent {
	constructor(env, resolution = 20) {
		this._table = new DPTable(env, resolution);
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

var dispDP = function(elm, env) {
	const initResolution = env.type === 'grid' ? Math.max(...env.env.size) : 20;

	let agent = new DPAgent(env, initResolution);
	let cur_state = env.reset(agent);
	env.render(() => agent.get_score(env))

	const update = () => {
		const method = elm.select("[name=type]").property("value")
		agent.update(method);
		env.render(() => agent.get_score(env))
	}

	elm.append("span")
		.text("Resolution")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "resolution")
		.attr("min", 2)
		.attr("max", 100)
		.attr("value", initResolution)
	const slbConf = env.setting.ml.controller.stepLoopButtons().init(() => {
		const resolution = +elm.select("[name=resolution]").property("value")
		agent = new DPAgent(env, resolution);
		cur_state = env.reset(agent);
		env.render(() => agent.get_score(env))
	})
	elm.append("select")
		.attr("name", "type")
		.selectAll("option")
		.data(["value", "policy"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	slbConf.step(update).epoch()

	elm.append("input")
		.attr("type", "button")
		.attr("value", "Reset")
		.on("click", () => {
			cur_state = env.reset(agent);
			env.render(() => agent.get_score(env))
		});
	let isMoving = false;
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Move")
		.on("click", function() {
			isMoving = !isMoving;
			const moveButton = d3.select(this);
			moveButton.attr("value", (isMoving) ? "Stop" : "Mode");
			(function loop() {
				if (isMoving) {
					const action = agent.get_action(env, cur_state);
					const [next_state, reward, done] = env.step(action, agent);
					env.render(() => agent.get_score(env))
					cur_state = next_state;
					setTimeout(loop, 10);
				}
			})()
		});

	return () => {
		isMoving = false;
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Data point becomes wall. Click "step" to update, click "move" to move agent.'
	platform.setting.terminate = dispDP(platform.setting.ml.configElement, platform);
}
