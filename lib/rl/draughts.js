import { RLEnvironmentBase, RLStepResult } from './base.js'

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

		this._board = new DraughtsBoard(this._size)

		this._reward = {
			win: 1,
			lose: -1,
			step: 0,
		}
	}

	static EMPTY = EMPTY

	static RED = RED

	static WHITE = WHITE

	static KING = KING

	static OWN = 2

	static OTHER = 4

	get actions() {
		const a = [EMPTY]
		const d = [
			[1, 1],
			[-1, 1],
			[-1, -1],
			[1, -1],
		]
		const checkBound = (x, y) => 0 <= x && x < this._size[0] && 0 <= y && y < this._size[1]
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = i % 2 === 1 ? 0 : 1; j < this._size[1]; j += 2) {
				let midpath = []
				for (const [di, dj] of d) {
					const i1 = i + di
					const j1 = j + dj
					if (checkBound(i1, j1)) {
						a.push({ from: [i, j], path: [[i1, j1]], jump: [] })
					}
					const i2 = i1 + di
					const j2 = j1 + dj
					if (checkBound(i2, j2)) {
						const act = { from: [i, j], path: [[i2, j2]], jump: [[i1, j1]] }
						a.push(act)
						midpath.push(act)
					}
				}
				while (midpath.length > 0) {
					const npath = []
					for (const mp of midpath) {
						const lastPos = mp.path[mp.path.length - 1]
						for (const [di, dj] of d) {
							const i1 = lastPos[0] + di
							const j1 = lastPos[1] + dj
							const i2 = i1 + di
							const j2 = j1 + dj
							if (checkBound(i2, j2) && mp.jump.every(([i, j]) => i !== i1 || j !== j1)) {
								const act = {
									from: [i, j],
									path: [...mp.path, [i2, j2]],
									jump: [...mp.jump, [i1, j1]],
								}
								a.push(act)
								npath.push(act)
							}
						}
					}
					midpath = npath
				}
			}
		}
		return [a]
	}

	get states() {
		const s = [[RED, WHITE]]
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = i % 2 === 0 ? 1 : 0; j < this._size[1]; j += 2) {
				s.push([
					EMPTY,
					DraughtsRLEnvironment.OWN,
					DraughtsRLEnvironment.OWN | KING,
					DraughtsRLEnvironment.OTHER,
					DraughtsRLEnvironment.OTHER | KING,
				])
			}
		}
		return s
	}

	_makeState(board, agentturn, gameturn) {
		const s = [gameturn]
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = i % 2 === 0 ? 1 : 0; j < this._size[1]; j += 2) {
				const p = board.at([i, j])
				if (p === EMPTY) {
					s.push(EMPTY)
				} else {
					const o = p & agentturn ? DraughtsRLEnvironment.OWN : DraughtsRLEnvironment.OTHER
					if (p & KING) {
						s.push(o | KING)
					} else {
						s.push(o)
					}
				}
			}
		}
		return s
	}

	_state2board(state, turn) {
		const board = new DraughtsBoard(this._size)
		const opturn = turn === RED ? WHITE : RED
		for (let i = 0, p = 1; i < this._size[0]; i++) {
			for (let j = i % 2 === 0 ? 1 : 0; j < this._size[1]; j += 2, p++) {
				if (state[p] === EMPTY) {
					board._board[i][j] = EMPTY
				} else {
					board._board[i][j] = state[p] & DraughtsRLEnvironment.OWN ? turn : opturn
					if (state[p] & KING) {
						board._board[i][j] |= KING
					}
				}
			}
		}
		return board
	}

	_checkAgent(agent) {
		if (!this._agents) {
			throw new Error('Agent does not exist. Call reset to set agents.')
		}
		if (agent !== RED && agent !== WHITE) {
			throw new Error('Unknown agent.')
		}
	}

	reset() {
		super.reset()
		this._agents = [RED, WHITE]
		this._board.reset()
		this._turn = RED

		return this.state(RED)
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
		const adone = board.finish
		if (agent !== gameturn) {
			return new RLStepResult(this, state, getreward(adone), adone, true)
		}
		const choices = board.choices(agent)
		if (action[0] === EMPTY) {
			const invalid = choices.length > 0
			return new RLStepResult(
				this,
				invalid ? state : this._makeState(board, agent, gameturn === RED ? WHITE : RED),
				getreward(adone),
				adone,
				invalid
			)
		}
		if (choices.some(c => c.jump.length > 0) && action[0].jump.length === 0) {
			return new RLStepResult(this, state, getreward(adone), adone, true)
		}
		const changed = board.set(action[0], agent)
		const done = board.finish
		if (!changed) {
			return new RLStepResult(this, state, getreward(done), done, true)
		}
		return new RLStepResult(
			this,
			this._makeState(board, agent, gameturn === RED ? WHITE : RED),
			getreward(done),
			done
		)
	}
}

