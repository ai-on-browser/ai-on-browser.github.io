import GomokuRLEnvironment from '../../../lib/rl/gomoku.js'
import { Game } from '../../platform/game/base.js'

export default class GomokuRenderer {
	constructor(renderer) {
		this.renderer = renderer

		this._game = new Gomoku(renderer.platform)

		this._org_width = renderer.width
		this._org_height = renderer.height
	}

	init(r) {
		this.renderer.width = 500
		this.renderer.height = 500

		this._envrenderer = new Renderer(this.renderer.env, {
			width: this.renderer.width,
			height: this.renderer.height,
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
		players[0].turn = GomokuRLEnvironment.BLACK
		players[1].turn = GomokuRLEnvironment.WHITE
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
				rect.setAttribute('fill', '#eeddcc')
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
				if (this.env._board.at([i, j]) === GomokuRLEnvironment.EMPTY) {
					continue
				}
				const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
				circle.setAttribute('cx', dw * (j + 0.5))
				circle.setAttribute('cy', dh * (i + 0.5))
				circle.setAttribute('r', Math.min(dw, dh) * 0.4)
				circle.setAttribute('stroke', 'black')
				circle.setAttribute('stroke-width', '1')
				if (this.env._board.at([i, j]) === GomokuRLEnvironment.WHITE) {
					circle.setAttribute('fill', 'white')
				} else if (this.env._board.at([i, j]) === GomokuRLEnvironment.BLACK) {
					circle.setAttribute('fill', 'black')
				}
				this._cells[i][j].appendChild(circle)
			}
		}
	}
}

class Gomoku extends Game {
	constructor(platform) {
		super(platform)
		this._board = platform.env._board
		this.turns = [GomokuRLEnvironment.BLACK, GomokuRLEnvironment.WHITE]
	}

	_showResult(r) {
		const winner = this._board.winner
		r.innerHTML =
			winner === GomokuRLEnvironment.BLACK
				? 'BLACK WIN'
				: winner === GomokuRLEnvironment.WHITE
				  ? 'WHITE WIN'
				  : 'DRAW'
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
		this._obj = document.createElementNS('http://www.w3.org/2000/svg', 'g')
		this._renderer.svg.appendChild(this._obj)
		const check = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		check.setAttribute('x', 0)
		check.setAttribute('y', 0)
		check.setAttribute('width', width)
		check.setAttribute('height', height)
		check.setAttribute('opacity', 0)
		this._obj.appendChild(check)
		return new Promise(resolve => {
			check.onclick = e => {
				const pos = d3.pointer(e)
				const cell = [
					Math.floor((pos[1] / width) * board.size[0]),
					Math.floor((pos[0] / height) * board.size[1]),
				]
				this._obj.remove()
				this._obj = null
				resolve(cell)
			}
		})
	}

	close() {
		this._obj?.remove()
	}
}
