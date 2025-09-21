import { RLEnvironmentBase } from './base.js'

const EMPTY = 1
const BLACK = 2
const WHITE = 3

/**
 * Gomoku environment
 */
export default class GomokuRLEnvironment extends RLEnvironmentBase {
	constructor() {
		super()

		this._size = [8, 8]

		this._board = new GomokuBoard(this._size)

		this._reward = {
			win: 1,
			lose: -1,
			step: 0,
		}
	}

	static BLACK = BLACK

	static WHITE = WHITE

	static EMPTY = EMPTY

	static OWN = 2

	static OTHER = 3

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
		const s = [[BLACK, WHITE]]
		for (let i = 0; i < this._size[0] * this._size[1]; i++) {
			s.push([EMPTY, GomokuRLEnvironment.OWN, GomokuRLEnvironment.OTHER])
		}
		return s
	}

	_makeState(board, agentturn, gameturn) {
		const s = [gameturn]
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				const p = board.at([i, j])
				s.push(p === EMPTY ? p : p === agentturn ? GomokuRLEnvironment.OWN : GomokuRLEnvironment.OTHER)
			}
		}
		return s
	}

	_state2board(state, turn) {
		const board = new GomokuBoard(this._size)
		const opturn = board.nextTurn(turn)
		for (let i = 0, p = 1; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++, p++) {
				if (state[p] === GomokuRLEnvironment.OWN) {
					board.set([i, j], turn)
				} else if (state[p] === GomokuRLEnvironment.OTHER) {
					board.set([i, j], opturn)
				}
			}
		}
		return board
	}

	_checkAgent(agent) {
		if (!this._agents) {
			throw new Error('Agent does not exist. Call reset to set agents.')
		}
		if (agent !== BLACK && agent !== WHITE) {
			throw new Error('Unknown agent.')
		}
	}

	reset() {
		super.reset()
		this._agents = [BLACK, WHITE]
		this._board.reset()
		this._turn = BLACK

		return this.state(BLACK)
	}

	state(agent) {
		if (!agent) {
			agent = this._turn
		}
		this._checkAgent(agent)
		return this._makeState(this._board, agent, this._turn)
	}

	setState(state, agent) {
		this._turn = state[0]
		this._board = this._state2board(state, agent)
	}

	step(action, agent) {
		if (!agent) {
			agent = this._turn
		}
		return super.step(action, agent)
	}

	test(state, action, agent) {
		if (!agent) {
			agent = this._turn
		}
		this._checkAgent(agent)
		const gameturn = state[0]

		const getreward = done =>
			!done ? this._reward.step : board.winner === agent ? this._reward.win : this._reward.lose

		const board = this._state2board(state, agent)
		if (agent !== gameturn) {
			const done = board.finish
			return {
				state,
				reward: getreward(done),
				done,
				invalid: true,
			}
		}
		const choice = action[0].split('_').map(v => +v)
		const changed = board.set(choice, agent)
		const done = board.finish
		if (!changed) {
			return {
				state,
				reward: getreward(done),
				done,
				invalid: true,
			}
		}
		return {
			state: this._makeState(board, agent, board.nextTurn(gameturn)),
			reward: getreward(done),
			done,
		}
	}
}

class GomokuBoard {
	constructor(size) {
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

	toString() {
		let buf = ''
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				if (j > 0) {
					buf += ' '
				}
				if (this._board[i][j] === BLACK) {
					buf += 'x'
				} else if (this._board[i][j] === WHITE) {
					buf += 'o'
				} else {
					buf += '-'
				}
			}
			buf += '\n'
		}
		return buf
	}

	nextTurn(turn) {
		return turn === BLACK ? WHITE : BLACK
	}

	copy() {
		const cp = new GomokuBoard(this._size)
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				cp._board[i][j] = this._board[i][j]
			}
		}
		cp._count = this._count
		return cp
	}

	score(turn) {
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

	choices() {
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
