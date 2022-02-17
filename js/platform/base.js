import FittingMode from '../fitting.js'

const scale = function (v, smin, smax, dmin, dmax) {
	if (!isFinite(smin) || !isFinite(smax) || smin === smax) {
		return (dmax + dmin) / 2
	}
	return ((v - smin) / (smax - smin)) * (dmax - dmin) + dmin
}

class DataRenderer {
	constructor(manager) {
		this._manager = manager
		this._r = this.setting.svg.select('g.points g.datas')
		if (this._r.size() === 0) {
			const pointDatas = this.setting.svg.append('g').classed('points', true)
			this._r = pointDatas.append('g').classed('datas', true)
		}

		this._p = []
		this._pad = 10
		this._clip_pad = -Infinity
		this._pred_count = 0

		this._observe_target = null
		this._observer = new MutationObserver(mutations => {
			if (this._observe_target) {
				this._p.forEach(
					(p, i) =>
						(p.title = this.data._categorical_output
							? this.data._output_category_names[this.data.y[i] - 1]
							: this.data.y[i])
				)
			}
		})
		this._observer.observe(this.setting.svg.node(), {
			childList: true,
		})

		this._will_render = false
	}

	get padding() {
		if (!Array.isArray(this._pad)) {
			return [this._pad, this._pad]
		}
		return this._pad
	}

	set padding(pad) {
		this._pad = pad
		this.render()
	}

	set clipPadding(pad) {
		this._clip_pad = pad
		this.render()
	}

	get _series() {
		return this.data?.isSeries
	}

	get setting() {
		return this._manager.setting
	}

	get width() {
		return this._manager.platform.width
	}

	get height() {
		return this._manager.platform.height
	}

	get points() {
		return this._p
	}

	get data() {
		return this._manager.datas
	}

	_clip(x) {
		if (this._clip_pad === -Infinity) {
			return x
		}
		const limit = [this.width, this.height]
		for (let i = 0; i < x.length; i++) {
			if (x[i] < this._clip_pad) {
				x[i] = this._clip_pad
			} else if (limit[i] - this._clip_pad < x[i]) {
				x[i] = limit[i] - this._clip_pad
			}
		}
		return x
	}

	render() {
		if (!this._will_render) {
			this._will_render = true
			Promise.resolve().then(() => {
				if (this._will_render) {
					this._will_render = false
					this._render()
				}
			})
		}
	}

	toPoint(value) {
		const k = this.data.selectedColumnIndex
		const domain = this._series ? this.data.series.domain : this.data.domain
		const range = [this.width, this.height]
		const [ymin, ymax] = this.data.range
		const d = k.map(
			(t, s) => scale(value[t], domain[t][0], domain[t][1], 0, range[s] - this.padding[s] * 2) + this.padding[s]
		)
		if (this._series) {
			if (Array.isArray(value[0])) {
				const r = this.data.domain[0]
				d[1] = scale(value[1], ymin, ymax, 0, range[1] - this.padding[1] * 2) + this.padding[1]
				d[0] = scale(value[0][0], r[0], r[1], 0, range[0] - this.padding[0] * 2) + this.padding[0]
			} else {
				const k0 = Math.min(k[0], value[1].length - 1)
				d[1] =
					scale(value[1][k0], domain[k[0]][0], domain[k[0]][1], 0, range[1] - this.padding[1] * 2) +
					this.padding[1]
				d[0] =
					scale(value[0], 0, this.data.length + this._pred_count, 0, range[0] - this.padding[0] * 2) +
					this.padding[0]
			}
		}
		if (d.length === 1 && value.length > 1) {
			d[1] = scale(value[1], ymin, ymax, 0, range[1] - this.padding[1] * 2) + this.padding[1]
		}
		return d.map(v => (isNaN(v) ? 0 : v))
	}

	toValue(x) {
		if (x && this._series) {
			return [scale(x[0] - this.padding[0], 0, this.width - this.padding[0] * 2, 0, this.data.length)]
		}
		return []
	}

