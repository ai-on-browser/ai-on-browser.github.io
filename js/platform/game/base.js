const Players = ['manual', 'random', 'greedy', 'minmax', 'alphabeta']

const loadedPlayer = {}

export default class GameManager {
	constructor(platform) {
		this._platform = platform
		this._env = platform.env
		this._game = null

		const elm = platform.setting.task.configElement
		this._r = elm.append('div')
		this._r.append('span').text('Play')
		const playerSelects = []
		for (let i = 0; i < 2; i++) {
			const ps = this._r.append('select').on('change', () => {
				mmd.style('display', ['minmax', 'alphabeta'].indexOf(ps.property('value')) >= 0 ? null : 'none')
			})
			ps.selectAll('option')
				.data(Players)
				.enter()
				.append('option')
				.property('value', d => d)
				.text(d => d)
			ps.property('value', 'greedy')
			const mmd = this._r
				.append('input')
				.attr('type', 'number')
				.attr('min', 1)
				.attr('max', 10)
				.attr('value', 5)
				.style('display', 'none')
			playerSelects.push({
				get name() {
					return ps.property('value')
				},
				get params() {
					return [mmd.property('value')]
				},
			})
		}
		this._r
			.append('input')
			.attr('type', 'button')
			.attr('value', 'Play')
			.on('click', () => {
				this._loadPlayer(playerSelects, p => {
					this.start(p)
				})
			})
		this._r
			.append('input')
			.attr('type', 'button')
			.attr('value', 'Reset')
			.on('click', () => {
				this.reset()
			})
	}

	_loadPlayer(players, cb) {
		Promise.all(
			players.map(p => {
				if (p.name === 'manual') {
					return null
				} else if (loadedPlayer[p.name]) {
					return new loadedPlayer[p.name](...p.params)
				}
				return new Promise(resolve => {
					import(`./${p.name}.js`).then(obj => {
						loadedPlayer[p.name] = obj.default
						resolve(new loadedPlayer[p.name](...p.params))
					})
				})
			})
		).then(cb)
	}

	terminate() {
		if (this._r) {
			this._r.remove()
		}
		if (this._game) {
			this._game.close()
		}
	}

	start(p) {
		this._r.selectAll('input[type=button]').property('disabled', true)
		this._game = this._env.game(...p)
		this._game.start().then(() => {
			this._r.selectAll('input[type=button]').property('disabled', false)
		})
	}

	reset() {
		if (this._game) {
			this._game.close()
			this._game = null
		}
		this._platform.reset()
		this._platform.render()
	}
}

export class Game {
	constructor(env) {
		this._players = []
		this._env = env
		this._board = null
		this._turn = null
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

	_showResult(r) {}

	async start() {
		if (this._resultElm) {
			this._resultElm.remove()
			this._resultElm = null
		}
		this._env._platform.render()
		this._active = true
		this._turn = this.turns[0]
		while (!this._board.finish) {
			if (this._board.choices(this._turn).length > 0) {
				while (true) {
					const i = this.turns.indexOf(this._turn)
					const slct = await new Promise(resolve => this._players[i].action(this._board, resolve))
					if (this._board.set(slct, this._turn)) {
						break
					}
				}
				this._env._platform.render()
				await new Promise(resolve => setTimeout(resolve, 0))
			}
			this._turn = this._board.nextTurn(this._turn)
		}
		this._active = false

		this._resultElm = this._env._platform.svg.append('g')
		const width = this._env._platform.width
		const height = this._env._platform.height
		this._resultElm
			.append('rect')
			.attr('x', width / 4)
			.attr('y', height / 4)
			.attr('width', width / 2)
			.attr('height', height / 2)
			.attr('opacity', 0.8)
			.attr('fill', 'white')
		const ts = this._resultElm
			.append('g')
			.style('transform', 'scale(1, -1) translate(0, -100%)')
			.append('text')
			.attr('transform', `translate(${width / 3}, ${height / 2})`)
		this._showResult(ts)
		this._resultElm.on('click', () => {
			this._resultElm.remove()
			this._resultElm = null
		})
	}
}
