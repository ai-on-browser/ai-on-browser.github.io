import BreakerRLEnvironment from '../../../lib/rl/breaker.js'

export default class BreakerRenderer extends BreakerRLEnvironment {
	constructor(platform) {
		super()
		this._platform = platform
		this._width = this._platform.width
		this._height = this._platform.height

		this._org_width = this._platform.width
		this._org_height = this._platform.height

		this._render_blocks = []
	}

	init(r) {
		this._platform.width = this._size[0]
		this._platform.height = this._size[1]

		this._render_blocks = []
		for (let i = 0; i < this._block_positions.length; i++) {
			this._render_blocks[i] = r
				.append('rect')
				.attr('x', this._block_positions[i][0] - this._block_size[0] / 2)
				.attr('y', this._block_positions[i][1] - this._block_size[1] / 2)
				.attr('width', this._block_size[0])
				.attr('height', this._block_size[1])
				.attr(
					'fill',
					`rgb(${Math.floor(Math.random() * 128)}, ${Math.floor(Math.random() * 128)}, ${Math.floor(
						Math.random() * 128
					)})`
				)
		}
		this._render_ball = r
			.append('circle')
			.attr('cx', this._ball_position[0])
			.attr('cy', this._ball_position[1])
			.attr('r', this._ball_radius)
			.attr('fill', 'black')
		this._render_paddle = r
			.append('rect')
			.attr('x', this._paddle_position - this._paddle_size[0] / 2)
			.attr('y', this._paddle_baseline - this._paddle_size[1] / 2)
			.attr('width', this._paddle_size[0])
			.attr('height', this._paddle_size[1])
			.attr('fill', 'black')

		const buttonWidth = 100
		this._manualButton = r
			.append('g')
			.style('transform', `translate(${this._size[0] / 2 - buttonWidth / 2}px, 100px)`)
			.style('cursor', 'pointer')
			.on('click', async () => {
				this._game = new BreakerGame(this)
				await this._game.start()
				this._game = null
				this._manualButton.attr('opacity', 1)
			})
		this._manualButton
			.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', buttonWidth)
			.attr('height', 20)
			.attr('fill-opacity', 0)
			.attr('stroke', 'gray')
		this._manualButton
			.append('text')
			.attr('x', buttonWidth / 2)
			.attr('y', -10)
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'central')
			.style('transform', 'scale(1, -1)')
			.style('pointer-events', 'none')
			.style('user-select', 'none')
			.text('Start')
	}

	render(r) {
		this._manualButton.attr('opacity', this._game || this._platform._manager._modelname ? 0 : 1)
		for (let i = 0; i < this._block_positions.length; i++) {
			if (!this._block_existances[i]) {
				this._render_blocks[i].style('display', 'none')
			} else {
				this._render_blocks[i].style('display', null)
			}
		}
		this._render_ball.attr('cx', this._ball_position[0]).attr('cy', this._ball_position[1])
		this._render_paddle.attr('x', this._paddle_position - this._paddle_size[0] / 2)
	}

	close() {
		this._platform.width = this._org_width
		this._platform.height = this._org_height
	}
}

class BreakerGame {
	constructor(env) {
		this._env = env
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
			this._env.render()
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
