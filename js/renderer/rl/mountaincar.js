export default class MountainCarRenderer {
	constructor(renderer) {
		this.renderer = renderer
	}

	init(r) {
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
}

class Renderer {
	constructor(env, config = {}) {
		this.env = env

		this._size = [config.width || 200, config.height || 200]

		this._cart_size = [50, 30]
		this._scale = 300
		this._upon = 10

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

		const p = []
		const dx = (this.env._max_position - this.env._min_position) / 100
		const offx = ((this.env._max_position + this.env._min_position) * this._scale - width) / 2
		for (let i = 0; i < 100; i++) {
			const x = this.env._min_position + dx * i
			p.push([x * this._scale - offx, height - this._height(x) * this._scale])
		}
		p.push([
			this.env._max_position * this._scale - offx,
			height - this._height(this.env._max_position) * this._scale,
		])

		let d = ''
		for (let i = 0; i < p.length; i++) {
			d += `${i === 0 ? 'M' : 'L'}${p[i][0]},${p[i][1]}`
		}
		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		path.setAttribute('stroke', 'black')
		path.setAttribute('fill-opacity', 0)
		path.setAttribute('d', d)
		this.svg.appendChild(path)

		const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		rect.setAttribute('width', this._cart_size[0])
		rect.setAttribute('height', this._cart_size[1])
		rect.setAttribute('fill', 'gray')
		rect.style.transformBox = 'fill-box'
		rect.style.transformOrigin = 'center'
		this.svg.appendChild(rect)
	}

	_height(x) {
		return Math.sin(3 * x) * 0.45 + 0.55
	}

	render() {
		const width = this._size[0]
		const height = this._size[1]

		const offx = ((this.env._max_position + this.env._min_position) * this._scale - width) / 2

		const t = Math.atan(-0.45 * 3 * Math.cos(3 * this.env._position))
		const cart = this.svg.querySelector('rect')
		cart.setAttribute(
			'x',
			this.env._position * this._scale - offx - this._cart_size[0] / 2 + Math.sin(t) * this._upon
		)
		cart.setAttribute(
			'y',
			height - this._cart_size[1] - this._height(this.env._position) * this._scale - Math.cos(t) * this._upon
		)
		cart.style.transform = `rotate(${(t * 360) / (2 * Math.PI) + 180}deg)`
	}
}
