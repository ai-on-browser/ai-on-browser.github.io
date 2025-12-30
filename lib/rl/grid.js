import { RLEnvironmentBase, RLIntRange } from './base.js'

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
		this.__map ??= []
		if (this.__map.length < this._size[0]) {
			for (let i = this.__map.length; i < this._size[0]; i++) {
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

	resetMap() {
		this._points = []
	}

	resetMapAsMaze() {
		const size = this._size
		const map = Array.from({ length: size[0] }, () => Array(size[1]).fill(true))
		const points = [[0, 0]]
		map[0][0] = false

		while (points.length > 0) {
			for (let i = points.length - 1; i > 0; i--) {
				const r = Math.floor(Math.random() * (i + 1))
				;[points[i], points[r]] = [points[r], points[i]]
			}
			const [x0, y0] = points.pop()
			let x = x0
			let y = y0
			while (true) {
				const ds = []
				if (x > 0 && map[x - 2][y]) ds.push([-1, 0])
				if (x < size[0] - 2 && map[x + 2][y]) ds.push([1, 0])
				if (y > 0 && map[x][y - 2]) ds.push([0, -1])
				if (y < size[1] - 2 && map[x][y + 2]) ds.push([0, 1])
				if (ds.length === 0) {
					break
				}
				const [dx, dy] = ds[Math.floor(Math.random() * ds.length)]
				map[x + dx][y + dy] = false
				map[x + dx * 2][y + dy * 2] = false
				x += dx * 2
				y += dy * 2
				points.push([x, y])
			}
		}
		this._points = []
		for (let i = 0; i < size[0]; i++) {
			for (let j = 0; j < size[1]; j++) {
				if (size[0] % 2 === 0 && i === size[0] - 1 && !map[i - 1][j]) {
					continue
				} else if (size[1] % 2 === 0 && j === size[1] - 1 && !map[i][j - 1]) {
					continue
				}
				if (map[i][j]) this._points.push([i, j])
			}
		}
	}

	state() {
		return this._position
	}

	setState(state) {
		this._position = state
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
