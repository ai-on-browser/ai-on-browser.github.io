import { RLRealRange, RLEnvironmentBase } from './base.js'

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

	set reward(value) {
		this._reward = {
			step: -1,
			goal: -1,
			fail: -1,
		}
		if (value === 'achieve') {
			const _this = this
			this._reward = {
				step: 0,
				get goal() {
					return (
						-Math.abs(_this._position - _this._goal_position) +
						Math.abs(_this._velocity - _this._goal_velocity)
					)
				},
				get fail() {
					return (
						-Math.abs(_this._position - _this._goal_position) +
						Math.abs(_this._velocity - _this._goal_velocity)
					)
				},
			}
		}
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

	step(action) {
		super.step(action)
		const info = this.test(this.state(), action)
		this._position = info.state[0]
		this._velocity = info.state[1]
		return info
	}

	test(state, action) {
		let [p, v] = state
		v += (action[0] - 1) * this._force + Math.cos(3 * this._position) * -this._g
		v = Math.abs(v) > this._max_velocity ? Math.sign(v) * this._max_velocity : v
		p += v
		p = p > this._max_position ? this._max_position : p < this._min_position ? this._min_position : p
		if (p === this._min_position && v < 0) {
			v = 0
		}

		const fail = this.epoch >= this._max_step
		const done = (p >= this._goal_position && v >= this._goal_velocity) || fail
		const reward = fail ? this._reward.fail : done ? this._reward.goal : this._reward.step
		return {
			state: [p, v],
			reward,
			done,
		}
	}
}
