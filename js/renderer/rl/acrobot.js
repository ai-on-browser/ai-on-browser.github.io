export default class AcrobotRenderer {
	constructor(renderer) {
		this.renderer = renderer
	}

	init(r) {
		this._envrenderer = new Renderer(this.renderer.env, {
			width: this.renderer.width,
			height: this.renderer.height,
			g: r.node(),
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

		this._scale = 100

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
		const p0 = [width / 2, height / 2]
		const p1 = [p0[0] + this._scale * Math.sin(this.env._theta1), p0[1] + this._scale * Math.cos(this.env._theta1)]
		const p2 = [p1[0] + this._scale * Math.sin(this.env._theta2), p1[1] + this._scale * Math.cos(this.env._theta2)]

		const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
		circle.setAttribute('cx', p0[0])
		circle.setAttribute('cy', p0[1])
		circle.setAttribute('fill', 'gray')
		circle.setAttribute('fill-opacity', 0.8)
		circle.setAttribute('stroke-width', 0)
		circle.setAttribute('r', 10)
		this.svg.appendChild(circle)

		const link1 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
		link1.setAttribute('name', 'link1')
		link1.setAttribute('x1', p0[0])
		link1.setAttribute('x2', p1[0])
		link1.setAttribute('y1', p0[1])
		link1.setAttribute('y2', p1[1])
		link1.setAttribute('stroke', 'black')
		link1.setAttribute('stroke-width', 5)
		this.svg.appendChild(link1)

		const link2 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
		link2.setAttribute('name', 'link2')
		link2.setAttribute('x1', p1[0])
		link2.setAttribute('x2', p2[0])
		link2.setAttribute('y1', p1[1])
		link2.setAttribute('y2', p2[1])
		link2.setAttribute('stroke', 'black')
		link2.setAttribute('stroke-width', 5)
		this.svg.appendChild(link2)
	}

	render() {
		const width = this._size[0]
		const height = this._size[1]

		const p0 = [width / 2, height / 2]
		const p1 = [p0[0] + this._scale * Math.sin(this.env._theta1), p0[1] + this._scale * Math.cos(this.env._theta1)]
		const p2 = [p1[0] + this._scale * Math.sin(this.env._theta2), p1[1] + this._scale * Math.cos(this.env._theta2)]
		const link1 = this.svg.querySelector('line[name=link1]')
		link1.setAttribute('x2', p1[0])
		link1.setAttribute('y2', p1[1])
		const link2 = this.svg.querySelector('line[name=link2]')
		link2.setAttribute('x1', p1[0])
		link2.setAttribute('x2', p2[0])
		link2.setAttribute('y1', p1[1])
		link2.setAttribute('y2', p2[1])
	}
}
