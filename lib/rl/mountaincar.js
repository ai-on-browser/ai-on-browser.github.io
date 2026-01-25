import { RLEnvironmentBase, RLRealRange, RLStepResult } from './base.js'

/**
 * MountainCar environment
 */
export default class MountainCarRLEnvironment extends RLEnvironmentBase {
	constructor() {
		super()
		this._position = 0
		this._velocity = 0

		this._max_position = 0.6
		this._min_position = -1.2
		this._max_velocity = 0.07

		this._goal_position = 0.5
		this._goal_velocity = 0

		this._force = 0.001
		this._g = 0.0025

		this._max_step = 200
		this._reward = {
			step: -1,
			goal: -1,
			fail: -1,
		}
	}

	get actions() {
		return [[0, 1, 2]]
	}

	get states() {
		return [new RLRealRange(-1.2, 0.6), new RLRealRange(-0.07, 0.07)]
	}

	reset() {
		super.reset()
		this._position = Math.random() * 0.2 - 0.6
		this._velocity = 0

		return this.state()
	}

	state() {
		return [this._position, this._velocity]
	}

	setState(state) {
		this._position = state[0]
		this._velocity = state[1]
	}

	test(state, action) {
		let [p, v] = state
		v += (action[0] - 1) * this._force + Math.cos(3 * p) * -this._g
		v = Math.abs(v) > this._max_velocity ? Math.sign(v) * this._max_velocity : v
		p += v
		p = p > this._max_position ? this._max_position : p < this._min_position ? this._min_position : p
		if (p === this._min_position && v < 0) {
			v = 0
		}

		const fail = this.epoch >= this._max_step
		const done = (p >= this._goal_position && v >= this._goal_velocity) || fail
		const reward = fail ? this._reward.fail : done ? this._reward.goal : this._reward.step
		return new RLStepResult(this, [p, v], reward, done)
	}
}
