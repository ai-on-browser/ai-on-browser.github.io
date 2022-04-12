import ScatterRenderer from '../renderer/scatter.js'

import Matrix from '../../lib/util/matrix.js'

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

	get trainInput() {
		return null
	}

	get trainOutput() {
		return null
	}

	testInput() {
		return null
	}

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

	get trainInput() {
		return this.datas.dimension > 0 ? this.datas.x : this.datas.index.map(v => [v])
	}

	get trainOutput() {
		return this.datas.y.map(p => [p])
	}

	set trainResult(value) {
		if (this._task === 'CT') {
			value.forEach((v, i) => {
				this.datas.at(i).y = v
			})
		} else if (this._task === 'AD') {
			if (this._r_task.select('.tile').size() === 0) {
				this._r_task.insert('g').classed('tile', true).classed('anormal_point', true)
			}
			this._r_task.selectAll('.tile *').remove()
			const mapping = this._r_task.select('.anormal_point')

			value.forEach((v, i) => {
				if (v) {
					const o = new DataCircle(mapping, this.datas.points[i])
					o.color = getCategoryColor(specialCategory.error)
				}
			})
		} else if (this._task === 'DR' || this._task === 'FS' || this._task === 'TF') {
			if (this._r_task.select('.tile').size() === 0) {
				this._r_task.insert('g', ':first-child').classed('tile', true).attr('opacity', 0.5)
			}
			const mapping = this._r_task.select('.tile')

			mapping.selectAll('*').remove()

			const d = value[0].length
			let y = value
			if (d === 1) {
				y = y.map(v => [v, 0])
			}
			let y_max = []
			let y_min = []
			for (let i = 0; i < y[0].length; i++) {
				const ym = y.map(v => v[i])
				y_max.push(Math.max(...ym))
				y_min.push(Math.min(...ym))
			}

			const ranges = this.datas.dimension <= 1 ? [this.height, this.height] : [this.width, this.height]

			const scales = ranges.map((m, i) => (m - 10) / (y_max[i] - y_min[i]))
			let scale_min = Math.min(...scales)
			const offsets = [5, 5]
			for (let i = 0; i < scales.length; i++) {
				if (!isFinite(scale_min) || scales[i] > scale_min) {
					if (!isFinite(scales[i])) {
						offsets[i] = ranges[i] / 2 - y_min[i]
					} else {
						offsets[i] += ((scales[i] - scale_min) * (y_max[i] - y_min[i])) / 2
					}
				}
			}
			if (!isFinite(scale_min)) {
				scale_min = 0
			}

			let min_cost = Infinity
			let min_cost_y = null
			const p = Matrix.fromArray(this.datas.points.map(p => p.at))
			for (let i = 0; i < (this.datas.dimension <= 1 ? 1 : 2 ** d); i++) {
				const rev = i
					.toString(2)
					.padStart(d, '0')
					.split('')
					.map(v => !!+v)

				const ry = y.map(v => {
					return v.map((a, k) => ((rev[k] ? y_max[k] - a + y_min[k] : a) - y_min[k]) * scale_min + offsets[k])
				})
				const y_mat = Matrix.fromArray(ry)
				y_mat.sub(p)
				const cost = y_mat.norm()
				if (cost < min_cost) {
					min_cost = cost
					min_cost_y = ry
				}
			}

			min_cost_y.forEach((v, i) => {
				const p = new DataPoint(
					mapping,
					this.datas.dimension <= 1 ? [this.datas.points[i].at[0], v[0]] : v,
					this.datas.points[i].category
				)
				p.radius = 2
				const dl = new DataLine(mapping, this.datas.points[i], p)
				dl.setRemoveListener(() => p.remove())
			})
		} else if (this._task === 'GR') {
			if (this._r_task.select('.tile').size() === 0) {
				this._r_task
					.insert('g', ':first-child')
					.classed('tile', true)
					.classed('generated', true)
					.attr('opacity', 0.5)
			}
			const mapping = this._r_task.select('.tile.generated')

			mapping.selectAll('*').remove()
			let cond = null
			if (Array.isArray(value) && value.length === 2 && Array.isArray(value[0]) && Array.isArray(value[0][0])) {
				;[value, cond] = value
			}

			value.forEach((v, i) => {
				let p = new DataPoint(mapping, this._renderer.toPoint(v), cond ? cond[i][0] : 0)
				p.radius = 2
			})
		} else {
			throw new Error(`Invalid task ${this._task}`)
		}
	}

	testInput(step = 10) {
		const [tiles, plot] = this._renderer.predict(step)
		if (this._task === 'CF' || this._task === 'RG') {
			tiles.push(...(this.datas.dimension > 0 ? this.datas.x : this.datas.index.map(v => [v])))
		}
		this.__plot = plot
		return tiles
	}

	testResult(pred) {
		if (this._task === 'AD') {
			pred = pred.map(v => (v ? specialCategory.error : specialCategory.errorRate(0)))
		}
		if (this._task === 'CF' || this._task === 'RG') {
			const p = pred.slice(pred.length - this.datas.length)
			const t = this.datas.y
			pred = pred.slice(0, pred.length - this.datas.length)
			if (this._task === 'CF') {
				let acc = 0
				for (let i = 0; i < t.length; i++) {
					if (t[i] === p[i]) {
						acc++
					}
				}
				this._getEvaluateElm().text('Accuracy:' + acc / t.length)
			} else if (this._task === 'RG') {
				let rmse = 0
				for (let i = 0; i < t.length; i++) {
					rmse += (t[i] - p[i]) ** 2
				}
				this._getEvaluateElm().text('RMSE:' + Math.sqrt(rmse / t.length))
			}
		}
		this.__plot(pred, this._r_tile)
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
				this._getEvaluateElm().text('Accuracy:' + acc / t.length)
			} else if (this._task === 'RG') {
				let rmse = 0
				for (let i = 0; i < t.length; i++) {
					rmse += (t[i] - p[i]) ** 2
				}
				this._getEvaluateElm().text('RMSE:' + Math.sqrt(rmse / t.length))
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
		if (this._loss) {
			this._loss.terminate()
			this._loss = null
			this.setting.footer.selectAll('*').remove()
		}
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
				dp = new DataPoint(centroidSvg, this._renderer.toPoint(c), Array.isArray(cls) ? cls[i] : cls)
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
				c.move(this._renderer.toPoint(center[i]), duration)
			})
		})
	}

	_getEvaluateElm() {
		if (this._loss) {
			const txt = this.setting.footer.select('div.evaluate_result')
			if (txt.size() === 0) {
				return this.setting.footer.insert('div', ':first-child').classed('evaluate_result', true)
			}
			return txt
		}
		return this.setting.footer
	}

	plotLoss(value) {
		if (!this._loss) {
			const orgText = this.setting.footer.text()
			this.setting.footer.text('')
			this._loss = new LossPlotter(this, this.setting.footer)
			this._getEvaluateElm().text(orgText)
		}
		this._loss.add(value)
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

export class LossPlotter {
	constructor(platform, r) {
		this._platform = platform
		this._r = r

		this._item = null
	}

	add(value) {
		if (!this._item) {
			if (typeof value === 'object') {
				this._item = {}
				for (const key of Object.keys(value)) {
					this._item[key] = new LossPlotterItem(this._platform, this._r)
					this._item[key].name = key
				}
			} else {
				this._item = new LossPlotterItem(this._platform, this._r)
			}
		}
		if (typeof value === 'object') {
			for (const key of Object.keys(value)) {
				this._item[key].add(value[key])
			}
		} else {
			this._item.add(value)
		}
	}

	terminate() {
		if (this._item instanceof LossPlotterItem) {
			this._item.terminate()
		} else {
			for (const key of Object.keys(this._item)) {
				this._item[key].terminate()
			}
		}
	}
}

class LossPlotterItem {
	constructor(platform, r) {
		this._platform = platform
		this._root = r.append('span').style('display', 'inline-flex').style('flex-direction', 'column')
		this._caption = this._root.append('span').text('loss')
		this._r = this._root.append('span').style('white-space', 'nowrap')

		this._plot_count = 10000
		this._print_count = 10
		this._plot_smooth_window = 20

		this._history = []
	}

	set name(value) {
		this._caption.text(value)
	}

	add(value) {
		this._history.push(value)
		this.plotRewards()
	}

	terminate() {
		this._root.remove()
	}

	lastHistory(length = 0) {
		if (length <= 0) {
			return this._history
		}
		const historyLength = this._history.length
		return this._history.slice(Math.max(0, historyLength - length), historyLength)
	}

	plotRewards() {
		const width = 200
		const height = 50
		let svg = this._r.select('svg')
		let path = null
		let sm_path = null
		let mintxt = null
		let maxtxt = null
		let avetxt = null
		if (svg.size() === 0) {
			svg = this._r
				.append('svg')
				.attr('width', width + 200)
				.attr('height', height)
			path = svg.append('path').attr('name', 'value').attr('stroke', 'black').attr('fill-opacity', 0)
			sm_path = svg.append('path').attr('name', 'smooth').attr('stroke', 'green').attr('fill-opacity', 0)
			mintxt = svg
				.append('text')
				.classed('mintxt', true)
				.attr('x', width)
				.attr('y', height)
				.attr('fill', 'red')
				.attr('font-weight', 'bold')
			maxtxt = svg
				.append('text')
				.classed('maxtxt', true)
				.attr('x', width)
				.attr('y', 12)
				.attr('fill', 'red')
				.attr('font-weight', 'bold')
			avetxt = svg
				.append('text')
				.classed('avetxt', true)
				.attr('x', width)
				.attr('y', 24)
				.attr('fill', 'blue')
				.attr('font-weight', 'bold')
		} else {
			path = svg.select('path[name=value]')
			sm_path = svg.select('path[name=smooth]')
			mintxt = svg.select('text.mintxt')
			maxtxt = svg.select('text.maxtxt')
			avetxt = svg.select('text.avetxt')
		}

		const lastHistory = this.lastHistory(this._plot_count)
		if (lastHistory.length === 0) {
			svg.style('display', 'none')
			path.attr('d', null)
			sm_path.attr('d', null)
			return
		} else {
			svg.style('display', null)
		}
		const maxr = Math.max(...lastHistory)
		const minr = Math.min(...lastHistory)

		const fmtNum = f => {
			if (typeof f !== 'number') {
				return f
			}
			const scale = -Math.floor(Math.log10(Math.abs(f))) + 3
			return Math.round(f * 10 ** scale) / 10 ** scale
		}

		mintxt.text(`Min: ${fmtNum(minr)}`)
		maxtxt.text(`Max: ${fmtNum(maxr)}`)
		if (maxr === minr) return

		const pp = (i, v) => [(width * i) / (lastHistory.length - 1), (1 - (v - minr) / (maxr - minr)) * height]

		const p = lastHistory.map((v, i) => pp(i, v))
		const line = d3
			.line()
			.x(d => d[0])
			.y(d => d[1])
		path.attr('d', line(p))

		const smp = []
		for (let i = 0; i < lastHistory.length - this._plot_smooth_window; i++) {
			let s = 0
			for (let k = 0; k < this._plot_smooth_window; k++) {
				s += lastHistory[i + k]
			}
			smp.push([i + this._plot_smooth_window, s / this._plot_smooth_window])
		}
		sm_path.attr('d', line(smp.map(p => pp(...p))))
		avetxt.text(`Mean(${this._plot_smooth_window}): ${fmtNum(smp[smp.length - 1]?.[1])}`)
	}
}
