export default class CartPoleRenderer {
	constructor(renderer) {
		this.renderer = renderer
	}

	init(r) {
		this._envrenderer = new Renderer(this.renderer.env, { width: 500, height: 500, g: r })
		this._envrenderer.init()
	}

	render() {
		this._envrenderer.render()
	}
}

class Renderer {
	constructor(env, config = {}) {
		this.env = env

		this._size = [config.width || 200, config.height || 200]

		this._cart_size = [50, 30]
		this._move_scale = 50
		this._pendulum_scale = 400

		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		this.svg.setAttribute('width', this._size[0])
		this.svg.setAttribute('height', this._size[1])
		this.svg.setAttribute('viewbox', '0 0 200 200')
		if (config.g) {
			config.g.replaceChildren(this.svg)
		}
	}

	init() {
		const height = this._size[1]

		const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		rect.classList.add('cart')
		rect.setAttribute('y', height - this._cart_size[1])
		rect.setAttribute('width', this._cart_size[0])
		rect.setAttribute('height', this._cart_size[1])
		rect.setAttribute('fill', 'gray')
		this.svg.appendChild(rect)

		const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
		line.classList.add('pendulum')
		line.setAttribute('y1', height - this._cart_size[1] / 2)
		line.setAttribute('stroke-width', 5)
		line.setAttribute('stroke', 'black')
		this.svg.appendChild(line)
	}

	render() {
		const width = this._size[0]
		const height = this._size[1]

		const cart = this.svg.querySelector('rect.cart')
		cart.setAttribute('x', width / 2 - this.env._position * this._move_scale)
		const x = width / 2 - this.env._position * this._move_scale + this._cart_size[0] / 2
		const line = this.svg.querySelector('line.pendulum')
		line.setAttribute('x1', x)
		line.setAttribute('x2', x - this.env._pendulum_length * Math.sin(this.env._angle) * this._pendulum_scale)
		line.setAttribute(
			'y2',
			height -
				(this._cart_size[1] / 2 + this.env._pendulum_length * Math.cos(this.env._angle) * this._pendulum_scale)
		)
	}
}
