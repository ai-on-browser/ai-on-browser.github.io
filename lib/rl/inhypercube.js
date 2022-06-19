import { RLRealRange, RLEnvironmentBase } from './base.js'

/**
 * In-hypercube environment
 */
export default class InHypercubeRLEnvironment extends RLEnvironmentBase {
	/**
	 * @param {number} [d=2] Dimension of the environment
	 */
	constructor(d = 2) {
		super()
		this._d = d
		this._position = Array(this._d).fill(0)
		this._velocity = Array(this._d).fill(0)

		this._force = 0.1

		this._success_dim = 0
		this._fail_position = 1

		this._max_step = 20
		this._reward = {
			goal: 1,
			step: 0,
			fail: 0,
		}
	}

	get actions() {
		return [Array.from({ length: this._d * 2 }, (_, i) => i)]
	}

	get states() {
		const s = []
		for (let i = 0; i < this._d; i++) {
			s.push(new RLRealRange(-this._fail_position, this._fail_position))
		}
		for (let i = 0; i < this._d; i++) {
			s.push(new RLRealRange(-1, 1))
		}
		return s
	}

	set reward(value) {
		this._reward = {
			goal: 1,
			step: 0,
			fail: 0,
		}
	}

	reset() {
		super.reset()
		this._position = Array(this._d).fill(0)
		this._velocity = Array(this._d).fill(0)

		return this.state()
	}

	state() {
		return [...this._position, ...this._velocity]
	}

	step(action, agent) {
		super.step(action, agent)
		const info = this.test(this.state(), action, agent)
		this._position = info.state.slice(0, this._d)
		this._velocity = info.state.slice(this._d)
		return info
	}

	test(state, action) {
		const p = state.slice(0, this._d)
		const dp = state.slice(this._d)
		const d = Math.floor(action[0] / 2)
		dp[d] = this._force * (action[0] % 2 === 0 ? 1 : -1)
		for (let i = 0; i < this._d; i++) {
			p[i] += dp[i]
		}

		const success = p[this._success_dim] <= -this._fail_position
		const fail = !success && p.every(v => Math.abs(v) >= this._fail_position)
		const done = this.epoch >= this._max_step || success || fail
		const reward = fail ? this._reward.fail : success ? this._reward.goal : this._reward.step
		return {
			state: [...p, ...dp],
			reward,
			done,
		}
	}
}
