import { RLEnvironmentBase, RLRealRange } from './base.js'

/**
 * Breaker environment
 */
export default class BreakerRLEnvironment extends RLEnvironmentBase {
	constructor() {
		super()
		this._size = [300, 500]

		this._padding = [
			[30, 30],
			[370, 30],
		]
		this._block_size = [30, 10]
		this._paddle_baseline = 20
		this._paddle_size = [60, 8]
		this._ball_radius = 3
		this._ball_speed = 3
		this._paddle_speed = 5

		this._block_positions = []
		for (let i = this._padding[0][0]; i < this._size[0] - this._padding[0][1]; i += this._block_size[0]) {
			for (let j = this._padding[1][0]; j < this._size[1] - this._padding[1][1]; j += this._block_size[1]) {
				this._block_positions.push([i + this._block_size[0] / 2, j + this._block_size[1] / 2])
			}
		}

		this._ball_position = [0, 0]
		this._paddle_position = 0
		this._ball_velocity = [0, 0]
		this._block_existances = []

		this._reward = {
			break: 100,
			step: 0.1,
			hit: 100,
			goal: 1000,
			fail: -1000,
		}
	}

	get actions() {
		return [[-1, 0, 1]]
	}

	get states() {
		const block_existance = []
		for (let i = 0; i < this._block_positions.length; i++) {
			block_existance[i] = [0, 1]
		}
		return [
			new RLRealRange(0, this._size[0]),
			new RLRealRange(0, this._size[1]),
			new RLRealRange(-2, 2),
			new RLRealRange(-2, 2),
			new RLRealRange(0, this._size[0]),
			...block_existance,
		]
	}

	set reward(value) {}

	reset() {
		super.reset()
		this._paddle_position = this._size[0] / 2
		this._ball_position = [
			this._size[0] / 2,
			this._paddle_baseline + this._paddle_size[1] / 2 + this._ball_radius * 2,
		]

		const vx = Math.random() * (this._ball_speed - 0.1) * 2 - (this._ball_speed - 0.1)
		const vy = Math.sqrt(Math.abs(vx ** 2 - this._ball_speed ** 2))
		this._ball_velocity = [vx, vy]
		this._block_existances = []
		for (let i = 0; i < this._block_positions.length; i++) {
			this._block_existances[i] = 1
		}
		return this.state()
	}

	state() {
		return [...this._ball_position, ...this._ball_velocity, this._paddle_position, ...this._block_existances]
	}

	step(action, agent) {
		super.step(action, agent)
		const { state, reward, done } = this.test(this.state(), action, agent)
		this._ball_position[0] = state[0]
		this._ball_position[1] = state[1]
		this._ball_velocity[0] = state[2]
		this._ball_velocity[1] = state[3]
		this._paddle_position = state[4]
		this._block_existances = state.slice(5)
		return { state, reward, done }
	}

