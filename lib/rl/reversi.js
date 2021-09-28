import { RLEnvironmentBase } from './base.js'

const EMPTY = 1
const BLACK = 2
const WHITE = 3

const flipPiece = p => {
	if (p === BLACK) {
		return WHITE
	} else if (p === WHITE) {
		return BLACK
	}
	return EMPTY
}

/**
 * Reversi environment
 */
export default class ReversiRLEnvironment extends RLEnvironmentBase {
	constructor() {
		super()

		this._size = [8, 8]

		this._board = new ReversiBoard(this._size, this._evaluation)

		this._reward = {
			goal: 1,
			step: 1,
			fail: 0,
		}
	}

	static BLACK = BLACK

	static WHITE = WHITE

	static EMPTY = EMPTY

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
		for (let i = 0; i < this._size[0] * this._size[1]; i++) {
			s.push([EMPTY, BLACK, WHITE])
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

class ReversiBoard {
	constructor(size, evaluator) {
		this._evaluator = evaluator
		this._size = size

		this.reset()
	}

	get size() {
		return this._size
	}

	get count() {
		let b = 0
		let w = 0
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				if (this._board[i][j] === WHITE) {
					w++
				} else if (this._board[i][j] === BLACK) {
					b++
				}
			}
		}
		return {
			black: b,
			white: w,
		}
	}

	get finish() {
		return this.choices(BLACK).length + this.choices(WHITE).length === 0
	}

	get winner() {
		if (!this.finish) {
			return null
		}
		const count = this.count
		if (count.black > count.white) {
			return BLACK
		} else if (count.black < count.white) {
			return WHITE
		}
		return null
	}

	nextTurn(turn) {
		return flipPiece(turn)
	}

	copy() {
		const cp = new ReversiBoard(this._size, this._evaluator)
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
		if (turn === BLACK) {
			return count.black - count.white
		} else {
			return count.white - count.black
		}
	}

	at(p) {
		return this._board[p[0]][p[1]]
	}

	set(p, turn) {
		const flips = this.flipPositions(p[0], p[1], turn)
		if (flips.length === 0) {
			return false
		}
		this._board[p[0]][p[1]] = turn
		for (const [ti, tj] of flips) {
			this._board[ti][tj] = turn
		}
		return true
	}

	reset() {
		this._board = []
		for (let i = 0; i < this._size[0]; i++) {
			this._board[i] = Array(this._size[1]).fill(EMPTY)
		}
		const cx = Math.floor(this._size[0] / 2)
		const cy = Math.floor(this._size[1] / 2)
		this._board[cx - 1][cy - 1] = BLACK
		this._board[cx - 1][cy] = WHITE
		this._board[cx][cy - 1] = WHITE
		this._board[cx][cy] = BLACK
	}

	choices(turn) {
		const c = []
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				if (this.flipPositions(i, j, turn).length > 0) {
					c.push([i, j])
				}
			}
		}
		return c
	}

	flipPositions(i, j, turn) {
		if (i < 0 || j < 0 || this._size[0] <= i || this._size[1] <= j) {
			return []
		} else if (turn === EMPTY || this._board[i][j] !== EMPTY) {
			return []
		}
		const p = []
		for (const [di, dj] of [
			[1, 1],
			[1, 0],
			[1, -1],
			[0, -1],
			[-1, -1],
			[-1, 0],
			[-1, 1],
			[0, 1],
		]) {
			let ti = i
			let tj = j
			const tmp = []
			while (true) {
				ti += di
				tj += dj
				if (ti < 0 || tj < 0 || this._size[0] <= ti || this._size[1] <= tj) {
					break
				} else if (this._board[ti][tj] === turn) {
					p.push(...tmp)
					break
				} else if (this._board[ti][tj] === EMPTY) {
					break
				}
				tmp.push([ti, tj])
			}
		}
		return p
	}
}
