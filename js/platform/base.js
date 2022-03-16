import FittingMode from '../fitting.js'
import ScatterRenderer from '../renderer/scatter.js'

export class BasePlatform {
	constructor(task, manager) {
		this._manager = manager
		this._task = task

		this._renderer = new ScatterRenderer(manager)
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
		this._renderer.init()
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
