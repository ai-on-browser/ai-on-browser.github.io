import WaterballRLEnvironment from '../../../lib/rl/waterball.js'

export default class WaterballRenderer extends WaterballRLEnvironment {
	// https://cs.stanford.edu/people/karpathy/reinforcejs/waterworld.html
	constructor(platform) {
		super(platform.width, platform.height)
		this.platform = platform

		this._ball_elms = []
		this._init_menu()
	}

	_init_menu() {
		const r = this.platform.setting.rl.configElement
		r.replaceChildren()
		r.appendChild(document.createTextNode('Number of balls '))
		const maxsize = document.createElement('input')
		maxsize.type = 'number'
		maxsize.min = 1
		maxsize.max = 100
		maxsize.value = this._max_size
		maxsize.onchange = () => {
			this._max_size = +maxsize.value
		}
		r.appendChild(maxsize)
	}

	init(r) {
		const g = r
			.append('g')
			.classed('agent', true)
			.attr('transform', `translate(${this._agent_p.join(',')})`)
		let dt = 360 / this._sensor_count
		for (let i = 0; i < this._sensor_count; i++) {
			g.append('line')
				.classed(`sensor_${i}`, true)
				.attr('x1', 0)
				.attr('x2', this._sensor_length)
				.attr('y1', 0)
				.attr('y2', 0)
				.attr('stroke', 'black')
				.attr('stroke-width', 1)
				.attr('transform', `rotate(${dt * i})`)
		}
		g.append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('fill', d3.rgb(128, 128, 128))
			.attr('stroke-width', 0)
			.attr('r', this._agent_radius)
	}

	render(r) {
		this._balls.forEach((b, i) => {
			if (!this._ball_elms[i]) {
				this._ball_elms[i] = r
					.append('circle')
					.attr('r', this._ball_radius)
					.attr('stroke', 'gray')
					.attr('stroke-width', 1)
			}
			this._ball_elms[i]
				.attr('cx', b.c[0])
				.attr('cy', b.c[1])
				.attr('fill', b.type === 'apple' ? d3.rgb(255, 96, 96) : d3.rgb(96, 255, 96))
		})
		if (this._balls.length < this._ball_elms.length) {
			for (let i = this._balls.length; i < this._ball_elms.length; i++) {
				this._ball_elms[i].remove()
			}
			this._ball_elms.length = this._balls.length
		}
		r.select('.agent').attr('transform', `translate(${this._agent_p.join(',')})`)
		const state = this.state()
		for (let i = 0; i < this._sensor_count; i++) {
			const l = state[2 + i * 4]
			const type = state[2 + i * 4 + 1]
			r.select(`.sensor_${i}`)
				.attr('x2', l)
				.attr(
					'stroke',
					type === 'apple' ? d3.rgb(255, 160, 160) : type === 'poison' ? d3.rgb(160, 255, 160) : 'black'
				)
		}
	}
}
