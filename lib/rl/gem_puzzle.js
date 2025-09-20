import { RLEnvironmentBase } from './base.js'

class GemPuzzleBoard {
	constructor(size, evaluator) {
		this._evaluator = evaluator
		this._size = size

		this.reset()
		this.random()
	}

	static UP = 0
	static RIGHT = 1
	static DOWN = 2
	static LEFT = 3

	get size() {
		return this._size
	}

	get finish() {
		const lastv = this._size[0] * this._size[1] - 1
		for (let i = 0, v = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++, v++) {
				if (v !== lastv && this._board[i][j] !== v) {
					return false
				}
			}
		}
		return this._board[this._size[0] - 1][this._size[1] - 1] == null
	}

	get emptyPosition() {
		return this.find(null)
	}

	toString() {
		let buf = ''
		const maxlen = ('' + (this._size[0] * this._size[1] - 1)).length
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				if (j > 0) {
					buf += ' '
				}
				if (this._board[i][j] === null) {
					buf += ' '.repeat(maxlen)
				} else {
					const txt = '' + this._board[i][j]
					const pad = maxlen - txt.length
					buf += txt.padStart(Math.floor(pad / 2), ' ').padEnd(maxlen, ' ')
				}
			}
			buf = buf.trimEnd()
			buf += '\n'
		}
		return buf
	}

	copy() {
		const cp = new GemPuzzleBoard(this._size, this._evaluator)
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				cp._board[i][j] = this._board[i][j]
			}
		}
		return cp
	}

	score() {
		if (this._evaluator) {
			return this._evaluator(this)
		}
		let s = 0
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				const v = this._board[i][j]
				if (v === null) {
					continue
				}
				s -= Math.abs(i - Math.floor(v / this._size[1]))
				s -= Math.abs(j - (v % this._size[1]))
			}
		}
		return s
	}

	at(p) {
		return this._board[p[0]][p[1]]
	}

	find(v) {
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				if (this._board[i][j] === v) {
					return [i, j]
				}
			}
		}
		return null
	}

	move(m) {
		const emptyPos = this.emptyPosition
		if (m === GemPuzzleBoard.UP) {
			if (emptyPos[0] <= 0) {
				return false
			}
			this._board[emptyPos[0]][emptyPos[1]] = this._board[emptyPos[0] - 1][emptyPos[1]]
			this._board[emptyPos[0] - 1][emptyPos[1]] = null
		} else if (m === GemPuzzleBoard.RIGHT) {
			if (emptyPos[1] >= this._size[1] - 1) {
				return false
			}
			this._board[emptyPos[0]][emptyPos[1]] = this._board[emptyPos[0]][emptyPos[1] + 1]
			this._board[emptyPos[0]][emptyPos[1] + 1] = null
		} else if (m === GemPuzzleBoard.DOWN) {
			if (emptyPos[0] >= this._size[0] - 1) {
				return false
			}
			this._board[emptyPos[0]][emptyPos[1]] = this._board[emptyPos[0] + 1][emptyPos[1]]
			this._board[emptyPos[0] + 1][emptyPos[1]] = null
		} else {
			if (emptyPos[1] <= 0) {
				return false
			}
			this._board[emptyPos[0]][emptyPos[1]] = this._board[emptyPos[0]][emptyPos[1] - 1]
			this._board[emptyPos[0]][emptyPos[1] - 1] = null
		}
		return true
	}

	reset() {
		this._board = []
		for (let i = 0; i < this._size[0]; i++) {
			this._board[i] = []
		}
		for (let i = 0, v = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++, v++) {
				this._board[i][j] = v
			}
		}
		this._board[this._size[0] - 1][this._size[1] - 1] = null
	}

	random() {
		this.reset()
		const n = this._size[0] * this._size[1]
		const c = this._size[1]
		const k = 4

		if (n - 1 >= k) {
			for (let i = 0; i < n; i++) {
				const idx = []
				for (let i = 0; i < k; i++) {
					idx.push(Math.floor(Math.random() * (n - i - 1)))
				}
				for (let i = k - 1; i >= 0; i--) {
					for (let j = k - 1; j > i; j--) {
						if (idx[i] <= idx[j]) {
							idx[j]++
						}
					}
				}

				const p = idx.map(i => [Math.floor(i / c), i % c])
				;[this._board[p[0][0]][p[0][1]], this._board[p[1][0]][p[1][1]]] = [
					this._board[p[1][0]][p[1][1]],
					this._board[p[0][0]][p[0][1]],
				]
				;[this._board[p[2][0]][p[2][1]], this._board[p[3][0]][p[3][1]]] = [
					this._board[p[3][0]][p[3][1]],
					this._board[p[2][0]][p[2][1]],
				]
			}
		}

		let prev = null
		for (let i = 0; i < this._size[0] * this._size[1] * 2; i++) {
			const choices = this.choices()
			let m = choices[Math.floor(Math.random() * choices.length)]
			if (
				(prev === GemPuzzleBoard.DOWN && m === GemPuzzleBoard.UP) ||
				(prev === GemPuzzleBoard.UP && m === GemPuzzleBoard.DOWN) ||
				(prev === GemPuzzleBoard.LEFT && m === GemPuzzleBoard.RIGHT) ||
				(prev === GemPuzzleBoard.RIGHT && m === GemPuzzleBoard.LEFT)
			) {
				m = choices[Math.floor(Math.random() * choices.length)]
			}
			this.move(m)
			prev = m
		}
	}

	choices() {
		const emptyPos = this.emptyPosition
		const c = []
		if (emptyPos[0] > 0) {
			c.push(GemPuzzleBoard.UP)
		}
		if (emptyPos[1] < this._size[1] - 1) {
			c.push(GemPuzzleBoard.RIGHT)
		}
		if (emptyPos[0] < this._size[0] - 1) {
			c.push(GemPuzzleBoard.DOWN)
		}
		if (emptyPos[1] > 0) {
			c.push(GemPuzzleBoard.LEFT)
		}
		return c
	}

	solve() {
		const solver = new GemPuzzleSolver(this.copy())
		solver.solve()
		return solver.path
	}
}

