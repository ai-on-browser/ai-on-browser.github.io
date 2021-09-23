import { RLEnvironmentBase } from './base.js'

const EMPTY = 1
const BLACK = 2
const WHITE = 3

export default class GomokuRLEnvironment extends RLEnvironmentBase {
	constructor() {
		super()

		this._size = [8, 8]

		this._board = new GomokuBoard(this._size, this._evaluation)

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

class GomokuBoard {
	constructor(size, evaluator) {
		this._evaluator = evaluator
		this._size = size
		this._a = 5
		this._count = 0

		this.reset()
	}

	get size() {
		return this._size
	}

	get finish() {
		return this.winner !== null || this._count === this._size[0] * this._size[1]
	}

	get winner() {
		if (this.row(WHITE, this._a).length > 0) {
			return WHITE
		} else if (this.row(BLACK, this._a).length > 0) {
			return BLACK
		}
		return null
	}

	nextTurn(turn) {
		return turn === BLACK ? WHITE : BLACK
	}

	copy() {
		const cp = new GomokuBoard(this._size, this._evaluator)
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				cp._board[i][j] = this._board[i][j]
			}
		}
		cp._count = this._count
		return cp
	}

	score(turn) {
		if (this._evaluator) {
			return this._evaluator(this, turn)
		}
		const winner = this.winner
		const nt = this.nextTurn(turn)
		if (winner === turn) return this._size[0] * this._size[1] * 100 - this._count
		if (winner === nt) return -this._size[0] * this._size[1] * 100 + this._count
		return 0
	}

	at(p) {
		return this._board[p[0]][p[1]]
	}

	set(p, turn) {
		if (this.at(p) !== EMPTY) {
			return false
		}
		this._board[p[0]][p[1]] = turn
		this._count++
		return true
	}

	reset() {
		this._count = 0
		this._board = []
		for (let i = 0; i < this._size[0]; i++) {
			this._board[i] = Array(this._size[1]).fill(EMPTY)
		}
	}

	choices(turn) {
		const c = []
		if (this.finish) {
			return c
		}
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				if (this._board[i][j] === EMPTY) {
					c.push([i, j])
				}
			}
		}
		return c
	}

	row(turn, length, separate = false) {
		const p = []
		const checkInbound = (i, j) => {
			return 0 <= i && i < this._size[0] && 0 <= j && j < this._size[1]
		}
		const d = [
			[1, 1],
			[1, 0],
			[1, -1],
			[0, 1],
		]
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				if (this._board[i][j] !== turn) {
					continue
				}
				for (const [di, dj] of d) {
					if (checkInbound(i - di, j - dj) && this._board[i - di][j - dj] === turn) {
						continue
					} else if (!checkInbound(i + di * (length - 1), j + dj * (length - 1))) {
						continue
					}
					const path = [[i, j]]
					let ti = i + di
					let tj = j + dj
					let sep = false
					const s = []
					for (let t = 1; t < length; t++, ti += di, tj += dj) {
						if (!checkInbound(ti, tj)) {
							break
						} else if (separate && !sep && this._board[ti][tj] === EMPTY) {
							sep = true
							t--
							s.push([ti, tj])
							continue
						} else if (this._board[ti][tj] !== turn) {
							break
						}
						path.push([ti, tj])
						if (t === length - 1) {
							ti += di
							tj += dj
							if (checkInbound(ti, tj) && this._board[ti][tj] === turn) {
								break
							}
							if (!sep) {
								if (checkInbound(ti, tj) && this._board[ti][tj] === EMPTY) {
									s.push([ti, tj])
								}
								if (checkInbound(i - di, j - dj) && this._board[i - di][j - dj] === EMPTY) {
									s.push([i - di, j - dj])
								}
							}
							p.push({
								path: path,
								s: s,
							})
						}
					}
				}
			}
		}
		return p
	}
}
