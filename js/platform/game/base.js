const Players = ['manual', 'random', 'greedy', 'minmax', 'alphabeta']

const loadedPlayer = {}

export default class GameManager {
	constructor(platform) {
		this._platform = platform
		this._game = null

		const elm = platform.setting.task.configElement
		this._r = document.createElement('div')
		elm.appendChild(this._r)
		this._r.appendChild(document.createTextNode('Play'))
		const playerSelects = []
		for (let i = 0; i < 2; i++) {
			const ps = document.createElement('select')
			ps.onchange = () => {
				mmd.style.display = ['minmax', 'alphabeta'].includes(ps.value) ? null : 'none'
			}
			for (const player of Players) {
				const opt = document.createElement('option')
				opt.value = player
				opt.innerText = player
				ps.appendChild(opt)
			}
			ps.value = 'greedy'
			this._r.appendChild(ps)
			const mmd = document.createElement('input')
			mmd.type = 'number'
			mmd.min = 1
			mmd.max = 10
			mmd.value = 5
			mmd.style.display = 'none'
			this._r.appendChild(mmd)
			playerSelects.push({
				get name() {
					return ps.value
				},
				get params() {
					return [mmd.value]
				},
			})
		}
		const playButton = document.createElement('input')
		playButton.type = 'button'
		playButton.value = 'Play'
		playButton.onclick = () => {
			this._loadPlayer(playerSelects).then(p => {
				this.start(p)
			})
		}
		this._r.appendChild(playButton)
		const resetButton = document.createElement('input')
		resetButton.type = 'button'
		resetButton.value = 'Reset'
		resetButton.onclick = () => {
			this.reset()
		}
		this._r.appendChild(resetButton)
	}

	_loadPlayer(players) {
		return Promise.all(
			players.map(p => {
				if (p.name === 'manual') {
					return null
				} else if (loadedPlayer[p.name]) {
					return new loadedPlayer[p.name](...p.params)
				}
				return import(`./${p.name}.js`).then(obj => {
					loadedPlayer[p.name] = obj.default
					return new loadedPlayer[p.name](...p.params)
				})
			})
		)
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
		this._r.querySelectorAll('input[type=button]').forEach(e => (e.disabled = true))
		this._game = this._platform._renderer[0]._subrender.game(...p)
		this._game.start().then(() => {
			this._r.querySelectorAll('input[type=button]').forEach(e => (e.disabled = false))
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
	constructor(platform) {
		this._players = []
		this._platform = platform
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
		this._platform.render()
		this._active = true
		this._turn = this.turns[0]
		while (!this._board.finish) {
			if (this._board.choices(this._turn).length > 0) {
				while (true) {
					const i = this.turns.indexOf(this._turn)
					const slct = await this._players[i].action(this._board)
					if (this._board.set(slct, this._turn)) {
						break
					}
				}
				this._platform.render()
				await new Promise(resolve => setTimeout(resolve, 0))
			}
			this._turn = this._board.nextTurn(this._turn)
		}
		this._active = false

		const width = this._platform.svg.getBoundingClientRect().width
		const height = this._platform.svg.getBoundingClientRect().height
		this._resultElm = document.createElement('div')
		this._resultElm.onclick = () => {
			this._resultElm.remove()
			this._resultElm = null
		}
		this._resultElm.style.position = 'absolute'
		this._resultElm.style.margin = 'auto'
		this._resultElm.style.top = '0'
		this._resultElm.style.left = '0'
		this._resultElm.style.bottom = '0'
		this._resultElm.style.right = '0'
		this._resultElm.style.width = `${width / 2}px`
		this._resultElm.style.height = `${height / 2}px`
		this._resultElm.style.display = 'flex'
		this._resultElm.style.justifyContent = 'center'
		this._resultElm.style.alignItems = 'center'
		this._resultElm.style.opacity = 0.8
		this._resultElm.style.background = 'white'
		this._resultElm.style.border = '1px solid black'
		this._platform.svg.appendChild(this._resultElm)
		const ts = document.createElement('div')
		this._resultElm.appendChild(ts)
		this._showResult(ts)
	}
}
