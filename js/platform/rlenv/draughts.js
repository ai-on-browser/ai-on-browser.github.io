import DraughtsRLEnvironment from '../../../lib/rl/draughts.js'
import { Game } from '../game/base.js'

export default class DraughtsRenderer extends DraughtsRLEnvironment {
	constructor(platform) {
		super()
		this._platform = platform

		this._game = new Draughts(this)

		this._org_width = this._platform.width
		this._org_height = this._platform.height
	}

	init(r) {
		this._platform.width = 500
		this._platform.height = 500
		const width = this._platform.width
		const height = this._platform.height

		const dw = width / this._size[1]
		const dh = height / this._size[0]
		this._cells = []
		for (let i = 0; i < this._size[0]; i++) {
			this._cells[i] = []
			for (let j = 0; j < this._size[1]; j++) {
				this._cells[i][j] = r.append('g')
				this._cells[i][j]
					.append('rect')
					.attr('x', j * dw)
					.attr('y', i * dh)
					.attr('width', dw)
					.attr('height', dh)
					.attr('fill', (i + j) % 2 === 0 ? '#aa9977' : '#eeddcc')
					.attr('stroke', '#333333')
					.attr('stroke-width', '1')
			}
		}
	}

	render(r) {
		const grid = this._platform._grid()
		grid.reset()
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				if (this._board.at([i, j]) === DraughtsRLEnvironment.EMPTY) {
					continue
				}
				const width = grid.gridSize[1]
				const height = grid.gridSize[0]
				const circle = grid
					.at(i, j)
					.append('circle')
					.attr('cx', width / 2)
					.attr('cy', height / 2)
					.attr('r', Math.min(width, height) * 0.4)
					.attr('stroke', 'black')
					.attr('stroke-width', '1')
				if (this._board.at([i, j]) & DraughtsRLEnvironment.WHITE) {
					circle.attr('fill', 'white')
				} else if (this._board.at([i, j]) & DraughtsRLEnvironment.RED) {
					circle.attr('fill', 'red')
				}
				if (this._board.at([i, j]) & DraughtsRLEnvironment.KING) {
					grid.at(i, j)
						.append('text')
						.attr('x', `${width / 2}px`)
						.attr('y', `${height / 2}px`)
						.style('transform', 'translate(-0.4em, 0.3em)')
						.text('K')
				}
			}
		}
	}

	game(...players) {
		if (!players[0]) {
			players[0] = new ManualPlayer(this)
		}
		if (!players[1]) {
			players[1] = new ManualPlayer(this)
		}
		players[0].turn = DraughtsRLEnvironment.RED
		players[1].turn = DraughtsRLEnvironment.WHITE
		this._game.players = players
		return this._game
	}

	close() {
		this._platform.width = this._org_width
		this._platform.height = this._org_height
	}
}

class Draughts extends Game {
	constructor(env) {
		super(env)
		this._board = env._board
		this.turns = [DraughtsRLEnvironment.RED, DraughtsRLEnvironment.WHITE]
	}

	_showResult(r) {
		r.append('tspan')
			.attr('x', '0em')
			.attr('y', '0em')
			.text(this._board.winner === DraughtsRLEnvironment.RED ? 'RED WIN' : 'WHITE WIN')
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
		const width = this._env._platform.width
		const height = this._env._platform.height
		const dw = width / board.size[1]
		const dh = height / board.size[0]
		const choices = board.choices(this._turn)
		this._obj = this._env._platform.svg.append('g')
		this._check = []
		for (let i = 0; i < board.size[0]; i++) {
			this._check[i] = []
			for (let j = 0; j < board.size[1]; j++) {
				if ((i + j) % 2 > 0) continue
				this._check[i][j] = this._obj
					.append('rect')
					.attr('x', dw * j)
					.attr('y', dh * i)
					.attr('width', dw)
					.attr('height', dh)
					.attr('fill', 'rgba(255, 255, 0, 0.5)')
					.attr('opacity', 0)
				for (let k = 0; k < choices.length; k++) {
					if (choices[k].from[0] === i && choices[k].from[1] === j) {
						this._check[i][j].attr('opacity', 1).on(
							'click',
							((i, j) => () => {
								this.nextPath(
									board,
									choices.filter(c => c.from[0] === i && c.from[1] === j),
									cb
								)
							})(i, j)
						)
					}
				}
			}
		}
	}

	nextPath(board, path, cb, d = 0) {
		for (let i = 0; i < this._check.length; i++) {
			for (let j = 0; j < this._check[i].length; j++) {
				if (this._check[i][j]) {
					this._check[i][j].attr('opacity', 0).on('click', null)
				}
			}
		}
		for (let k = 0; k < path.length; k++) {
			this._check[path[k].path[d][0]][path[k].path[d][1]].attr('opacity', 1).on(
				'click',
				(k => () => {
					if (path[k].path.length === d + 1) {
						cb(path[k])
						this._obj.remove()
						this._obj = null
					} else {
						this.nextPath(
							board,
							path.filter(
								p => p.path[d][0] === path[k].path[d][0] && p.path[d][1] === path[k].path[d][1]
							),
							cb,
							d + 1
						)
					}
				})(k)
			)
		}
	}

	close() {
		if (this._obj) {
			this._obj.remove()
		}
	}
}
