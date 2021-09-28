import { RLIntRange, RLEnvironmentBase } from './base.js'

/**
 * Grid world environment
 */
export default class GridMazeRLEnvironment extends RLEnvironmentBase {
	constructor() {
		super()
		this._points = []
		this._dim = 2
		this._size = [20, 10]
		this._position = Array(this._dim).fill(0)
		this._max_step = 0

		this._reward = {
			step: -1,
			wall: -2,
			goal: 5,
			fail: -100,
		}

		this.__map = null
	}

	get size() {
		return this._size
	}

	get actions() {
		return this._dim === 1 ? [[0, 1]] : [[0, 1, 2, 3]]
	}

	get _action_move() {
		return this._dim === 1
			? [[1], [-1]]
			: [
					[1, 0],
					[0, 1],
					[-1, 0],
					[0, -1],
			  ]
	}

	get states() {
		const st = []
		for (let i = 0; i < this._dim; i++) {
			st.push(new RLIntRange(0, this._size[i] - 1))
		}
		return st
	}

	get map() {
		if (!this.__map) {
			this.__map = []
			for (let i = 0; i < this._size[0]; i++) {
				this.__map[i] = Array(this._size[1])
			}
		}
		for (let i = 0; i < this._size[0]; i++) {
			this.__map[i].fill(false)
		}

		this._points.forEach(p => {
			this.__map[p[0]][p[1]] = 1 - this.__map[p[0]][p[1]]
		})
		this.__map[0][0] = false
		this.__map[this._size[0] - 1][this._size[1] - 1] = false
		return this.__map
	}

	set reward(value) {
		this._reward = {
			step: -1,
			wall: -2,
			goal: 5,
			fail: -100,
		}
		if (value === 'achieve') {
			const _this = this
			this._reward = {
				get step() {
					return Math.sqrt(_this._position[0] ** 2 + _this._position[1] ** 2)
				},
				wall: 0,
				goal: 0,
				fail: 0,
			}
		}
	}

	reset() {
		super.reset()
		this._position = Array(this._dim).fill(0)

		return this._position
	}

	state() {
		return this._position
	}

	step(action) {
		super.step(action)
		const info = this.test(this.state(), action)
		this._position = info.state
		return info
	}

	test(state, action) {
		let reward = this._reward.step
		let mov_state = [].concat(state)
		const map = this.map
		const moves = this._action_move[action[0]]
		for (let i = 0; i < moves.length; i++) {
			mov_state[i] += moves[i]
		}
		if (mov_state.some((s, i) => s < 0 || this._size[i] <= s)) {
			reward = this._reward.wall
			mov_state = [].concat(state)
		} else if (map[mov_state[0]][mov_state[1] || 0]) {
			reward = this._reward.wall
			mov_state = [].concat(state)
		}
		const fail = this._max_step && this._max_step <= this.epoch
		const done = mov_state.every((v, i) => v === this._size[i] - 1) || fail
		if (done) reward = this._reward.goal
		if (fail) reward = this._reward.fail
		return {
			state: mov_state,
			reward,
			done,
		}
	}
}
