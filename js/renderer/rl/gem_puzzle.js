import GemPuzzleRLEnvironment from '../../../lib/rl/gem_puzzle.js'

export default class GemPuzzleRenderer {
	constructor(renderer) {
		this.renderer = renderer
		this._init_menu()
	}

	_init_menu() {
		const r = this.renderer.setting.rl.configElement
		r.replaceChildren()
		r.appendChild(document.createTextNode('Size '))
		const size = document.createElement('input')
		size.type = 'number'
		size.min = 2
		size.max = 10
		size.value = this.renderer.env._size[0]
		size.onchange = () => {
			this.renderer.env._size = [+size.value, +size.value]
			this.renderer.env._board._size = [+size.value, +size.value]
			this.renderer.platform.init()
			this.renderer.env.reset()
			this.renderer.setting.ml.refresh()
		}
		r.appendChild(size)
	}

	init(r) {
		const width = 500
		const height = 500
		const base = r.appendChild(document.createElement('div'))
		base.style.position = 'relative'
		this._envrenderer = new Renderer(this.renderer.env, { width, height, g: base })
		this._envrenderer.init()

		this._resetButton = document.createElement('button')
		this._resetButton.innerText = 'Reset'
		this._resetButton.onclick = async () => {
			this.renderer.env.reset()
			this._envrenderer.render()
		}
		r.appendChild(this._resetButton)

		this._manualButton = document.createElement('button')
		this._manualButton.innerText = 'Manual'
		this._manualButton.onclick = async () => {
			this._game = new GemPuzzleGame(this.renderer.platform)
			this._autoButton.disabled = true
			this._manualButton.disabled = true
			this._resetButton.disabled = true
			this._cancelButton.style.display = 'inline'
			await this._game.start()
			this._autoButton.disabled = false
			this._manualButton.disabled = false
			this._resetButton.disabled = false
			this._cancelButton.style.display = 'none'
			this._game = null
		}
		r.appendChild(this._manualButton)

		this._autoButton = document.createElement('button')
		this._autoButton.innerText = 'Auto'
		this._autoButton.onclick = async () => {
			this._game = new GemPuzzleGame(this.renderer.platform)
			this._autoButton.disabled = true
			this._manualButton.disabled = true
			this._resetButton.disabled = true
			this._cancelButton.style.display = 'inline'
			await this._game.start(true)
			this._autoButton.disabled = false
			this._manualButton.disabled = false
			this._resetButton.disabled = false
			this._cancelButton.style.display = 'none'
			this._game = null
		}
		r.appendChild(this._autoButton)

		this._cancelButton = document.createElement('button')
		this._cancelButton.innerText = 'Cancel'
		this._cancelButton.onclick = async () => {
			this._game.cancel()
			this._cancelButton.style.display = 'none'
		}
		this._cancelButton.style.display = 'none'
		r.appendChild(this._cancelButton)
	}

	render() {
		const displayButton = this.renderer.platform._manager._modelname ? 'none' : null
		this._resetButton.style.display = displayButton
		this._manualButton.style.display = displayButton
		this._autoButton.style.display = displayButton
		this._envrenderer.render()
	}
}

class Renderer {
	constructor(env, config = {}) {
		this.env = env

		this._size = [config.width || 200, config.height || 200]

		this._points = []

		this._q = null

		this._render_blocks = []

		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		this.svg.setAttribute('width', this._size[0])
		this.svg.setAttribute('height', this._size[1])
		this.svg.setAttribute('viewbox', '0 0 200 200')
		if (config.g) {
			config.g.replaceChildren(this.svg)
		}
	}

	init() {
		const height = this._size[0]
		const width = this._size[1]
		const dy = height / this.env._size[0]
		const dx = width / this.env._size[1]
		this._render_blocks = []
		for (let i = 0; i < this.env._size[0]; i++) {
			this._render_blocks[i] = []
			for (let j = 0; j < this.env._size[1]; j++) {
				const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
				g.classList.add('grid')
				g.setAttribute('stroke-width', 1)
				g.setAttribute('stroke', 'black')
				g.setAttribute('stroke-opacity', 0.2)
				this.svg.appendChild(g)
				this._render_blocks[i][j] = g

				const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
				rect.setAttribute('x', dx * j)
				rect.setAttribute('y', dx * i)
				rect.setAttribute('width', dx)
				rect.setAttribute('height', dy)
				rect.setAttribute('fill', 'white')
				g.appendChild(rect)
				const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
				text.classList.add('value')
				text.setAttribute('x', dx * (j + 0.5))
				text.setAttribute('y', dy * (i + 0.5))
				text.setAttribute('font-size', 14)
				text.setAttribute('user-select', 'none')
				text.setAttribute('dominant-baseline', 'middle')
				text.setAttribute('text-anchor', 'middle')
				g.appendChild(text)
			}
		}
		this.render()
	}

	render() {
		const board = this.env._board

		for (let i = 0; i < this.env._size[0]; i++) {
			for (let j = 0; j < this.env._size[1]; j++) {
				this._render_blocks[i][j].querySelector('text.value').replaceChildren(board.at([i, j]) ?? '')
				if (board.at([i, j]) === null) {
					this._render_blocks[i][j].querySelector('rect').setAttribute('fill', 'rgba(0, 0, 0, 0.5)')
				} else {
					this._render_blocks[i][j].querySelector('rect').setAttribute('fill', 'white')
				}
			}
		}
	}
}

class GemPuzzleGame {
	constructor(platform) {
		this._platform = platform
		this._env = platform.env
		this._cancel = false
	}

	async start(auto = false) {
		this._platform.render()
		if (auto) {
			const path = this._env._board.solve()
			for (const m of path) {
				await new Promise(resolve => setTimeout(resolve, 50))
				this._env.step([m])
				this._platform.render()
				if (this._cancel) {
					break
				}
			}
			return
		}
		const { promise, resolve: cancelResolver } = Promise.withResolvers()
		this._cancelResolver = cancelResolver
		while (true) {
			const move = await Promise.race([
				promise,
				new Promise(resolve => {
					const keyDown = e => {
						if (e.code === 'ArrowUp') {
							resolve(GemPuzzleRLEnvironment.UP)
						} else if (e.code === 'ArrowDown') {
							resolve(GemPuzzleRLEnvironment.DOWN)
						} else if (e.code === 'ArrowLeft') {
							resolve(GemPuzzleRLEnvironment.LEFT)
						} else if (e.code === 'ArrowRight') {
							resolve(GemPuzzleRLEnvironment.RIGHT)
						}
						document.removeEventListener('keydown', keyDown)
					}
					document.addEventListener('keydown', keyDown)
				}),
			])
			if (move === null) {
				break
			}
			const { done } = this._env.step([move])
			this._platform.render()
			if (done) {
				break
			}
			await new Promise(resolve => setTimeout(resolve, 10))
		}
	}

	cancel() {
		this._cancelResolver?.(null)
		this._cancel = true
	}
}
