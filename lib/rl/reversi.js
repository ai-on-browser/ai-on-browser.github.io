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
		this._turn = BLACK

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
		const a = [EMPTY]
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				a.push(`${String.fromCharCode('a'.charCodeAt(0) + i)}${i + 1}`)
			}
		}
		return [a]
	}

	get states() {
		const s = [[BLACK, WHITE]]
		for (let i = 0; i < this._size[0] * this._size[1]; i++) {
			s.push([EMPTY, ReversiRLEnvironment.OWN, ReversiRLEnvironment.OTHER])
		}
		return s
	}

	set evaluation(func) {
		if (func) {
			this._board._evaluator = this._evaluation = (board, turn) => {
				return func(this._makeState(board, turn, this._turn))
			}
		} else {
			this._board._evaluator = this._evaluation = null
		}
	}

	_makeState(board, agentturn, gameturn) {
		const s = [gameturn]
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				const p = board.at([i, j])
				s.push(p === EMPTY ? p : p === agentturn ? ReversiRLEnvironment.OWN : ReversiRLEnvironment.OTHER)
			}
		}
		return s
	}

	_state2board(state, turn) {
		const board = new ReversiBoard(this._size, this._evaluation)
		const opturn = flipPiece(turn)
		for (let i = 0, p = 1; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++, p++) {
				if (state[p] === EMPTY) {
					board._board[i][j] = EMPTY
				} else if (state[p] === ReversiRLEnvironment.OWN) {
					board._board[i][j] = turn
				} else {
					board._board[i][j] = opturn
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
		if (action[0] === EMPTY) {
			const choices = board.choices(agent)
			const done = board.finish
			const invalid = choices.length > 0
			return {
				state: invalid ? state : this._makeState(board, agent, flipPiece(gameturn)),
				reward: getreward(done),
				done,
				invalid,
			}
		}
		const changed = board.set(action[0], agent)
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
			state: this._makeState(board, agent, flipPiece(gameturn)),
			reward: getreward(done),
			done,
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
		if (typeof p === 'string') {
			p = [p[1] - 1, p.charCodeAt(0) - 'a'.charCodeAt(0)]
		}
		return this._board[p[0]][p[1]]
	}

	set(p, turn) {
		if (typeof p === 'string') {
			p = [p[1] - 1, p.charCodeAt(0) - 'a'.charCodeAt(0)]
		}
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
		this._board[cx - 1][cy - 1] = WHITE
		this._board[cx - 1][cy] = BLACK
		this._board[cx][cy - 1] = BLACK
		this._board[cx][cy] = WHITE
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
