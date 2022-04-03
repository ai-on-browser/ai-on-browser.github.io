import LineRenderer from '../renderer/line.js'
import { BasePlatform } from './base.js'

class TpPlotter {
	constructor(platform, svg) {
		this._platform = platform
		if (svg.select('g.tp-render').size() === 0) {
			svg.append('g').classed('tp-render', true)
		}
		this._r = svg.select('g.tp-render')
		this._r.append('path').attr('stroke', 'black').attr('fill-opacity', 0).style('pointer-events', 'none')
		this._pred = []
		this._points = []
	}

	set trainResult(value) {
		this._pred = value
	}

	remove() {
		this._r.remove()
	}

	reset() {
		this._points.forEach(p => p.remove())
		this._points = []
		this._r.select('path').attr('opacity', 0)
	}

	plot(to_x) {
		const line = d3
			.line()
			.x(d => d[0])
			.y(d => d[1])
		this._points.forEach(p => p.remove())
		this._points = []
		const datas = this._platform.datas
		this._platform._renderer._pred_count = this._pred.length
		const path = []
		if (datas.length > 0) {
			path.push(to_x([datas.length - 1, datas.x[datas.length - 1] || [datas.y[datas.length - 1]]]))
		}
		for (let i = 0; i < this._pred.length; i++) {
			const a = to_x([i + datas.length, this._pred[i]])
			const p = new DataPoint(this._r, a, specialCategory.dummy)
			path.push(a)
			this._points.push(p)
		}
		if (path.length === 0) {
			this._r.select('path').attr('opacity', 0)
		} else {
			this._r.select('path').attr('d', line(path)).attr('opacity', 0.5)
		}
	}
}

class SmoothPlotter {
	constructor(platform, svg) {
		this._platform = platform
		if (svg.select('g.smooth-render').size() === 0) {
			svg.append('g').classed('smooth-render', true)
		}
		this._r = svg.select('g.smooth-render')
		this._r.append('path').attr('stroke', 'red').attr('fill-opacity', 0).style('pointer-events', 'none')
		this._pred = []
	}

	set trainResult(value) {
		this._pred = value
	}

	remove() {
		this._r.remove()
	}

	plot(to_x) {
		const line = d3
			.line()
			.x(d => d[0])
			.y(d => d[1])
		const path = []
		for (let i = 0; i < this._pred.length; i++) {
			const a = to_x([i, this._pred[i]])
			path.push(a)
		}
		if (path.length === 0) {
			this._r.select('path').attr('opacity', 0)
		} else {
			this._r.select('path').attr('d', line(path)).attr('opacity', 1)
		}
	}
}

class CpdPlotter {
	constructor(platform, svg) {
		this._platform = platform
		if (svg.select('g.cpd-render').size() === 0) {
			svg.insert('g', ':first-child').classed('cpd-render', true)
		}
		this._r = svg.select('g.cpd-render')
		this._pred = []
	}

	set trainResult(value) {
		if (typeof value[0] === 'number') {
			this._pred = value.map(v => v > 0)
			this._pred_value = value.concat()
		} else {
			this._pred = value.concat()
			this._pred_value = null
		}
	}

	set threshold(value) {
		if (this._pred_value) {
			this._pred = this._pred_value.map(v => v > value)
			this._platform.render()
		}
	}

	remove() {
		this._r.remove()
	}

	plot(to_x) {
		this._r.selectAll('*').remove()
		if (this._pred_value) {
			let max = Math.max(...this._pred_value)
			const min = Math.min(...this._pred_value)
			if (max === min) {
				max += 1
			}
			const canvas = document.createElement('canvas')
			canvas.width = this._platform.width
			canvas.height = this._platform.height
			const ctx = canvas.getContext('2d')
			let x = 0
			for (let i = 0; i < this._pred_value.length; i++) {
				const x1 = to_x([i + 0.5, [0]])[0]
				const v = (this._pred_value[i] - min) / (max - min)
				ctx.fillStyle = getCategoryColor(specialCategory.errorRate(v))
				ctx.fillRect(x, 0, x1 - x + 1, this._platform.height)
				x = x1
			}
			this._r
				.append('image')
				.attr('x', 0)
				.attr('y', 0)
				.attr('width', canvas.width)
				.attr('height', canvas.height)
				.attr('xlink:href', canvas.toDataURL())
				.attr('opacity', 0.3)
		}
		for (let i = 0; i < this._pred.length; i++) {
			if (!this._pred[i]) continue
			const x = to_x([i, [0]])[0]
			const l = this._r
				.append('line')
				.attr('x1', x)
				.attr('x2', x)
				.attr('y1', 0)
				.attr('y2', this._platform.height)
				.attr('stroke', 'red')
		}
	}
}

export default class SeriesPlatform extends BasePlatform {
	constructor(task, manager) {
		super(task, manager)
		this._renderer.terminate()
		this._renderer = new LineRenderer(manager)
	}

	get trainInput() {
		const x = this.datas.dimension > 0 ? this.datas.x : this.datas.y.map(v => [v])
		if (!x.rolling) {
			Object.defineProperty(x, 'rolling', {
				value: n => {
					const data = []
					for (let i = 0; i < x.length - n + 1; i++) {
						data.push([].concat(...x.slice(i, i + n)))
					}
					return data
				},
			})
		}
		return x
	}

	get trainOutput() {
		return this.datas.y
	}

	set trainResult(value) {
		this._plotter.trainResult = value
		this.render()
	}

	init() {
		if (this.svg.select('g.ts-render').size() === 0) {
			if (this._task === 'SM') {
				this.svg.append('g').classed('ts-render', true)
			} else {
				this.svg.insert('g', ':first-child').classed('ts-render', true)
			}
		}
		this._r = this.svg.select('g.ts-render')
		this._r.selectAll('*').remove()
		if (this._task === 'TP') {
			this._plotter = new TpPlotter(this, this._r)
		} else if (this._task === 'SM') {
			this._plotter = new SmoothPlotter(this, this._r)
		} else if (this._task === 'CP') {
			this._plotter = new CpdPlotter(this, this._r)
		}

		this._renderer._make_selector()
		if (this.datas) {
			this.datas.clip = false
			this._renderer._pred_count = 0
			this.render()
		}
	}

	render() {
		if (this.datas) {
			this._renderer.render()
			this._plotter.plot(this._renderer.toPoint.bind(this._renderer))
		}
	}

	terminate() {
		if (this.datas) {
			this.datas.clip = true
		}
		this._r.remove()
		this.svg.select('g.ts-render-path').remove()
		super.terminate()
	}
}
