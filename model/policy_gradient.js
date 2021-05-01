import { QTableBase } from './q_learning.js'

class SoftmaxPolicyGradient {
	// https://book.mynavi.jp/manatee/detail/id=88297
	// https://qiita.com/shionhonda/items/ec05aade07b5bea78081
	constructor(env, resolution = 20) {
		this._params = new QTableBase(env, resolution);
		this._epoch = 0;
	}

	get _state_sizes() {
		return this._params._state_sizes;
	}

	get _action_sizes() {
		return this._params._action_sizes;
	}

	_state_index(state) {
		return this._params._state_index(state);
	}

	_action_index(action) {
		return this._params._action_index(action);
	}

	probability(state) {
		state = this._params._state_index(state)
		const [p] = this._params._q(state);
		const expp = p.map(Math.exp);
		const s = expp.reduce((a, v) => a + v, 0)
		const pi = expp.map(v => v / s);
		return pi
	}

	toArray() {
		return this._params.toArray()
	}

	get_action(state) {
		const pi = this.probability(state)
		const r = Math.random();
		let cumu = 0;
		let k = -1
		for (let i = 0; i < pi.length; i++) {
			cumu += pi[i];
			if (r < cumu) {
				k = i;
				break
			}
		}
		return this._params._action_value(this._params._to_index(this._action_sizes, k))
	}

	update(actions, learning_rate) {
		const n = actions.length
		const stateCount = []
		const actionCount = {}
		for (const action of actions) {
			let [act, state, reward] = action;
			state = this._state_index(state)
			act = this._action_index(act)
			const si = this._params._to_position(this._state_sizes, state)[0]
			stateCount[si] = (stateCount[si] || 0) + 1

			const [_, i] = this._params._q(state, act)
			if (!actionCount[i]) {
				const prob = this.probability(state);
				const aidx = this._params._to_position(this._action_sizes, act)[0]
				actionCount[i] = {
					n: 0,
					s: si,
					p: prob[aidx]
				}
			}
			actionCount[i].n++
		}
		for (const i of Object.keys(actionCount)) {
			const a = actionCount[i]
			this._params._table[i] += learning_rate * (a.n + a.p * stateCount[a.s]) / n
		}
		this._epoch++;
	}
}

class PGAgent {
	constructor(env, resolution = 20) {
		this._table = new SoftmaxPolicyGradient(env, resolution);
	}

	get_score(env) {
		return this._table.toArray();
	}

	get_action(env, state) {
		return this._table.get_action(state);
	}

	update(actions, learning_rate) {
		this._table.update(actions, learning_rate);
	}
}

var dispPolicyGradient = function(elm, env) {
	const initResolution = env.type === 'grid' ? Math.max(...env.env.size) : 20;

	let agent = new PGAgent(env, initResolution);
	let cur_state = env.reset(agent);
	env.render(() => agent.get_score(env))

	let action_history = [];

	const step = (render = true) => {
		const learning_rate = +elm.select("[name=learning_rate]").property("value")
		const action = agent.get_action(env, cur_state);
		const [next_state, reward, done] = env.step(action, agent);
		action_history.push([action, cur_state, reward]);
		if (render) {
			env.render()
		}
		cur_state = next_state;
		if (done) {
			agent.update(action_history, learning_rate)
			action_history = [];
		}
		return done;
	}

	const reset = () => {
		cur_state = env.reset(agent);
		action_history = [];
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
		agent = new PGAgent(env, resolution);
		reset();
	})
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Reset")
		.on("click", reset);
	elm.append("span")
		.text(" Learning rate ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "learning_rate")
		.attr("min", 0.01)
		.attr("max", 10)
		.attr("step", "0.01")
		.attr("value", 0.1)
	slbConf.step(cb => {
		if (step()) {
			setTimeout(() => {
				reset();
				cb && setTimeout(cb, 10);
			})
		} else {
			cb && setTimeout(cb, 5);
		}
	}).skip(() => {
		if (step(false)) {
			reset()
		}
	})
	env.plotRewards(elm)

	return () => {
		slbConf.stop()
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Data point becomes wall. Click "step" to update.'
	platform.setting.terminate = dispPolicyGradient(platform.setting.ml.configElement, platform)
}
