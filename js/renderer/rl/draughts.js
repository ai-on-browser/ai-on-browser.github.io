import DraughtsRLEnvironment from '../../../lib/rl/draughts.js'
import { Game } from '../../platform/game/base.js'

export default class DraughtsRenderer {
	constructor(renderer) {
		this.renderer = renderer

		this._game = new Draughts(renderer.platform)

		this._org_width = renderer.width
		this._org_height = renderer.height
	}

	init(r) {
		this.renderer.width = 500
		this.renderer.height = 500

		this._envrenderer = new Renderer(this.renderer.env, {
			width: this.renderer.width,
			height: this.renderer.height,
			g: r.node(),
		})
		this._envrenderer.init()
	}

	render() {
		this._envrenderer.render()
	}

	game(...players) {
		if (!players[0]) {
			players[0] = new ManualPlayer(this.renderer.platform)
		}
		if (!players[1]) {
			players[1] = new ManualPlayer(this.renderer.platform)
		}
		players[0].turn = DraughtsRLEnvironment.RED
		players[1].turn = DraughtsRLEnvironment.WHITE
		this._game.players = players
		return this._game
	}

	close() {
		this.renderer.width = this._org_width
		this.renderer.height = this._org_height
	}
}

class Renderer {
	constructor(env, config = {}) {
		this.env = env

		this._size = [config.width || 200, config.height || 200]

		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		this.svg.setAttribute('width', this._size[0])
		this.svg.setAttribute('height', this._size[1])
		this.svg.setAttribute('viewbox', '0 0 200 200')
		if (config.g) {
			config.g.replaceChildren(this.svg)
		}
	}

	init() {
		const width = this._size[0]
		const height = this._size[1]

		const dw = width / this.env._size[1]
		const dh = height / this.env._size[0]
		this._cells = []
		for (let i = 0; i < this.env._size[0]; i++) {
			this._cells[i] = []
			for (let j = 0; j < this.env._size[1]; j++) {
				this._cells[i][j] = document.createElementNS('http://www.w3.org/2000/svg', 'g')
				this.svg.appendChild(this._cells[i][j])
				const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
				rect.setAttribute('x', j * dw)
				rect.setAttribute('y', i * dh)
				rect.setAttribute('width', dw)
				rect.setAttribute('height', dh)
				rect.setAttribute('fill', (i + j) % 2 === 0 ? '#aa9977' : '#eeddcc')
				rect.setAttribute('stroke', '#333333')
				rect.setAttribute('stroke-width', '1')
				this._cells[i][j].appendChild(rect)
			}
		}
	}

	render() {
		const width = this._size[0]
		const height = this._size[1]

		const dw = width / this.env._size[1]
		const dh = height / this.env._size[0]
		for (let i = 0; i < this._cells.length; i++) {
			for (let j = 0; j < this._cells[i].length; j++) {
				this._cells[i][j].querySelector('circle')?.remove()
				this._cells[i][j].querySelector('text')?.remove()
				if (this.env._board.at([i, j]) === DraughtsRLEnvironment.EMPTY) {
					continue
				}
				const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
				circle.setAttribute('cx', dw * (j + 0.5))
				circle.setAttribute('cy', dh * (i + 0.5))
				circle.setAttribute('r', Math.min(dw, dh) * 0.4)
				circle.setAttribute('stroke', 'black')
				circle.setAttribute('stroke-width', '1')
				if (this.env._board.at([i, j]) & DraughtsRLEnvironment.WHITE) {
					circle.setAttribute('fill', 'white')
				} else if (this.env._board.at([i, j]) & DraughtsRLEnvironment.RED) {
					circle.setAttribute('fill', 'red')
				}
				this._cells[i][j].appendChild(circle)
				if (this.env._board.at([i, j]) & DraughtsRLEnvironment.KING) {
					const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
					text.setAttribute('x', dw * (j + 0.5))
					text.setAttribute('y', dh * (i + 0.5))
					text.style.transform = 'translate(-0.4em, 0.3em)'
					text.append('K')
					this._cells[i][j].appendChild(text)
				}
			}
		}
	}
}

class Draughts extends Game {
	constructor(platform) {
		super(platform)
		this._board = platform.env._board
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
	constructor(platform) {
		this._turn = null
		this._platform = platform

		this._obj = null
	}

	set turn(value) {
		this._turn = value
	}

	action(board, cb) {
		const width = this._platform.width
		const height = this._platform.height
		const dw = width / board.size[1]
		const dh = height / board.size[0]
		const choices = board.choices(this._turn)
		this._obj = this._platform.svg.append('g')
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