class DraughtsBoard {
	constructor(size) {
		this._size = size
		this._lines = 3

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

	toString() {
		let buf = ''
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				if (j > 0) {
					buf += ' '
				}
				if (this._board[i][j] & RED) {
					buf += 'x'
				} else if (this._board[i][j] & WHITE) {
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
		return turn === WHITE ? RED : WHITE
	}

	copy() {
		const cp = new DraughtsBoard(this._size)
		for (let i = 0; i < this._size[0]; i++) {
			cp._board[i] = this._board[i].concat()
		}
		return cp
	}

	score(turn) {
		const count = this.count
		if (turn === RED) {
			return count.red + count.redking * 2 - count.white - count.whiteking * 4
		} else {
			return count.white + count.whiteking * 2 - count.red - count.redking * 4
		}
	}

	_num_to_pos(n) {
		if (typeof n !== 'number') {
			return n
		}
		const r = Math.floor((n - 1) / this._size[1])
		const c = (n - 1) % this._size[1]
		if (c < (this._size[1] - 1) / 2) {
			return [r * 2, c * 2 + 1]
		} else {
			return [r * 2 + 1, (c - Math.floor(this._size[1] / 2)) * 2]
		}
	}

	at(p) {
		if (typeof p === 'number') {
			p = this._num_to_pos(p)
		}
		return this._board[p[0]][p[1]]
	}

	set(p, turn) {
		p = {
			from: this._num_to_pos(p.from),
			path: p.path.map(v => this._num_to_pos(v)),
			jump: p.jump.map(v => this._num_to_pos(v)),
		}
		let piece = this.at(p.from)
		if (!(turn & piece)) {
			return false
		}
		if ((p.jump.length !== 0 || p.path.length !== 1) && p.jump.length !== p.path.length) {
			return false
		}
		const nturn = this.nextTurn(turn)
		if (p.jump.some(j => !(this.at(j) & nturn))) {
			return false
		}
		if (p.path.some(j => this.at(j) !== EMPTY)) {
			return false
		}

		if (!(piece & KING)) {
			const d = p.path[0][0] - p.from[0]
			if ((turn === RED && d < 0) || (turn === WHITE && d > 0)) {
				return false
			}
		}

		if (p.jump.length === 0) {
			for (let i = 0; i < 2; i++) {
				if (Math.abs(p.from[i] - p.path[0][i]) !== 1) {
					return false
				}
			}
		} else {
			let pos = p.from
			for (let k = 0; k < p.path.length; k++) {
				for (let i = 0; i < 2; i++) {
					if (Math.abs(pos[i] - p.jump[k][i]) !== 1) {
						return false
					}
					if (Math.abs(p.jump[k][i] - p.path[k][i]) !== 1) {
						return false
					}
				}
				pos = p.path[k]
			}
		}

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
			for (let j = i % 2 === 0 ? 1 : 0; j < this._size[1]; j += 2) {
				if (i < this._lines) {
					this._board[i][j] = RED
				} else if (this._size[0] - this._lines <= i) {
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
				if (turn === RED && x + dx * 2 === this._size[0] - 1) {
					cp._board[x + dx * 2][y + dy * 2] |= KING
				} else if (turn === WHITE && x + dx * 2 === 0) {
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