class GemPuzzleSolver {
	constructor(board) {
		this._board = board

		this._path = []
	}

	get path() {
		return this._path
	}

	solve() {
		let emptyPos = this._board.emptyPosition
		const r = this._board.size[0]
		const c = this._board.size[1]
		for (let i = 0; i < r - 2; i++) {
			for (let j = 0; j < c - 2; j++) {
				emptyPos = this._move(i * c + j, [i, j])
			}
			if (this._board.at([i, c - 2]) === i * c + c - 2 && this._board.at([i, c - 1]) === i * c + c - 1) {
				continue
			}
			emptyPos = this._move(i * c + c - 1, [i, c - 2])
			while (emptyPos[1] < c - 1) {
				this._step(GemPuzzleBoard.RIGHT)
				emptyPos[1]++
			}
			while (emptyPos[0] > i + 1) {
				this._step(GemPuzzleBoard.UP)
				emptyPos[0]--
			}
			if (emptyPos[0] < i + 1) {
				this._step(GemPuzzleBoard.DOWN)
				emptyPos[0]++
			}
			if (this._board.at([i, c - 1]) === i * c + c - 2) {
				this._step(GemPuzzleBoard.UP)
				this._step(GemPuzzleBoard.LEFT)
				this._step(GemPuzzleBoard.DOWN)
				this._step(GemPuzzleBoard.RIGHT)
				this._step(GemPuzzleBoard.DOWN)
				this._step(GemPuzzleBoard.LEFT)
				this._step(GemPuzzleBoard.UP)
				this._step(GemPuzzleBoard.UP)
				this._step(GemPuzzleBoard.RIGHT)
				this._step(GemPuzzleBoard.DOWN)
				this._step(GemPuzzleBoard.LEFT)
				this._step(GemPuzzleBoard.DOWN)
				this._step(GemPuzzleBoard.RIGHT)
				this._step(GemPuzzleBoard.UP)
				this._step(GemPuzzleBoard.UP)
				this._step(GemPuzzleBoard.LEFT)
				this._step(GemPuzzleBoard.DOWN)
				emptyPos[1]--
				continue
			}
			emptyPos = this._move(i * c + c - 2, [i + 1, c - 2])

			if (this._board.at([i, c - 1]) === i * c + c - 1) {
				continue
			}
			while (emptyPos[0] <= i + 1) {
				this._step(GemPuzzleBoard.DOWN)
				emptyPos[0]++
			}
			while (emptyPos[1] < c - 1) {
				this._step(GemPuzzleBoard.RIGHT)
				emptyPos[1]++
			}
			this._step(GemPuzzleBoard.UP)
			this._step(GemPuzzleBoard.UP)
			this._step(GemPuzzleBoard.LEFT)
			this._step(GemPuzzleBoard.DOWN)
			emptyPos[0]--
			emptyPos[1]--
		}

		for (let j = 0; j < c - 2; j++) {
			const lv = (r - 2) * c + j
			const hv = (r - 1) * c + j

			if (this._board.at([r - 2, j]) === lv && this._board.at([r - 1, j]) === hv) {
				continue
			}
			emptyPos = this._move(hv, [r - 2, j])
			while (emptyPos[0] < r - 1) {
				this._step(GemPuzzleBoard.DOWN)
				emptyPos[0]++
			}
			while (emptyPos[1] > j + 1) {
				this._step(GemPuzzleBoard.LEFT)
				emptyPos[1]--
			}
			if (emptyPos[1] < j + 1) {
				this._step(GemPuzzleBoard.RIGHT)
				emptyPos[1]++
			}
			if (this._board.at([r - 1, j]) === lv) {
				this._step(GemPuzzleBoard.LEFT)
				this._step(GemPuzzleBoard.UP)
				this._step(GemPuzzleBoard.RIGHT)
				this._step(GemPuzzleBoard.DOWN)
				this._step(GemPuzzleBoard.RIGHT)
				this._step(GemPuzzleBoard.UP)
				this._step(GemPuzzleBoard.LEFT)
				this._step(GemPuzzleBoard.LEFT)
				this._step(GemPuzzleBoard.DOWN)
				this._step(GemPuzzleBoard.RIGHT)
				this._step(GemPuzzleBoard.UP)
				this._step(GemPuzzleBoard.RIGHT)
				this._step(GemPuzzleBoard.DOWN)
				this._step(GemPuzzleBoard.LEFT)
				this._step(GemPuzzleBoard.LEFT)
				this._step(GemPuzzleBoard.UP)
				this._step(GemPuzzleBoard.RIGHT)
				emptyPos[0]--
				continue
			}
			emptyPos = this._move(lv, [r - 2, j + 1])
			while (emptyPos[0] < r - 1) {
				this._step(GemPuzzleBoard.DOWN)
				emptyPos[0]++
			}
			while (emptyPos[1] > j) {
				this._step(GemPuzzleBoard.LEFT)
				emptyPos[1]--
			}
			this._step(GemPuzzleBoard.UP)
			this._step(GemPuzzleBoard.RIGHT)
		}
		emptyPos = this._move((r - 2) * c + c - 2, [r - 2, c - 2])
		if (emptyPos[0] < r - 1) {
			this._step(GemPuzzleBoard.DOWN)
		}
		if (emptyPos[1] < c - 1) {
			this._step(GemPuzzleBoard.RIGHT)
		}
	}