	_render() {
		if (!this.data || this.data.dimension === 0) {
			this._p.map(p => p.remove())
			this._p.length = 0
			return
		}
		const k = this.data.selectedColumnIndex
		const n = this.data.length
		const data = this._series ? this.data.series.values : this.data.x
		const domain = this._series ? this.data.series.domain : this.data.domain
		const range = [this.width, this.height]
		const [ymin, ymax] = this.data.range
		const radius = Math.max(1, Math.min(5, Math.floor(2000 / n)))
		for (let i = 0; i < n; i++) {
			const d = k.map(
				(t, s) =>
					scale(data[i][t], domain[t][0], domain[t][1], 0, range[s] - this.padding[s] * 2) + this.padding[s]
			)
			if (this._series) {
				d[1] =
					scale(data[i][k[0]], domain[k[0]][0], domain[k[0]][1], 0, range[1] - this.padding[1] * 2) +
					this.padding[1]
				d[0] = scale(i, 0, n + this._pred_count, 0, range[0] - this.padding[0] * 2) + this.padding[0]
			}
			if (d.length === 1) {
				d[1] = scale(this.data.y[i], ymin, ymax, 0, range[1] - this.padding[1] * 2) + this.padding[1]
			}

			const dp = this._clip(d)
			const cat = this.data.dimension === 1 ? 0 : this.data.y[i]
			if (this._p[i]) {
				const op = this._p[i].at
				if (op[0] !== dp[0] || op[1] !== dp[1]) {
					this._p[i].at = dp
				}
				if (this._p[i].category !== cat) {
					this._p[i].category = cat
				}
			} else {
				this._p[i] = new DataPoint(this._r, dp, cat)
			}
			this._p[i].title = this.data._categorical_output
				? this.data._output_category_names[this.data.y[i] - 1]
				: this.data.y[i]
			this._p[i].radius = radius
		}
		for (let i = n; i < this._p.length; i++) {
			this._p[i].remove()
		}
		this._p.length = n
	}

	predict(step) {
		if (!Array.isArray(step)) {
			step = [step, step]
		}
		const domain = this.data.domain
		const range = [this.width, this.height]
		const tiles = []
		if (this.data.dimension <= 2) {
			for (let i = 0; i < range[0] + step[0]; i += step[0]) {
				const w = scale(i - this.padding[0], 0, range[0] - this.padding[0] * 2, domain[0][0], domain[0][1])
				if (this.data.dimension === 1) {
					tiles.push([w])
				} else {
					for (let j = 0; j < range[1] - step[1] / 100; j += step[1]) {
						const h = scale(
							j - this.padding[1],
							0,
							range[1] - this.padding[1] * 2,
							domain[1][0],
							domain[1][1]
						)
						tiles.push([w, h])
					}
				}
			}
		} else {
			for (let i = 0; i < this.data.x.length; i++) {
				tiles.push(this.data.x[i].concat())
			}
		}
		const task = this.setting.vue.mlTask
		const plot = (pred, r) => {
			r.selectAll('*').remove()
			let smooth = pred.some(v => !Number.isInteger(v))
			if (this.data.dimension === 1) {
				const p = []
				if (task === 'IN' || (smooth && task !== 'DE')) {
					const [ymin, ymax] = this.data.range
					for (let i = 0; i < pred.length; i++) {
						p.push([
							scale(tiles[i], domain[0][0], domain[0][1], 0, range[0] - this.padding[0] * 2) +
								this.padding[0],
							scale(pred[i], ymin, ymax, 0, range[1] - this.padding[1] * 2) + this.padding[1],
						])
					}

					const line = d3
						.line()
						.x(d => d[0])
						.y(d => d[1])
					r.append('path').attr('stroke', 'red').attr('fill-opacity', 0).attr('d', line(p))
				} else {
					p.push([], [])
					for (let i = 0, w = 0; w < range[0] + step[0]; i++, w += step[0]) {
						p[0][i] = pred[i]
						p[1][i] = pred[i]
					}

					const t = r.append('g')
					new DataHulls(t, p, [step[0], 1000], smooth)
				}
			} else if (this.data.dimension === 2) {
				let c = 0
				const p = []
				for (let i = 0, w = 0; w < range[0] + step[0]; i++, w += step[0]) {
					for (let j = 0, h = 0; h < range[1] - step[1] / 100; j++, h += step[1]) {
						if (!p[j]) p[j] = []
						p[j][i] = pred[c++]
					}
				}
				if (!smooth && pred.length > 100) {
					smooth |= new Set(pred).size > 100
				}

				const t = r.append('g')
				new DataHulls(t, p, step, smooth || task === 'DE')
			} else {
				const t = r.append('g')
				const name = pred.every(Number.isInteger)
				for (let i = 0; i < pred.length; i++) {
					const o = new DataCircle(t, this._p[i])
					o.color = getCategoryColor(pred[i])
					if (name && this.data._categorical_output) {
						this._p[i].title = `true: ${this.data._output_category_names[this.data.y[i] - 1]}\npred: ${
							this.data._output_category_names[pred[i] - 1]
						}`
					} else {
						this._p[i].title = `true: ${this.data.y[i]}\npred: ${pred[i]}`
					}
				}
				this._observe_target = r
			}
		}
		return [tiles, plot]
	}

