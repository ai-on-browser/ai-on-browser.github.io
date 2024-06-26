import DraughtsRLEnvironment from '../../../lib/rl/draughts.js'
import { Game } from '../../platform/game/base.js'

export default class DraughtsRenderer {
	constructor(renderer) {
		this.renderer = renderer

		this._game = new Draughts(renderer.platform)
	}

	init(r) {
		this._envrenderer = new Renderer(this.renderer.env, {
			width: 500,
			height: 500,
			g: r,
		})
		this._envrenderer.init()
	}

	render() {
		this._envrenderer.render()
	}

	game(...players) {
		if (!players[0]) {
			players[0] = new ManualPlayer(this._envrenderer)
		}
		if (!players[1]) {
			players[1] = new ManualPlayer(this._envrenderer)
		}
		players[0].turn = DraughtsRLEnvironment.RED
		players[1].turn = DraughtsRLEnvironment.WHITE
		this._game.players = players
		return this._game
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
		r.innerHTML = this._board.winner === DraughtsRLEnvironment.RED ? 'RED WIN' : 'WHITE WIN'
	}
}

class ManualPlayer {
	constructor(renderer) {
		this._turn = null
		this._renderer = renderer

		this._obj = null
	}

	set turn(value) {
		this._turn = value
	}

	action(board) {
		const width = this._renderer._size[0]
		const height = this._renderer._size[1]
		const dw = width / board.size[1]
		const dh = height / board.size[0]
		const choices = board.choices(this._turn)
		this._obj = document.createElementNS('http://www.w3.org/2000/svg', 'g')
		this._renderer.svg.appendChild(this._obj)
		this._check = []
		for (let i = 0; i < board.size[0]; i++) {
			this._check[i] = []
			for (let j = 0; j < board.size[1]; j++) {
				if ((i + j) % 2 === 0) continue
				this._check[i][j] = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
				this._check[i][j].setAttribute('x', dw * j)
				this._check[i][j].setAttribute('y', dh * i)
				this._check[i][j].setAttribute('width', dw)
				this._check[i][j].setAttribute('height', dh)
				this._check[i][j].setAttribute('fill', 'rgba(255, 255, 0, 0.5)')
				this._check[i][j].setAttribute('opacity', 0)
				this._obj.appendChild(this._check[i][j])
			}
		}
		return new Promise(resolve => {
			this._obj.oncontextmenu = e => {
				e.preventDefault()
				this.nextPath(board, choices).then(resolve)
			}
			this.nextPath(board, choices).then(resolve)
		})
	}

	async nextPath(board, path, d = 0) {
		for (let i = 0; i < this._check.length; i++) {
			for (let j = 0; j < this._check[i].length; j++) {
				if (this._check[i][j]) {
					this._check[i][j].setAttribute('opacity', 0)
					this._check[i][j].onclick = null
				}
			}
		}
		const proms = []
		for (let k = 0; k < path.length; k++) {
			const [x, y] = d === 0 ? path[k].from : path[k].path[d - 1]
			this._check[x][y].setAttribute('opacity', 1)
			proms.push(
				new Promise(resolve => {
					this._check[x][y].onclick = (k => () => {
						if (path[k].path.length === d) {
							this._obj.remove()
							this._obj = null
							resolve(path[k])
						} else {
							this.nextPath(
								board,
								path.filter(p =>
									d === 0
										? p.from[0] === x && p.from[1] === y
										: p.path[d - 1][0] === x && p.path[d - 1][1] === y
								),
								d + 1
							).then(resolve)
						}
					})(k)
				})
			)
		}
		return Promise.race(proms)
	}

	close() {
		this._obj?.remove()
	}
}
