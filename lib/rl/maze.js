import { RLEnvironmentBase, RLIntRange, RLRealRange, RLStepResult } from './base.js'

/**
 * Smooth maze environment
 */
export default class SmoothMazeRLEnvironment extends RLEnvironmentBase {
	/**
	 * @param {number} width Area width
	 * @param {number} height Area height
	 */
	constructor(width, height) {
		super()
		this._width = width
		this._height = height
		this._points = []
		this._map_resolution = [100, 50]
		this._goal_size = [50, 50]
		this._position = Array(2).fill(0)
		this._orient = 0
		this._velocity = 10
		this._rotate = 5
		this._max_step = 3000

		this.__map = []
		for (let i = 0; i < this._map_resolution[0]; i++) {
			this.__map[i] = Array(this._map_resolution[1])
		}

		this._reward = {
			step: -1,
			wall: -2,
			goal: 200,
			fail: -100,
		}
	}

	get actions() {
		return [[0, 1, 2, 3]]
	}

	get states() {
		return [new RLRealRange(0, this._width), new RLRealRange(0, this._height), new RLIntRange(0, 359)]
	}

	get map() {
		for (let i = 0; i < this._map_resolution[0]; i++) {
			this.__map[i].fill(0)
		}

		this._points.forEach(p => {
			this.__map[p[0]][p[1]] = 1 - this.__map[p[0]][p[1]]
		})
		this.__map[0][0] = 0
		this.__map[this._map_resolution[0] - 1][this._map_resolution[1] - 1] = 0
		return this.__map
	}

	reset() {
		super.reset()
		this._position = Array(2).fill(0)
		this._position[0] = (Math.random() * this._width) / 4
		this._position[1] = (Math.random() * this._height) / 4
		this._orient = Math.random() * 360

		return this.state()
	}

	state() {
		return [this._position[0], this._position[1], this._orient]
	}

	setState(state) {
		this._position = [state[0], state[1]]
		this._orient = state[2]
	}

	test(state, action) {
		let reward = this._reward.step
		let [x, y, o] = state
		const map = this.map
		const rx = this._width / this._map_resolution[0]
		const ry = this._height / this._map_resolution[1]
		const dx = Math.cos((o / 180) * Math.PI) * this._velocity
		const dy = Math.sin((o / 180) * Math.PI) * this._velocity
		if (action[0] === 0) {
			x += dx
			y += dy
		} else if (action[0] === 1) {
			x -= dx
			y -= dy
		} else if (action[0] === 2) {
			o += this._rotate
		} else if (action[0] === 3) {
			o -= this._rotate
		}
		o = (o + 360) % 360
		if (x < 0 || y < 0 || x >= this._width || y >= this._height) {
			reward = this._reward.wall
			;[x, y, o] = state
		} else if (map[Math.floor(x / rx)][Math.floor(y / ry)] !== 0) {
			reward = this._reward.wall
			;[x, y, o] = state
		}
		const fail = this._max_step && this._max_step <= this.epoch
		const done = (x > this._width - this._goal_size[0] && y > this._height - this._goal_size[1]) || fail
		if (done) reward = this._reward.goal
		if (fail) reward = this._reward.fail
		return new RLStepResult(this, [x, y, o], reward, done)
	}
}
