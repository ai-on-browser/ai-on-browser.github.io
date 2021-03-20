import { RLEnvironmentBase } from './base.js'

const EMPTY = 1
const RED = 2
const WHITE = 4
const KING = 8
const RED2 = RED | KING
const WHITE2 = WHITE | KING

export default class DraughtsRLEnvironment extends RLEnvironmentBase {
	constructor(platform) {
		super(platform)

		this._size = [8, 8]

		this._game = new Draughts(this)
		this._board = this._game._board

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
		for (let i = 0; i < this._size[0] * this._size[1] / 2; i++) {
			s.push([EMPTY, RED, WHITE])
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
					.attr("fill", (i + j) % 2 === 0 ? "#aa9977" : "#eeddcc")
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
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				if (this._board.at([i, j]) === EMPTY) {
					continue
				}
				const width = grid.gridSize[1]
				const height = grid.gridSize[0]
				const circle = grid.at(i, j).append("circle")
						.attr("cx", width / 2)
						.attr("cy", height / 2)
						.attr("r", Math.min(width, height) * 0.4)
						.attr("stroke", "black")
						.attr("stroke-width", "1")
				if (this._board.at([i, j]) & WHITE) {
					circle.attr("fill", "white")
				} else if (this._board.at([i, j]) & RED) {
					circle.attr("fill", "red")
				}
				if (this._board.at([i, j]) & KING) {
					grid.at(i, j).append("text")
						.attr("x", `${width / 2}px`)
						.attr("y", `${height / 2}px`)
						.style("transform", "translate(-0.4em, 0.3em)")
						.text("K")
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
		players[0].turn = RED
		players[1].turn = WHITE
		this._game.players = players
		return this._game
	}

	close() {
		this._platform.width = this._org_width
		this._platform.height = this._org_height
		this._grid().close()
	}
}

class Draughts {
	constructor(env) {
		this._players = null
		this._env = env
		this._board = new DraughtsBoard(env._size, env._evaluation)
		this._turn = RED
		this._active = false
		this._resultElm = null
	}

	get board() {
		return this._board
	}

	get active() {
		return this._active
	}

	set players(value) {
		this._players = value
	}

	close() {
		this._players.forEach(p => p.close())
		if (this._resultElm) {
			this._resultElm.remove()
			this._resultElm = null
		}
	}

	async start() {
		if (this._resultElm) {
			this._resultElm.remove()
			this._resultElm = null
		}
		this._env.platform.render()
		this._active = true
		this._turn = RED
		while (!this._board.finish) {
			while (true) {
				const i = this._turn === RED ? 0 : 1
				const slct = await new Promise(resolve => this._players[i].action(this._board, resolve))
				if (this._board.set(slct, this._turn)) {
					break
				}
			}
			this._env.platform.render()
			await new Promise(resolve => setTimeout(resolve, 0))
			this._turn = this._board.nextTurn(this._turn)
		}
		this._active = false

		this._resultElm = this._env.svg.append("g")
		const width = this._env.platform.width
		const height = this._env.platform.height
		this._resultElm.append("rect")
			.attr("x", width / 4)
			.attr("y", height / 4)
			.attr("width", width / 2)
			.attr("height", height / 2)
			.attr("opacity", 0.8)
			.attr("fill", "white")
		const ts = this._resultElm.append("g")
			.style("transform", "scale(1, -1) translate(0, -100%)")
			.append("text")
			.attr("transform", `translate(${width / 3}, ${height / 2})`)
		ts.append("tspan")
			.attr("x", "0em")
			.attr("y", "0em")
			.text(this._board.winner === RED ? "RED WIN" : "WHITE WIN")
		this._resultElm.on("click", () => {
			this._resultElm.remove()
			this._resultElm = null
		})
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
			whiteking: c[WHITE2] || 0
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
					jump: []
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
						jump: [[x + dx, y + dy]]
					})
				} else {
					for (const ninfo of npath) {
						info.push({
							from: [x, y],
							path: [[x + dx * 2, y + dy * 2], ...ninfo.path],
							jump: [[x + dx, y + dy], ...ninfo.jump]
						})
					}
				}
			}
		}
		return info
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
		const dw = width / board.size[1]
		const dh = height / board.size[0]
		const choices = board.choices(this._turn)
		this._obj = this._env.svg.append("g")
		this._check = []
		for (let i = 0; i < board.size[0]; i++) {
			this._check[i] = []
			for (let j = 0; j < board.size[1]; j++) {
				if ((i + j) % 2 > 0) continue
				this._check[i][j] = this._obj.append("rect")
					.attr("x", dw * j)
					.attr("y", dh * i)
					.attr("width", dw)
					.attr("height", dh)
					.attr("fill", "rgba(255, 255, 0, 0.5)")
					.attr("opacity", 0)
				for (let k = 0; k < choices.length; k++) {
					if (choices[k].from[0] === i && choices[k].from[1] === j) {
						this._check[i][j].attr("opacity", 1)
							.on("click", ((i, j) => () => {
								this.nextPath(board, choices.filter(c => c.from[0] === i && c.from[1] === j), cb)
							})(i, j))
					}
				}
			}
		}
	}

	nextPath(board, path, cb, d = 0) {
		for (let i = 0; i < this._check.length; i++) {
			for (let j = 0; j < this._check[i].length; j++) {
				if (this._check[i][j]) {
					this._check[i][j].attr("opacity", 0)
						.on("click", null)
				}
			}
		}
		for (let k = 0; k < path.length; k++) {
			this._check[path[k].path[d][0]][path[k].path[d][1]]
				.attr("opacity", 1)
				.on("click", ((k) => () => {
					if (path[k].path.length === d + 1) {
						cb(path[k])
						this._obj.remove()
						this._obj = null
					} else {
						this.nextPath(board, path.filter(p => p.path[d][0] === path[k].path[d][0] && p.path[d][1] === path[k].path[d][1]), cb, d + 1)
					}
				})(k))
		}
	}

	close() {
		if (this._obj) {
			this._obj.remove()
		}
	}
}

