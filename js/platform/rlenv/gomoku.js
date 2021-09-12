import { RLEnvironmentBase } from './base.js'
import { Game } from '../game/base.js'

const EMPTY = 1
const BLACK = 2
const WHITE = 3

export default class GomokuRLEnvironment extends RLEnvironmentBase {
	constructor(platform) {
		super(platform)

		this._size = [8, 8]

		this._game = new Gomoku(this)
		this._board = this._game.board

		this._reward = {
			goal: 1,
			step: 1,
			fail: 0,
		}
		this._org_width = this._platform.width
		this._org_height = this._platform.height
	}

	get actions() {
		const a = []
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				a.push(`${i}_${j}`)
			}
		}
		return [a];
	}

	get states() {
		const s = []
		for (let i = 0; i < this._size[0] * this._size[1]; i++) {
			s.push([EMPTY, BLACK, WHITE])
		}
		return s
	}

	set reward(value) {
	}

	init(r) {
		this._platform.width = 500
		this._platform.height = 500
		const width = this.platform.width;
		const height = this.platform.height;

		const dw = width / this._size[1]
		const dh = height / this._size[0]
		this._cells = []
		for (let i = 0; i < this._size[0]; i++) {
			this._cells[i] = []
			for (let j = 0; j < this._size[1]; j++) {
				this._cells[i][j] = r.append("g")
				this._cells[i][j].append("rect")
					.attr("x", j * dw)
					.attr("y", i * dh)
					.attr("width", dw)
					.attr("height", dh)
					.attr("fill", "#eeddcc")
					.attr("stroke", "#333333")
					.attr("stroke-width", "1")
			}
		}
	}

	reset() {
		this._board.reset()

		return this.state();
	}

	render(r) {
		const grid = this._grid()
		grid.reset()
		for (let i = 0; i < this._cells.length; i++) {
			for (let j = 0; j < this._cells[i].length; j++) {
				if (this._board.at([i, j]) === EMPTY) {
					continue
				}
				const cell = this._cells[i][j].select("rect")
				const width = +cell.attr("width")
				const height = +cell.attr("height")
				const circle = grid.at(i, j).append("circle")
						.attr("cx", width / 2)
						.attr("cy", height / 2)
						.attr("r", Math.min(width, height) * 0.4)
						.attr("stroke", "black")
						.attr("stroke-width", "1")
				if (this._board.at([i, j]) === WHITE) {
					circle.attr("fill", "white")
				} else if (this._board.at([i, j]) === BLACK) {
					circle.attr("fill", "black")
				}
			}
		}
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
		const info = this.test(this.state, action, agent);
		return info;
	}

	test(state, action, agent) {
		return {
			state: [],
			reward: 0,
			done: false
		}
	}

	evaluation(func) {
		this._evaluation = func
	}

	game(...players) {
		if (!players[0]) {
			players[0] = new ManualPlayer(this)
		}
		if (!players[1]) {
			players[1] = new ManualPlayer(this)
		}
		players[0].turn = BLACK
		players[1].turn = WHITE
		this._game.players = players
		return this._game
	}

	close() {
		this._platform.width = this._org_width
		this._platform.height = this._org_height
	}
}

class Gomoku extends Game {
	constructor(env) {
		super(env)
		this._board = new GomokuBoard(env._size, env._evaluation)
		this.turns = [BLACK, WHITE]
	}

	_showResult(r) {
		const winner = this._board.winner
		r.append("tspan")
			.attr("x", "0em")
			.attr("y", "0em")
			.text(winner === BLACK ? "BLACK WIN" : winner === WHITE ? "WHITE WIN" : "DRAW")
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
		const d = [[1, 1], [1, 0], [1, -1], [0, 1]]
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
								s: s
							})
						}
					}
				}
			}
		}
		return p
	}
}

class ManualPlayer {
	constructor(env) {
		this._turn = null
		this._env = env

		this._obj = null
	}

	set turn(value) {
		this._turn = value
	}

	action(board, cb) {
		const width = this._env.platform.width
		const height = this._env.platform.height
		const _this = this
		this._obj = this._env.svg.append("g")
		const choices = board.choices(this._turn)
		this._obj.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", width)
			.attr("height", height)
			.attr("opacity", 0)
			.on("click", function() {
				const pos = d3.mouse(this)
				const cell = [Math.floor(pos[1] / width * board.size[0]), Math.floor(pos[0] / height * board.size[1])]
				cb(cell)
				_this._obj.remove()
				_this._obj = null
			})
	}

	close() {
		if (this._obj) {
			this._obj.remove()
		}
	}
}

