export default class SmoothMazeRenderer {
	constructor(renderer) {
		this.renderer = renderer
		this._width = this.renderer.env._width
		this._height = this.renderer.env._height

		this._render_blocks = []
		for (let i = 0; i < this.renderer.env._map_resolution[0]; i++) {
			this._render_blocks[i] = Array(this.renderer.env._map_resolution[1])
		}
	}

	init(r) {
		const rect = document.createElement('div')
		rect.style.width = `${this._width}px`
		rect.style.height = `${this._height}px`
		rect.onclick = e => {
			const p = d3.pointer(e)
			const dx = this._width / this.renderer.env._map_resolution[0]
			const dy = this._height / this.renderer.env._map_resolution[1]
			const x = Math.floor(p[0] / dx)
			const y = Math.floor(p[1] / dy)
			this.renderer.env._points.push([x, y])
			e.stopPropagation()
			setTimeout(() => {
				this.renderer.platform.render()
			}, 0)
		}
		r.appendChild(rect)
		this._envrenderer = new Renderer(this.renderer.env, { g: rect })
		this._envrenderer.init()
	}

	render() {
		this._envrenderer.render()
	}
}

class Renderer {
	constructor(env, config = {}) {
		this.env = env

		this._render_blocks = []
		for (let i = 0; i < this.env._map_resolution[0]; i++) {
			this._render_blocks[i] = Array(this.env._map_resolution[1])
		}

		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		this.svg.setAttribute('width', this.env._width)
		this.svg.setAttribute('height', this.env._height)
		if (config.g) {
			config.g.replaceChildren(this.svg)
		}
	}

	init() {
		const dx = this.env._width / this.env._map_resolution[0]
		const dy = this.env._height / this.env._map_resolution[1]
		const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		rect.setAttribute('x', this.env._width - this.env._goal_size[0])
		rect.setAttribute('y', this.env._height - this.env._goal_size[1])
		rect.setAttribute('width', this.env._goal_size[0])
		rect.setAttribute('height', this.env._goal_size[1])
		rect.setAttribute('stroke-width', 1)
		rect.setAttribute('stroke', 'black')
		rect.setAttribute('fill', 'yellow')
		this.svg.appendChild(rect)
		const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
		circle.classList.add('agent')
		circle.setAttribute('cx', this.env._position[0])
		circle.setAttribute('cy', this.env._position[1])
		circle.setAttribute('fill', 'gray')
		circle.setAttribute('fill-opacity', 0.8)
		circle.setAttribute('stroke-width', 1)
		circle.setAttribute('stroke', 'black')
		circle.setAttribute('r', (Math.min(dx, dy) * 2) / 3)
		this.svg.appendChild(circle)
		this._blocks = document.createElementNS('http://www.w3.org/2000/svg', 'g')
		this.svg.appendChild(this._blocks)
	}

	render() {
		const dx = this.env._width / this.env._map_resolution[0]
		const dy = this.env._height / this.env._map_resolution[1]
		const map = this.env.map
		for (let i = 0; i < map.length; i++) {
			for (let j = 0; j < map[i].length; j++) {
				if (map[i][j] && !this._render_blocks[i][j]) {
					this._render_blocks[i][j] = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
					this._render_blocks[i][j].classList.add('grid')
					this._render_blocks[i][j].setAttribute('x', dx * i)
					this._render_blocks[i][j].setAttribute('y', dy * j)
					this._render_blocks[i][j].setAttribute('width', dx)
					this._render_blocks[i][j].setAttribute('height', dy)
					this._render_blocks[i][j].setAttribute('fill', 'black')
					this._blocks.appendChild(this._render_blocks[i][j])
				} else if (!map[i][j] && this._render_blocks[i][j]) {
					this._render_blocks[i][j].remove()
					this._render_blocks[i][j] = null
				}
			}
		}
		const agent = this.svg.querySelector('circle.agent')
		agent.setAttribute('cx', this.env._position[0])
		agent.setAttribute('cy', this.env._position[1])
	}
}