	terminate() {
		this._p.forEach(p => p.remove())
		this._observer.disconnect()
		this._will_render = false
	}
}

export class BasePlatform {
	constructor(task, manager) {
		this._manager = manager
		this._task = task

		this._renderer = new DataRenderer(manager)
	}

	get task() {
		return this._task
	}

	get setting() {
		return this._manager.setting
	}

	get svg() {
		return this._manager.setting.svg
	}

	get width() {
		if (!this._width) {
			this._width = d3.select('#plot-area svg').node().getBoundingClientRect().width
		}
		return this._width
	}

	set width(value) {
		d3.select('#plot-area').style('width', value - 2 + 'px')
		this._width = null
	}

	get height() {
		if (!this._height) {
			this._height = d3.select('#plot-area svg').node().getBoundingClientRect().height
		}
		return this._height
	}

	set height(value) {
		d3.select('#plot-area').style('height', value - 2 + 'px')
		this._height = null
	}

	get datas() {
		return this._manager._datas
	}

	get params() {
		return {}
	}

	set params(params) {}

	init() {}

	terminate() {
		this._renderer.terminate()
	}
}

export class DefaultPlatform extends BasePlatform {
	constructor(task, manager) {
		super(task, manager)

		const elm = this.setting.task.configElement
		if (this._task === 'DR' || this._task === 'FS') {
			elm.append('span').text('Target dimension')
			elm.append('input')
				.attr('type', 'number')
				.attr('min', 1)
				.attr('max', 2)
				.attr('value', 2)
				.attr('name', 'dimension')
		}
	}

	get dimension() {
		const elm = this.setting.task.configElement
		const dim = elm.select('[name=dimension]')
		return dim.node() ? +dim.property('value') : null
	}

	fit(fit_cb) {
		if (this._cur_dimension !== this.setting.dimension) {
			this.init()
		}
		return FittingMode[this._task](this._r_task, this.datas, fit_cb)
	}

	predict(cb, step = 10) {
		const [tiles, plot] = this._renderer.predict(step)
		if (this._task === 'CF' || this._task === 'RG') {
			tiles.push(...this.datas.x)
		}
		cb(tiles, pred => {
			if (this._task === 'AD') {
				pred = pred.map(v => (v ? specialCategory.error : specialCategory.errorRate(0)))
			}
			if (this._task === 'CF' || this._task === 'RG') {
				const p = pred.slice(tiles.length - this.datas.length)
				const t = this.datas.y
				pred = pred.slice(0, tiles.length - this.datas.length)
				if (this._task === 'CF') {
					let acc = 0
					for (let i = 0; i < t.length; i++) {
						if (t[i] === p[i]) {
							acc++
						}
					}
					this.setting.footer.text('Accuracy:' + acc / t.length)
				} else if (this._task === 'RG') {
					let rmse = 0
					for (let i = 0; i < t.length; i++) {
						rmse += (t[i] - p[i]) ** 2
					}
					this.setting.footer.text('RMSE:' + Math.sqrt(rmse / t.length))
				}
			}
			plot(pred, this._r_tile)
		})
	}

