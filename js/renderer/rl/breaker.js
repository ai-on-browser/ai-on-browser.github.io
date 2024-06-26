export default class BreakerRenderer {
	constructor(renderer) {
		this.renderer = renderer

		this._render_blocks = []
	}

	init(r) {
		const width = this.renderer.env._size[0]
		const height = this.renderer.env._size[1]

		this._envrenderer = new Renderer(this.renderer.env, {
			g: r,
		})
		this._envrenderer.init()

		const buttonWidth = 100
		this._manualButton = document.createElement('button')
		this._manualButton.innerText = 'Start'
		this._manualButton.style.position = 'absolute'
		this._manualButton.style.left = `${width / 2 - buttonWidth / 2}px`
		this._manualButton.style.top = `${height - 100}px`
		this._manualButton.style.width = `${buttonWidth}px`
		this._manualButton.onclick = async () => {
			this._game = new BreakerGame(this.renderer.platform)
			await this._game.start()
			this._game = null
			this._manualButton.style.display = null
		}
		r.appendChild(this._manualButton)
	}

	render() {
		this._manualButton.style.display = this._game || this.renderer.platform._manager._modelname ? 'none' : null
		this._envrenderer.render()
	}
}

class Renderer {
	constructor(env, config = {}) {
		this.env = env

		this._render_blocks = []

		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		this.svg.setAttribute('width', this.env._size[0])
		this.svg.setAttribute('height', this.env._size[1])
		if (config.g) {
			config.g.replaceChildren(this.svg)
		}
	}

	init() {
		const height = this.env._size[1]

		this._render_blocks = []
		for (let i = 0; i < this.env._block_positions.length; i++) {
			this._render_blocks[i] = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
			this._render_blocks[i].setAttribute('x', this.env._block_positions[i][0] - this.env._block_size[0] / 2)
			this._render_blocks[i].setAttribute(
				'y',
				height - this.env._block_positions[i][1] - this.env._block_size[1] / 2
			)
			this._render_blocks[i].setAttribute('width', this.env._block_size[0])
			this._render_blocks[i].setAttribute('height', this.env._block_size[1])
			this._render_blocks[i].setAttribute(
				'fill',
				`rgb(${Math.floor(Math.random() * 128)}, ${Math.floor(Math.random() * 128)}, ${Math.floor(
					Math.random() * 128
				)})`
			)
			this.svg.appendChild(this._render_blocks[i])
		}
		this._render_ball = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
		this._render_ball.setAttribute('cx', this.env._ball_position[0])
		this._render_ball.setAttribute('cy', height - this.env._ball_position[1])
		this._render_ball.setAttribute('r', this.env._ball_radius)
		this._render_ball.setAttribute('fill', 'black')
		this.svg.appendChild(this._render_ball)
		this._render_paddle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		this._render_paddle.setAttribute('x', this.env._paddle_position - this.env._paddle_size[0] / 2)
		this._render_paddle.setAttribute('y', height - this.env._paddle_baseline - this.env._paddle_size[1] / 2)
		this._render_paddle.setAttribute('width', this.env._paddle_size[0])
		this._render_paddle.setAttribute('height', this.env._paddle_size[1])
		this._render_paddle.setAttribute('fill', 'black')
		this.svg.appendChild(this._render_paddle)
	}

	render() {
		const height = this.env._size[1]
		for (let i = 0; i < this.env._block_positions.length; i++) {
			if (!this.env._block_existances[i]) {
				this._render_blocks[i].style.display = 'none'
			} else {
				this._render_blocks[i].style.display = null
			}
		}
		this._render_ball.setAttribute('cx', this.env._ball_position[0])
		this._render_ball.setAttribute('cy', height - this.env._ball_position[1])
		this._render_paddle.setAttribute('x', this.env._paddle_position - this.env._paddle_size[0] / 2)
	}
}

class BreakerGame {
	constructor(platform) {
		this._platform = platform
		this._env = platform.env
		this._act = 0

		this._keyDown = this.keyDown.bind(this)
		this._keyUp = this.keyUp.bind(this)
	}

	async start() {
		this._env.reset()
		document.addEventListener('keydown', this._keyDown)
		document.addEventListener('keyup', this._keyUp)
		while (true) {
			const { done } = this._env.step([this._act])
			this._platform.render()
			if (done) {
				break
			}
			await new Promise(resolve => setTimeout(resolve, 10))
		}

		document.removeEventListener('keydown', this._keyDown)
		document.removeEventListener('keyup', this._keyUp)
	}

	keyDown(e) {
		if (e.code === 'ArrowLeft') {
			this._act = -1
		} else if (e.code === 'ArrowRight') {
			this._act = 1
		}
	}

	keyUp(e) {
		if (e.code === 'ArrowLeft') {
			this._act = 0
		} else if (e.code === 'ArrowRight') {
			this._act = 0
		}
	}
}
