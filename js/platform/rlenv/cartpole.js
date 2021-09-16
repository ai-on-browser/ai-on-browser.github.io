import CartPoleRLEnvironment from '../../../lib/rl/cartpole.js'

export default class CartPoleRenderer extends CartPoleRLEnvironment {
	constructor(platform) {
		super()
		this.platform = platform

		this._cart_size = [50, 30]
		this._move_scale = 50
		this._pendulum_scale = 400
	}

	init(r) {
		r.append('rect')
			.classed('cart', true)
			.attr('y', 0)
			.attr('width', this._cart_size[0])
			.attr('height', this._cart_size[1])
			.attr('fill', 'gray')
		r.append('line')
			.classed('pendulum', true)
			.attr('y1', this._cart_size[1] / 2)
			.attr('stroke-width', 5)
			.attr('stroke', 'black')
	}

	render(r) {
		const width = this.platform.width

		r.select('rect.cart').attr('x', width / 2 - this._position * this._move_scale)
		const x = width / 2 - this._position * this._move_scale + this._cart_size[0] / 2
		r.select('line.pendulum')
			.attr('x1', x)
			.attr('x2', x - this._pendulum_length * Math.sin(this._angle) * this._pendulum_scale)
			.attr('y2', this._cart_size[1] / 2 + this._pendulum_length * Math.cos(this._angle) * this._pendulum_scale)
	}
}
