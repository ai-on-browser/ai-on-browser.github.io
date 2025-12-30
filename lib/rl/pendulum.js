import { RLEnvironmentBase, RLRealRange } from './base.js'

/**
 * Pendulum environment
 */
export default class PendulumRLEnvironment extends RLEnvironmentBase {
	constructor() {
		super()
		this._theta = 0
		this._dtheta = 0

		this._mass = 1
		this._length = 1

		this._max_speed = 8
		this._max_torque = 2

		this._g = 9.8
		this._dt = 0.05

		this._max_step = 200
	}

	get actions() {
		return [new RLRealRange(-this._max_torque, this._max_torque)]
	}

	get states() {
		return [new RLRealRange(-1, 1), new RLRealRange(-1, 1), new RLRealRange(-this._max_speed, this._max_speed)]
	}

	reset() {
		super.reset()
		this._theta = Math.random() * 2 * Math.PI - Math.PI
		this._dtheta = Math.random() - 0.5

		return this.state()
	}

	state() {
		return [Math.cos(this._theta), Math.sin(this._theta), this._dtheta]
	}

	setState(state) {
		this._theta = Math.atan2(state[1], state[0])
		this._dtheta = state[2]
	}

	test(state, action) {
		let t = Math.atan2(state[1], state[0])
		let dt = state[2]

		const clip = (x, min, max) => (x < min ? min : x > max ? max : x)
		const a = clip(action[0], -this._max_torque, this._max_torque)

		const g = this._g
		const m = this._mass
		const l = this._length

		const c = this._angle_normalize(t) ** 2 + 0.1 * dt ** 2 + 0.001 * a ** 2

		dt += (((-3 * g) / (2 * l)) * Math.sin(t + Math.PI) + (3 / (m * l ** 2)) * a) * this._dt

		t += dt * this._dt
		dt = clip(dt, -this._max_speed, this._max_speed)
		return {
			state: [Math.cos(t), Math.sin(t), dt],
			reward: -c,
			done: this.epoch >= this._max_step,
		}
	}

	_angle_normalize(t) {
		t += Math.PI
		const pi2 = 2 * Math.PI
		while (t < 0) t += pi2
		while (t >= pi2) t -= pi2
		return t - Math.PI
	}
}
