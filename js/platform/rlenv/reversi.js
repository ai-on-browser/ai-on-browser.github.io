import ReversiRLEnvironment from '../../../lib/rl/reversi.js'
import { Game } from '../game/base.js'

export default class ReversiRenderer extends ReversiRLEnvironment {
	constructor(platform) {
		super()
		this._platform = platform

		this._game = new Reversi(this)

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
					.attr('fill', '#339933')
					.attr('stroke', '#333333')
					.attr('stroke-width', '1')
			}
		}
	}

	render(r) {
		for (let i = 0; i < this._cells.length; i++) {
			for (let j = 0; j < this._cells[i].length; j++) {
				this._cells[i][j].selectAll('circle').remove()
				if (this._board.at([i, j]) === ReversiRLEnvironment.EMPTY) {
					continue
				}
				const cell = this._cells[i][j].select('rect')
				const x = +cell.attr('x')
				const y = +cell.attr('y')
				const width = +cell.attr('width')
				const height = +cell.attr('height')
				const circle = this._cells[i][j]
					.append('circle')
					.attr('cx', x + width / 2)
					.attr('cy', y + height / 2)
					.attr('r', Math.min(width, height) * 0.4)
					.attr('stroke', 'black')
					.attr('stroke-width', '1')
				if (this._board.at([i, j]) === ReversiRLEnvironment.WHITE) {
					circle.attr('fill', 'white')
				} else if (this._board.at([i, j]) === ReversiRLEnvironment.BLACK) {
					circle.attr('fill', 'black')
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
		players[0].turn = ReversiRLEnvironment.BLACK
		players[1].turn = ReversiRLEnvironment.WHITE
		this._game.players = players
		return this._game
	}

	close() {
		this._platform.width = this._org_width
		this._platform.height = this._org_height
	}
}

class Reversi extends Game {
	constructor(env) {
		super(env)
		this._board = env._board
		this.turns = [ReversiRLEnvironment.BLACK, ReversiRLEnvironment.WHITE]
	}

	_showResult(r) {
		const count = this._board.count
		r.append('tspan').attr('x', '0em').attr('y', '-1em').text(`BLACK: ${count.black}`)
		r.append('tspan').attr('x', '0em').attr('y', '1em').text(`WHITE: ${count.white}`)
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
		const _this = this
		this._obj = this._env._platform.svg.append('g')
		const choices = board.choices(this._turn)
		this._obj
			.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', width)
			.attr('height', height)
			.attr('opacity', 0)
			.on('click', e => {
				const pos = d3.pointer(e)
				const cell = [
					Math.floor((pos[1] / width) * board.size[0]),
					Math.floor((pos[0] / height) * board.size[1]),
				]
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