	_step(m) {
		this._board.move(m)
		if (this._path.length > 0) {
			const lm = this._path.at(-1)
			if (
				(m === GemPuzzleBoard.UP && lm === GemPuzzleBoard.DWON) ||
				(m === GemPuzzleBoard.DOWN && lm === GemPuzzleBoard.UP) ||
				(m === GemPuzzleBoard.LEFT && lm === GemPuzzleBoard.RIGHT) ||
				(m === GemPuzzleBoard.RIGHT && lm === GemPuzzleBoard.LEFT)
			) {
				this._path.pop()
				return
			}
		}
		this._path.push(m)
	}

	_move(value, to) {
		const emptyPos = this._board.emptyPosition
		const r = this._board.size[0]
		while (emptyPos[0] <= to[0]) {
			this._step(GemPuzzleBoard.DOWN)
			emptyPos[0]++
		}
		if (this._board.at(to) === value) {
			return emptyPos
		}

		const pos = this._board.find(value)
		if (pos[1] !== to[1]) {
			if (pos[0] === emptyPos[0]) {
				if (pos[0] === r - 1) {
					this._step(GemPuzzleBoard.UP)
					emptyPos[0]--
				} else {
					this._step(GemPuzzleBoard.DOWN)
					emptyPos[0]++
				}
			}
			while (emptyPos[1] < pos[1]) {
				this._step(GemPuzzleBoard.RIGHT)
				emptyPos[1]++
			}
			while (emptyPos[1] > pos[1]) {
				this._step(GemPuzzleBoard.LEFT)
				emptyPos[1]--
			}
			if (emptyPos[0] < pos[0]) {
				while (emptyPos[0] < pos[0]) {
					this._step(GemPuzzleBoard.DOWN)
					emptyPos[0]++
				}
				pos[0]--
			} else {
				while (emptyPos[0] > pos[0] + 1) {
					this._step(GemPuzzleBoard.UP)
					emptyPos[0]--
				}
			}

			if (pos[1] < to[1]) {
				for (let t = 0; t < to[1] - pos[1]; t++) {
					this._step(GemPuzzleBoard.RIGHT)
					this._step(GemPuzzleBoard.UP)
					this._step(GemPuzzleBoard.LEFT)
					this._step(GemPuzzleBoard.DOWN)
					this._step(GemPuzzleBoard.RIGHT)
					emptyPos[1]++
				}
			} else {
				for (let t = 0; t < pos[1] - to[1]; t++) {
					this._step(GemPuzzleBoard.LEFT)
					this._step(GemPuzzleBoard.UP)
					this._step(GemPuzzleBoard.RIGHT)
					this._step(GemPuzzleBoard.DOWN)
					this._step(GemPuzzleBoard.LEFT)
					emptyPos[1]--
				}
			}
			pos[1] = to[1]
		}

		if (pos[0] !== to[0]) {
			if (pos[0] === emptyPos[0]) {
				if (pos[0] === r - 1) {
					this._step(GemPuzzleBoard.UP)
					emptyPos[0]--
				} else {
					this._step(GemPuzzleBoard.DOWN)
					emptyPos[0]++
				}
			}
			if (emptyPos[1] <= pos[1]) {
				while (emptyPos[1] <= pos[1]) {
					this._step(GemPuzzleBoard.RIGHT)
					emptyPos[1]++
				}
			} else {
				while (emptyPos[1] > pos[1] + 1) {
					this._step(GemPuzzleBoard.LEFT)
					emptyPos[1]--
				}
			}
			while (emptyPos[0] < pos[0]) {
				this._step(GemPuzzleBoard.DOWN)
				emptyPos[0]++
			}
			while (emptyPos[0] > pos[0]) {
				this._step(GemPuzzleBoard.UP)
				emptyPos[0]--
			}
			for (let t = 0; t < pos[0] - to[0]; t++) {
				this._step(GemPuzzleBoard.UP)
				this._step(GemPuzzleBoard.LEFT)
				this._step(GemPuzzleBoard.DOWN)
				this._step(GemPuzzleBoard.RIGHT)
				this._step(GemPuzzleBoard.UP)
				emptyPos[0]--
			}
			pos[0] = to[0]
		}
		return emptyPos
	}
}

