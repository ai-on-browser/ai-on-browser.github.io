import RandomPlayer from './random.js'
import GreedyPlayer from './greedy.js'
import MinmaxPlayer from './minmax.js'
import AlphaBetaPlayer from './alphabeta.js'

const Players = ['manual', 'random', 'greedy', 'minmax', 'alphabeta']

export default class GameManager {
	constructor(platform) {
		this._platform = platform
		this._env = platform.env
		this._game = null

		const elm = platform.setting.task.configElement
		this._r = elm.append("div")
		this._r.append("span").text("Play")
		const playerSelects = []
		const playerParams = []
		for (let i = 0; i < 2; i++) {
			const ps = this._r.append("select")
				.on("change", () => {
					mmd.style("display", ["minmax", "alphabeta"].indexOf(ps.property("value")) >= 0 ? null : "none")
				})
			ps.selectAll("option")
				.data(Players)
				.enter()
				.append("option")
				.property("value", d => d)
				.text(d => d)
			ps.property("value", "greedy")
			playerSelects.push(ps)
			const mmd = this._r.append("input")
				.attr("type", "number")
				.attr("min", 1)
				.attr("max", 10)
				.attr("value", 5)
				.style("display", "none")
			playerParams[i] = [mmd]
		}
		this._r.append("input")
			.attr("type", "button")
			.attr("value", "Play")
			.on("click", () => {
				const p = playerSelects.map((s, i) => {
					switch (s.property("value")) {
					case 'manual':
						return null
					case 'random':
						return new new RandomPlayer()
					case 'greedy':
						return new GreedyPlayer()
					case 'minmax':
						const d = +playerParams[i][0].property("value")
						return new MinmaxPlayer(d)
					case 'alphabeta':
						const dab = +playerParams[i][0].property("value")
						return new AlphaBetaPlayer(dab)
					}
				})
				this.start(p)
			})
		this._r.append("input")
			.attr("type", "button")
			.attr("value", "Reset")
			.on("click", () => {
				this.reset()
			})
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
		this._game = this._env.game(...p)
		this._game.start()
		this._platform.render()
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

    _showResult(r) {
    }

	async start() {
		if (this._resultElm) {
			this._resultElm.remove()
			this._resultElm = null
		}
		this._env.platform.render()
		this._active = true
		this._turn = this.turns[0]
		while (!this._board.finish) {
			while (true) {
				const i = this.turns.indexOf(this._turn)
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
        this._showResult(ts)
		this._resultElm.on("click", () => {
			this._resultElm.remove()
			this._resultElm = null
		})
	}
}
