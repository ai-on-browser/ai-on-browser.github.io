export default class WaterballRenderer {
	constructor(renderer) {
		this.renderer = renderer
		this._init_menu()
	}

	_init_menu() {
		const r = this.renderer.setting.rl.configElement
		r.replaceChildren()
		r.appendChild(document.createTextNode('Number of balls '))
		const maxsize = document.createElement('input')
		maxsize.type = 'number'
		maxsize.min = 1
		maxsize.max = 100
		maxsize.value = this.renderer.env._max_size
		maxsize.onchange = () => {
			this.renderer.env._max_size = +maxsize.value
		}
		r.appendChild(maxsize)
	}

	init(r) {
		this._envrenderer = new Renderer(this.renderer.env, { g: r })
		this._envrenderer.init()
	}

	render() {
		this._envrenderer.render()
	}
}

class Renderer {
	constructor(env, config = {}) {
		this.env = env

		this._ball_elms = []

		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		this.svg.setAttribute('width', this.env._width)
		this.svg.setAttribute('height', this.env._height)
		if (config.g) {
			config.g.replaceChildren(this.svg)
		}
	}

	init() {
		const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
		g.classList.add('agent')
		g.setAttribute('transform', `translate(${this.env._agent_p.join(',')})`)
		this.svg.appendChild(g)

		let dt = 360 / this.env._sensor_count
		for (let i = 0; i < this.env._sensor_count; i++) {
			const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
			line.classList.add(`sensor_${i}`)
			line.setAttribute('x1', 0)
			line.setAttribute('x2', this.env._sensor_length)
			line.setAttribute('y1', 0)
			line.setAttribute('y2', 0)
			line.setAttribute('stroke', 'black')
			line.setAttribute('stroke-width', 1)
			line.setAttribute('transform', `rotate(${dt * i})`)
			g.appendChild(line)
		}
		const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
		circle.setAttribute('cx', 0)
		circle.setAttribute('cy', 0)
		circle.setAttribute('fill', 'gray')
		circle.setAttribute('stroke-width', 0)
		circle.setAttribute('r', this.env._agent_radius)
		g.appendChild(circle)
	}

	render() {
		this.env._balls.forEach((b, i) => {
			if (!this._ball_elms[i]) {
				this._ball_elms[i] = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
				this._ball_elms[i].setAttribute('r', this.env._ball_radius)
				this._ball_elms[i].setAttribute('stroke', 'gray')
				this._ball_elms[i].setAttribute('stroke-width', 1)
				this.svg.appendChild(this._ball_elms[i])
			}
			this._ball_elms[i].setAttribute('cx', b.c[0])
			this._ball_elms[i].setAttribute('cy', b.c[1])
			this._ball_elms[i].setAttribute('fill', b.type === 'apple' ? '#ff6060' : '#60ff60')
		})
		if (this.env._balls.length < this._ball_elms.length) {
			for (let i = this.env._balls.length; i < this._ball_elms.length; i++) {
				this._ball_elms[i].remove()
			}
			this._ball_elms.length = this.env._balls.length
		}
		this.svg.querySelector('.agent').setAttribute('transform', `translate(${this.env._agent_p.join(',')})`)
		const state = this.env.state()
		for (let i = 0; i < this.env._sensor_count; i++) {
			const l = state[2 + i * 4]
			const type = state[2 + i * 4 + 1]
			const sensor = this.svg.querySelector(`.sensor_${i}`)
			sensor.setAttribute('x2', l)
			sensor.setAttribute('stroke', type === 'apple' ? '#ffa0a0' : type === 'poison' ? '#a0ffa0' : 'black')
		}
	}
}