/**
 * Gem puzzle environment
 */
export default class GemPuzzleRLEnvironment extends RLEnvironmentBase {
	constructor() {
		super()

		this._size = [4, 4]

		this._board = new GemPuzzleBoard(this._size, this._evaluation)

		this._reward = {
			win: 10,
			step: 0,
			invalid: -100,
		}
	}

	static UP = GemPuzzleBoard.UP
	static RIGHT = GemPuzzleBoard.RIGHT
	static DOWN = GemPuzzleBoard.DOWN
	static LEFT = GemPuzzleBoard.LEFT

	get actions() {
		return [
			[
				GemPuzzleRLEnvironment.UP,
				GemPuzzleRLEnvironment.RIGHT,
				GemPuzzleRLEnvironment.DOWN,
				GemPuzzleRLEnvironment.LEFT,
			],
		]
	}

	get states() {
		const s = []
		const n = this._size[0] * this._size[1]
		const si = Array.from({ length: n }, (_, i) => i - 1)
		for (let i = 0; i < n; i++) {
			s.push(si)
		}
		return s
	}

	set evaluation(func) {
		if (func) {
			this._board._evaluator = this._evaluation = board => {
				return func(this._makeState(board))
			}
		} else {
			this._board._evaluator = this._evaluation = null
		}
	}

	_makeState(board) {
		const s = []
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				const p = board.at([i, j])
				s.push(p === null ? -1 : p)
			}
		}
		return s
	}

	_state2board(state) {
		const board = new GemPuzzleBoard(this._size, this._evaluation)
		for (let i = 0, p = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++, p++) {
				board._board[i][j] = state[p] === -1 ? null : state[p]
			}
		}
		return board
	}

	reset() {
		super.reset()
		this._board.reset()
		this._board.random()

		return this.state()
	}

	state() {
		return this._makeState(this._board)
	}

	setState(state) {
		this._board = this._state2board(state)
	}

	step(action) {
		return super.step(action)
	}

	test(state, action) {
		const board = this._state2board(state)
		const changed = board.move(action[0])
		const done = board.finish
		const reward = (done ? this._reward.win : this._reward.step) + board.score()
		if (!changed) {
			return { state, reward: reward + this._reward.invalid, done, invalid: true }
		}
		return { state: this._makeState(board), reward, done }
	}
}