	evaluate(cb) {
		if (this._task !== 'CF' && this._task !== 'RG') {
			return
		}
		cb(this.datas.x, p => {
			const t = this.datas.y
			if (this._task === 'CF') {
				let acc = 0
				for (let i = 0; i < t.length; i++) {
					if (t[i] === p[i]) {
						acc++
					}
				}
				this.setting.footer.text('Accuracy:' + acc / t.length)
			} else if (this._task === 'RG') {
				let rmse = 0
				for (let i = 0; i < t.length; i++) {
					rmse += (t[i] - p[i]) ** 2
				}
				this.setting.footer.text('RMSE:' + Math.sqrt(rmse / t.length))
			}
		})
	}

	init() {
		this._r && this._r.remove()
		this._cur_dimension = this.setting.dimension
		const renderFront = this.datas?.dimension === 1 && (this._task === 'RG' || this._task === 'IN')
		if (renderFront) {
			this._r = this.svg.append('g')
		} else {
			this._r = this.svg.insert('g', ':first-child')
		}
		this._r.classed('default-render', true)
		this._r_task = this._r.append('g').classed('tasked-render', true)
		this._r_tile = this._r
			.append('g')
			.classed('tile-render', true)
			.attr('opacity', renderFront ? 1 : 0.5)
		this.setting.footer.text('')
		this.svg.select('g.centroids').remove()
		this.render()
	}

	render() {
		this._renderer.render()
	}

	centroids(center, cls, { line = false, duration = 0 } = {}) {
		let centroidSvg = this.svg.select('g.centroids')
		if (centroidSvg.size() === 0) {
			centroidSvg = this.svg.append('g').classed('centroids', true)
			centroidSvg.append('g').classed('c-line', true)
			this._centroids_line = []
			this._centroids = null
		}
		const existCentroids = []
		if (this._centroids) {
			this._centroids.forEach(c => {
				if (Array.isArray(cls) && cls.indexOf(c.category) < 0) {
					c.remove()
				} else {
					existCentroids.push(c)
				}
			})
		}
		const p = this._renderer.points
		for (let k = 0; k < p.length; k++) {
			if (this._centroids_line[k]?._from !== p[k] || !line) {
				this._centroids_line[k]?.remove()
				this._centroids_line[k] = null
			}
		}
		this._centroids = center.map((c, i) => {
			let dp = Array.isArray(cls) ? existCentroids.find(e => e.category === cls[i]) : existCentroids[i]
			if (!dp) {
				dp = new DataPoint(
					centroidSvg,
					c.map(v => v / this.datas.scale),
					Array.isArray(cls) ? cls[i] : cls
				)
				dp.plotter(DataPointStarPlotter)
			}
			if (line) {
				const p = this._renderer.points
				const y = this.datas.y
				for (let k = 0; k < p.length; k++) {
					if (y[k] === cls[i]) {
						if (!this._centroids_line[k]) {
							this._centroids_line[k] = new DataLine(centroidSvg.select('.c-line'), p[k], dp)
						} else {
							this._centroids_line[k].to = dp
						}
					}
				}
			}
			return dp
		})
		Promise.resolve().then(() => {
			this._centroids.forEach((c, i) => {
				c.move(
					center[i].map(v => v / this.datas.scale),
					duration
				)
			})
		})
	}

	terminate() {
		this._r && this._r.remove()
		this.svg.select('g.centroids').remove()
		this.svg.selectAll('g').style('visibility', null)
		const elm = this.setting.task.configElement
		elm.selectAll('*').remove()
		this.setting.footer.text('')
		super.terminate()
	}
}
