import AcrobotRLEnvironment from '../../../lib/rl/acrobot.js'

export default class AcrobotRenderer extends AcrobotRLEnvironment {
	constructor(platform) {
		super()
		this.platform = platform

		this._scale = 100
	}

	init(r) {
		const width = this.platform.width
		const height = this.platform.height
		const p0 = [width / 2, height / 2]
		const p1 = [p0[0] + this._scale * Math.sin(this._theta1), p0[1] + this._scale * Math.cos(this._theta1)]
		const p2 = [p1[0] + this._scale * Math.sin(this._theta2), p1[1] + this._scale * Math.cos(this._theta2)]
		r.append('circle')
			.attr('cx', p0[0])
			.attr('cy', p0[1])
			.attr('fill', d3.rgb(128, 128, 128, 0.8))
			.attr('stroke-width', 0)
			.attr('r', 10)
		r.append('line')
			.attr('name', 'link1')
			.attr('x1', p0[0])
			.attr('x2', p1[0])
			.attr('y1', p0[1])
			.attr('y2', p1[1])
			.attr('stroke', 'black')
			.attr('stroke-width', 5)
		r.append('line')
			.attr('name', 'link2')
			.attr('x1', p1[0])
			.attr('x2', p2[0])
			.attr('y1', p1[1])
			.attr('y2', p2[1])
			.attr('stroke', 'black')
			.attr('stroke-width', 5)
	}

	render(r) {
		const width = this.platform.width
		const height = this.platform.height

		const p0 = [width / 2, height / 2]
		const p1 = [p0[0] + this._scale * Math.sin(this._theta1), p0[1] - this._scale * Math.cos(this._theta1)]
		const p2 = [p1[0] + this._scale * Math.sin(this._theta2), p1[1] - this._scale * Math.cos(this._theta2)]
		r.select('line[name=link1]').attr('x2', p1[0]).attr('y2', p1[1])
		r.select('line[name=link2]').attr('x1', p1[0]).attr('x2', p2[0]).attr('y1', p1[1]).attr('y2', p2[1])
	}
}