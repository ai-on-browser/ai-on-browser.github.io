import { RLRealRange, RLEnvironmentBase } from './base.js'

/**
 * Cartpole environment
 */
export default class CartPoleRLEnvironment extends RLEnvironmentBase {
	constructor() {
		super()
		this._position = 0
		this._angle = 0
		this._cart_velocity = 0
		this._pendulum_velocity = 0

		if (true) {
			this._cart_weight = 0.711
			this._pendulum_weight = 0.209
			this._pendulum_length = 0.326
		} else {
			// OpenAI gym setting
			this._cart_weight = 1.0
			this._pendulum_weight = 0.1
			this._pendulum_length = 0.5
		}
		this._g = 9.8
		this._t = 0.02
		this._force = 10

		this._fail_position = 2.4
		this._fail_angle = (12 / 180) * Math.PI

		this._max_step = 200
		this._reward = {
			goal: 1,
			step: 1,
			fail: 0,
		}
	}

	get actions() {
		return [[0, 1]]
	}

	get states() {
		return [
			new RLRealRange(-this._fail_position, this._fail_position),
			new RLRealRange(-this._fail_angle, this._fail_angle),
			new RLRealRange(-2, 2),
			new RLRealRange(-3, 3),
		]
	}

	set reward(value) {
		this._reward = {
			goal: 1,
			step: 1,
			fail: 0,
		}
	}

	reset() {
		super.reset()
		this._position = Math.random() * 0.1 - 0.05
		this._angle = Math.random() * 0.1 - 0.05
		this._cart_velocity = Math.random() * 0.1 - 0.05
		this._pendulum_velocity = Math.random() * 0.1 - 0.05

		return this.state()
	}

	state() {
		return [this._position, this._angle, this._cart_velocity, this._pendulum_velocity]
	}

	step(action, agent) {
		super.step(action, agent)
		const info = this.test(this.state(), action, agent)
		this._position = info.state[0]
		this._angle = info.state[1]
		this._cart_velocity = info.state[2]
		this._pendulum_velocity = info.state[3]
		return info
	}

	test(state, action) {
		let [x, t, dx, dt] = state
		const f = this._force * (action[0] === 0 ? -1 : 1)

		const M = this._cart_weight
		const m = this._pendulum_weight
		const l = this._pendulum_length
		const sint = Math.sin(t)
		const cost = Math.cos(t)
		const ddt =
			((M + m) * this._g * sint - cost * (f + m * l * dt ** 2 * sint)) / (l * ((4 / 3) * (M + m) - m * cost ** 2))
		const ddx = (f + m * l * (dt ** 2 * sint - ddt * cost)) / (M + m)
		x += dx * this._t
		t += dt * this._t
		dx += ddx * this._t
		dt += ddt * this._t

		const fail = Math.abs(t) >= this._fail_angle || Math.abs(x) > this._fail_position
		const done = this.epoch >= this._max_step || fail
		const reward = fail ? this._reward.fail : done ? this._reward.goal : this._reward.step
		return {
			state: [x, t, dx, dt],
			reward,
			done,
		}
	}
}