	test(state, action, agent) {
		let move_paddle = state[4] + this._paddle_speed * action[0]
		if (move_paddle < this._paddle_size[0] / 2) {
			move_paddle = this._paddle_size[0] / 2
		} else if (move_paddle > this._size[0] - this._paddle_size[0] / 2) {
			move_paddle = this._size[0] - this._paddle_size[0] / 2
		}
		const move_ball = [state[0], state[1]]
		const velo_ball = [state[2], state[3]]
		for (let i = 0; i < 2; i++) {
			move_ball[i] += velo_ball[i]
		}
		const block_existance = state.slice(5)
		let min_d = Infinity
		let new_velo = velo_ball
		let hit_paddle = false
		{
			const [d, v] = this._check_contact(move_ball, [move_paddle, this._paddle_baseline], this._paddle_size)
			if (d < min_d) {
				min_d = d
				new_velo = [velo_ball[0] * v[0], velo_ball[1] * v[1]]
				hit_paddle = true
			}
		}
		for (const x of [-10, this._size[0] + 10]) {
			const [d, _] = this._check_contact(move_ball, [x, this._size[1] / 2], [20, this._size[1]])
			if (d < min_d) {
				min_d = d
				new_velo = [-Math.sign(x) * Math.abs(velo_ball[0]), velo_ball[1]]
				hit_paddle = false
			}
		}
		{
			const [d, _] = this._check_contact(move_ball, [this._size[0] / 2, this._size[1] + 10], [this._size[0], 20])
			if (d < min_d) {
				min_d = d
				new_velo = [velo_ball[0], -Math.abs(velo_ball[1])]
				hit_paddle = false
			}
		}
		const [under_d, _] = this._check_contact(move_ball, [this._size[0] / 2, -10], [this._size[0], 20])
		let erace_block = -1
		for (let i = 0; i < block_existance.length; i++) {
			if (block_existance[i] === 0) {
				continue
			}
			const [d, v] = this._check_contact(move_ball, this._block_positions[i], this._block_size)
			if (d < min_d) {
				min_d = d
				new_velo = [velo_ball[0] * v[0], velo_ball[1] * v[1]]
				erace_block = i
				hit_paddle = false
			}
		}
		let reward = this._reward.step
		if (erace_block >= 0) {
			block_existance[erace_block] = 0
			reward = this._reward.break
		}
		if (under_d < Infinity) {
			reward = this._reward.fail
		} else if (hit_paddle) {
			reward = this._reward.hit
		}
		const done = block_existance.every(e => e === 0) || under_d < Infinity
		return {
			state: [...move_ball, ...new_velo, move_paddle, ...block_existance],
			reward,
			done,
		}
	}

	_check_contact(ball_c, block_c, block_size) {
		for (let i = 0; i < 2; i++) {
			if (
				ball_c[i] + this._ball_radius < block_c[i] - block_size[i] / 2 ||
				block_c[i] + block_size[i] / 2 < ball_c[i] - this._ball_radius
			) {
				return [Infinity, []]
			}
		}
		let d = Infinity
		for (const [rl, ud] of [
			[-1, -1],
			[-1, 1],
			[1, -1],
			[1, 1],
		]) {
			if (rl * ball_c[0] <= rl * block_c[0] + block_size[0] / 2) {
				continue
			}
			if (ud * ball_c[1] <= ud * block_c[1] + block_size[1] / 2) {
				continue
			}
			const r = Math.sqrt(
				(ball_c[0] - (block_c[0] + (rl * block_size[0]) / 2)) ** 2 +
					(ball_c[1] - (block_c[1] + (ud * block_size[1]) / 2)) ** 2
			)
			if (r > this._ball_radius) {
				return [Infinity, []]
			}
			d = r
		}
		if (d === Infinity) {
			if (ball_c[0] + this._ball_radius < block_c[0] - block_size[0] / 2) {
				d = block_c[0] - block_size[0] / 2 - ball_c[0]
			} else if (ball_c[1] + this._ball_radius < block_c[1] - block_size[1] / 2) {
				d = block_c[1] - block_size[1] / 2 - ball_c[1]
			} else if (ball_c[0] - this._ball_radius > block_c[0] + block_size[0] / 2) {
				d = ball_c[0] - (block_c[0] + block_size[0] / 2)
			} else if (ball_c[1] - this._ball_radius > block_c[1] + block_size[1] / 2) {
				d = ball_c[1] - (block_c[1] + block_size[1] / 2)
			} else {
				d = 0
			}
		}
		let off = null
		if (ball_c[1] >= block_c[1]) {
			off = ball_c[1] - (block_c[1] + block_size[1] / 2)
		} else {
			off = block_c[1] - block_size[1] / 2 - ball_c[1]
		}
		if (block_c[0] - block_size[0] / 2 - off < ball_c[0] && ball_c[0] < block_c[0] + block_size[0] / 2 + off) {
			return [d, [1, -1]]
		} else {
			return [d, [-1, 1]]
		}
	}
}
