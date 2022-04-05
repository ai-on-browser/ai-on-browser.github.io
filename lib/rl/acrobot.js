import { RLRealRange, RLEnvironmentBase } from './base.js'

/**
 * Acrobot environment
 */
export default class AcrobotRLEnvironment extends RLEnvironmentBase {
	constructor() {
		super()
		this._theta1 = 0
		this._theta2 = 0
		this._dtheta1 = 0
		this._dtheta2 = 0

		this._link_len1 = 1
		this._link_len2 = 1
		this._link_mass1 = 1
		this._link_mass2 = 1
		this._link_com_pos1 = 0.5
		this._link_com_pos2 = 0.5
		this._moi = 1

		this._max_vel1 = 4 * Math.PI
		this._max_vel2 = 9 * Math.PI

		this._g = 9.8
		this._dt = 0.1

		this._max_step = 200
		this._reward = {
			goal: 0,
			step: -1,
			fail: 0,
		}
	}

	get actions() {
		return [[-1, 0, 1]]
	}

	get states() {
		return [
			new RLRealRange(-Math.PI, Math.PI),
			new RLRealRange(-Math.PI, Math.PI),
			new RLRealRange(-this._max_vel1, this._max_vel1),
			new RLRealRange(-this._max_vel2, this._max_vel2),
		]
	}

	set reward(value) {
		this._reward = {
			goal: 0,
			step: -1,
			fail: 0,
		}
		if (value === 'achieve') {
			this._reward = {
				goal: 0,
				step: -1,
				fail: 0,
			}
		}
	}

	reset() {
		super.reset()
		this._theta1 = Math.random() * 0.2 - 0.1
		this._theta2 = Math.random() * 0.2 - 0.1
		this._dtheta1 = Math.random() * 0.2 - 0.1
		this._dtheta2 = Math.random() * 0.2 - 0.1

		return this.state()
	}

	state() {
		return [this._theta1, this._theta2, this._dtheta1, this._dtheta2]
	}

	step(action, agent) {
		super.step(action, agent)
		const info = this.test(this.state(), action, agent)
		this._theta1 = info.state[0]
		this._theta2 = info.state[1]
		this._dtheta1 = info.state[2]
		this._dtheta2 = info.state[3]
		return info
	}

	test(state, action) {
		let [t1, t2, dt1, dt2] = state
		const a = action[0]

		const m1 = this._link_mass1
		const m2 = this._link_mass2
		const l1 = this._link_len1
		const lc1 = this._link_com_pos1
		const lc2 = this._link_com_pos2
		const i1 = this._moi
		const i2 = this._moi
		const g = this._g

		const d1 = m1 * lc1 ** 2 + m2 * (l1 ** 2 + lc2 ** 2 + 2 * l1 * lc2 * Math.cos(t2)) + i1 + i2
		const d2 = m2 * (lc2 ** 2 + l1 * lc2 * Math.cos(t2)) + i2
		const phi2 = m2 * lc2 * g * Math.cos(t1 + t2 - Math.PI / 2)
		const phi1 =
			-m2 * l1 * lc2 * dt2 ** 2 * Math.sin(t2) -
			2 * m2 * l1 * lc2 * dt2 * dt1 * Math.sin(t2) +
			(m1 * lc1 + m2 * l1) * g * Math.cos(t1 - Math.PI / 2) +
			phi2

		const ddt2 =
			(a + (d2 / d1) * phi1 - m2 * l1 * lc2 * dt1 ** 2 * Math.sin(t2) - phi2) /
			(m2 * lc2 ** 2 + i2 - d2 ** 2 / d1)
		const ddt1 = -(d2 * ddt2 + phi2) / d1

		const clip = (x, min, max) => (x < min ? min : x > max ? max : x)
		t1 += this._dt * dt1
		if (t1 < -Math.PI) t1 = t1 + 2 * Math.PI
		if (t1 > Math.PI) t1 = t1 - 2 * Math.PI
		t2 += this._dt * dt2
		if (t2 < -Math.PI) t2 = t2 + 2 * Math.PI
		if (t2 > Math.PI) t2 = t2 - 2 * Math.PI
		dt1 = clip(dt1 + this._dt * ddt1, -this._max_vel1, this._max_vel1)
		dt2 = clip(dt2 + this._dt * ddt2, -this._max_vel2, this._max_vel2)

		const fail = this.epoch >= this._max_step
		const done = -Math.cos(t1) - Math.cos(t2 + t1) > 1 || fail
		const reward = fail ? this._reward.fail : done ? this._reward.goal : this._reward.step
		return {
			state: [t1, t2, dt1, dt2],
			reward,
			done,
		}
	}
}
