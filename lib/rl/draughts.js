import { RLEnvironmentBase } from './base.js'

const EMPTY = 1
const RED = 2
const WHITE = 4
const KING = 8
const RED2 = RED | KING
const WHITE2 = WHITE | KING

/**
 * Draughts environment
 */
export default class DraughtsRLEnvironment extends RLEnvironmentBase {
	constructor() {
		super()

		this._size = [8, 8]

		this._board = new DraughtsBoard(this._size, this._evaluation)

		this._reward = {
			goal: 1,
			step: 1,
			fail: 0,
		}
	}

	static EMPTY = EMPTY

	static RED = RED

	static WHITE = WHITE

	static KING = KING

	get actions() {
		const a = []
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				a.push(`${i}_${j}`)
			}
		}
		return [a]
	}

	get states() {
		const s = []
		for (let i = 0; i < (this._size[0] * this._size[1]) / 2; i++) {
			s.push([EMPTY, RED, WHITE])
		}
		return s
	}

	set reward(value) {}

	set evaluation(func) {
		this._evaluation = func
	}

	reset() {
		super.reset()
		this._board.reset()

		return this.state()
	}

	state(agent) {
		const s = []
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				s.push(this._board.at([i, j]))
			}
		}
		return s
	}

	step(action, agent) {
		super.step(action, agent)
		const info = this.test(this.state, action, agent)
		return info
	}

	test(state, action, agent) {
		return {
			state: [],
			reward: 0,
			done: false,
		}
	}
}

class DraughtsBoard {
	constructor(size, evaluator) {
		this._evaluator = evaluator
		this._size = size

		this.reset()
	}

	get size() {
		return this._size
	}

	get count() {
		const c = {}
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				if (!c[this._board[i][j]]) {
					c[this._board[i][j]] = 0
				}
				c[this._board[i][j]]++
			}
		}
		return {
			red: c[RED] || 0,
			white: c[WHITE] || 0,
			redking: c[RED2] || 0,
			whiteking: c[WHITE2] || 0,
		}
	}

	get finish() {
		return this.choices(RED).length === 0 || this.choices(WHITE).length === 0
	}

	get winner() {
		if (this.choices(RED).length === 0) {
			return WHITE
		} else if (this.choices(WHITE).length === 0) {
			return RED
		}
		return null
	}

	nextTurn(turn) {
		if (turn === WHITE) {
			return RED
		} else {
			return WHITE
		}
	}

	copy() {
		const cp = new DraughtsBoard(this._size, this._evaluator)
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				cp._board[i][j] = this._board[i][j]
			}
		}
		return cp
	}

	score(turn) {
		if (this._evaluator) {
			return this._evaluator(this, turn)
		}
		const count = this.count
		if (turn === RED) {
			return count.red + count.redking * 2 - count.white - count.whiteking * 4
		} else {
			return count.white + count.whiteking * 2 - count.red - count.redking * 4
		}
	}

	at(p) {
		return this._board[p[0]][p[1]]
	}

	set(p, turn) {
		let piece = this._board[p.from[0]][p.from[1]]
		this._board[p.from[0]][p.from[1]] = EMPTY
		for (const [i, j] of p.jump) {
			this._board[i][j] = EMPTY
		}
		const lastp = p.path[p.path.length - 1]
		if (turn === RED && lastp[0] === this._size[0] - 1) {
			piece |= KING
		} else if (turn === WHITE && lastp[0] === 0) {
			piece |= KING
		}
		this._board[lastp[0]][lastp[1]] = piece
		return true
	}

	reset() {
		this._board = []
		for (let i = 0; i < this._size[0]; i++) {
			this._board[i] = Array(this._size[1]).fill(EMPTY)
		}
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				if (i < 3 && (i + j) % 2 === 0) {
					this._board[i][j] = RED
				} else if (this._size[0] - 3 <= i && (i + j) % 2 === 0) {
					this._board[i][j] = WHITE
				}
			}
		}
	}

	choices(turn) {
		const c = []
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				if (this._board[i][j] & turn) {
					c.push(...this.allPath(i, j, turn))
				}
			}
		}
		if (c.some(p => p.jump.length > 0)) {
			return c.filter(p => p.jump.length > 0)
		}
		return c
	}

	allPath(x, y, turn, first = true) {
		if (!(this._board[x][y] & turn)) {
			return []
		}
		const checkBound = (x, y) => 0 <= x && x < this._size[0] && 0 <= y && y < this._size[1]
		const nt = turn === RED ? WHITE : RED
		const d = []
		if (this._board[x][y] & KING) {
			d.push([1, 1], [-1, 1], [-1, -1], [1, -1])
		} else {
			if (turn === RED) {
				d.push([1, 1], [1, -1])
			} else {
				d.push([-1, 1], [-1, -1])
			}
		}
		const info = []
		for (const [dx, dy] of d) {
			if (!checkBound(x + dx, y + dy)) {
				continue
			}
			if (first && this._board[x + dx][y + dy] === EMPTY) {
				info.push({
					from: [x, y],
					path: [[x + dx, y + dy]],
					jump: [],
				})
			}
			if (!(this._board[x + dx][y + dy] & nt)) {
				continue
			}
			if (!checkBound(x + dx * 2, y + dy * 2)) {
				continue
			}
			if (this._board[x + dx * 2][y + dy * 2] === EMPTY) {
				const cp = this.copy()
				cp._board[x + dx * 2][y + dy * 2] = this._board[x][y]
				cp._board[x][y] = EMPTY
				cp._board[x + dx][y + dy] = EMPTY
				if (turn === RED && x * dx * 2 === this._size[0] - 1) {
					cp._board[x + dx * 2][y + dy * 2] |= KING
				} else if (turn === WHITE && x * dx * 2 === 0) {
					cp._board[x + dx * 2][y + dy * 2] |= KING
				}
				const npath = cp.allPath(x + dx * 2, y + dy * 2, turn, false)
				if (npath.length === 0) {
					info.push({
						from: [x, y],
						path: [[x + dx * 2, y + dy * 2]],
						jump: [[x + dx, y + dy]],
					})
				} else {
					for (const ninfo of npath) {
						info.push({
							from: [x, y],
							path: [[x + dx * 2, y + dy * 2], ...ninfo.path],
							jump: [[x + dx, y + dy], ...ninfo.jump],
						})
					}
				}
			}
		}
		return info
	}
}
