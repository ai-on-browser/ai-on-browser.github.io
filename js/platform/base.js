import ScatterRenderer from '../renderer/scatter.js'

import { DataPointStarPlotter, specialCategory, DataPoint, DataLine } from '../utils.js'
import TableRenderer from '../renderer/table.js'

export class BasePlatform {
	constructor(task, manager) {
		this._manager = manager

		this._renderer = new ScatterRenderer(manager)
	}

	get task() {
		return this._manager.task
	}

	get setting() {
		return this._manager.setting
	}

	get svg() {
		return this._renderer.svg
	}

	get width() {
		return this._renderer.width
	}

	set width(value) {
		this._renderer.width = value
	}

	get height() {
		return this._renderer.height
	}

	set height(value) {
		this._renderer.height = value
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
		this._tablerenderer = new TableRenderer(manager)

		const elm = this.setting.task.configElement
		if (this.task === 'DR' || this.task === 'FS') {
			elm.appendChild(document.createTextNode('Target dimension'))
			const dim = document.createElement('input')
			dim.type = 'number'
			dim.min = 1
			dim.max = 2
			dim.value = 2
			dim.name = 'dimension'
			elm.appendChild(dim)
		}
	}

	get dimension() {
		const elm = this.setting.task.configElement
		const dim = elm.querySelector('[name=dimension]')
		return dim ? +dim.value : null
	}

	get trainInput() {
		return this.datas.dimension > 0 ? this.datas.x : this.datas.index.map((v, i) => [isNaN(v) ? i : v])
	}

	get trainOutput() {
		return this.datas.y.map(p => [p])
	}

	set trainResult(value) {
		if (this.task === 'CT') {
			value.forEach((v, i) => {
				this.datas.y[i] = v
			})
			this.render()
		} else if (this.task === 'AD') {
			this._renderer.trainResult = value
			this._tablerenderer.trainResult = value
		} else if (this.task === 'DR' || this.task === 'FS' || this.task === 'TF' || this.task === 'GR') {
			this._renderer.trainResult = value
		} else {
			throw new Error(`Invalid task ${this.task}`)
		}
	}

	testInput(step = 10) {
		const tiles = this._renderer.testData(step)
		if (this.task === 'CF' || this.task === 'RG') {
			tiles.push(
				...(this.datas.dimension > 0 ? this.datas.x : this.datas.index.map((v, i) => [isNaN(v) ? i : v]))
			)
		}
		return tiles
	}

	testResult(pred) {
		if (this.task === 'AD') {
			pred = pred.map(v => (v ? specialCategory.error : specialCategory.errorRate(0)))
		}
		if (this.task === 'CF' || this.task === 'RG') {
			const p = pred.slice(pred.length - this.datas.length)
			const t = this.datas.y
			pred = pred.slice(0, pred.length - this.datas.length)
			if (this.task === 'CF') {
				let acc = 0
				for (let i = 0; i < t.length; i++) {
					if (t[i] === p[i]) {
						acc++
					}
				}
				this._getEvaluateElm().innerText = 'Accuracy:' + acc / t.length
			} else if (this.task === 'RG') {
				let rmse = 0
				for (let i = 0; i < t.length; i++) {
					rmse += (t[i] - p[i]) ** 2
				}
				this._getEvaluateElm().innerText = 'RMSE:' + Math.sqrt(rmse / t.length)
			}
			this._tablerenderer.trainResult = p
		}
		this._renderer.testResult(pred)
	}

	evaluate(cb) {
		if (this.task !== 'CF' && this.task !== 'RG') {
			return
		}
		cb(this.datas.x, p => {
			const t = this.datas.y
			if (this.task === 'CF') {
				let acc = 0
				for (let i = 0; i < t.length; i++) {
					if (t[i] === p[i]) {
						acc++
					}
				}
				this._getEvaluateElm().innerText = 'Accuracy:' + acc / t.length
			} else if (this.task === 'RG') {
				let rmse = 0
				for (let i = 0; i < t.length; i++) {
					rmse += (t[i] - p[i]) ** 2
				}
				this._getEvaluateElm().innerText = 'RMSE:' + Math.sqrt(rmse / t.length)
			}
		})
	}

	init() {
		this._cur_dimension = this.setting.dimension
		this.setting.footer.innerText = ''
		this.svg.select('g.centroids').remove()
		this._renderer.init()
		this._tablerenderer.init()
		this.render()
		if (this._loss) {
			this._loss.terminate()
			this._loss = null
			this.setting.footer.replaceChildren()
		}
	}

	render() {
		this._renderer.render()
		this._tablerenderer.render()
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
			const txt = this.setting.footer.querySelector('div.evaluate_result')
			if (!txt) {
				const eres = document.createElement('div')
				eres.classList.add('evaluate_result')
				this.setting.footer.insertBefore(eres, this.setting.footer.firstChild)
				return eres
			}
			return txt
		}
		return this.setting.footer
	}

	plotLoss(value) {
		if (!this._loss) {
			const orgText = this.setting.footer.innerText
			this.setting.footer.innerText = ''
			this._loss = new LossPlotter(this, this.setting.footer)
			this._getEvaluateElm().innerText = orgText
		}
		this._loss.add(value)
	}

	terminate() {
		this.setting.task.configElement.replaceChildren()
		this.setting.footer.innerText = ''
		super.terminate()
		this._tablerenderer.terminate()
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
		this._root = document.createElement('span')
		r.appendChild(this._root)
		this._caption = document.createElement('div')
		this._caption.innerText = 'loss'
		this._root.appendChild(this._caption)

		const cont = document.createElement('span')
		cont.style.display = 'inline-flex'
		cont.style.alignItems = 'flex-start'
		this._root.appendChild(cont)

		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		svg.setAttribute('width', 200)
		svg.setAttribute('height', 50)
		cont.appendChild(svg)

		cont.appendChild(document.createTextNode('scale:'))
		this._scale = document.createElement('select')
		for (const name of ['linear', 'log']) {
			const opt = document.createElement('option')
			opt.value = name
			opt.innerText = name
			this._scale.appendChild(opt)
		}
		this._scale.onchange = () => this.plotRewards()
		cont.appendChild(this._scale)

		this._stats = document.createElement('span')
		this._stats.style.display = 'inline-flex'
		this._stats.style.flexDirection = 'column'
		this._stats.style.fontSize = '80%'
		cont.appendChild(this._stats)
		for (const k of ['max', 'ave', 'min']) {
			const txt = document.createElement('span')
			txt.classList.add(k + 'txt')
			this._stats.append(txt)
		}

		this._plot_count = 10000
		this._print_count = 10
		this._plot_smooth_window = 20

		this._history = []
	}

	set name(value) {
		this._caption.innerText = value
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
		const svg = this._root.querySelector('svg')
		const width = svg.width.baseVal.value
		const height = svg.height.baseVal.value
		let path = null
		let sm_path = null
		const mintxt = this._stats.querySelector('.mintxt')
		const maxtxt = this._stats.querySelector('.maxtxt')
		const avetxt = this._stats.querySelector('.avetxt')
		if (svg.childNodes.length === 0) {
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
			path.setAttribute('name', 'value')
			path.setAttribute('stroke', 'black')
			path.setAttribute('fill-opacity', 0)
			svg.appendChild(path)
			sm_path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
			sm_path.setAttribute('name', 'smooth')
			sm_path.setAttribute('stroke', 'green')
			sm_path.setAttribute('fill-opacity', 0)
			svg.appendChild(sm_path)
		} else {
			path = svg.querySelector('path[name=value]')
			sm_path = svg.querySelector('path[name=smooth]')
		}

		const lastHistory = this.lastHistory(this._plot_count)
		if (lastHistory.length === 0) {
			svg.style.display = 'none'
			path.removeAttribute('d')
			sm_path.removeAttribute('d')
			return
		} else {
			svg.style.display = null
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

		mintxt.innerText = `Min: ${fmtNum(minr)}`
		maxtxt.innerText = `Max: ${fmtNum(maxr)}`
		if (maxr === minr) return

		const pp = (i, v) => {
			if (this._scale.value === 'log') {
				return [
					(width * i) / (lastHistory.length - 1),
					(1 - (Math.log(v) - Math.log(minr)) / (Math.log(maxr) - Math.log(minr))) * height,
				]
			}
			return [(width * i) / (lastHistory.length - 1), (1 - (v - minr) / (maxr - minr)) * height]
		}

		const p = lastHistory.map((v, i) => pp(i, v))
		const line = p => {
			let s = ''
			for (let i = 0; i < p.length; i++) {
				s += `${i === 0 ? 'M' : 'L'}${p[i][0]},${p[i][1]}`
			}
			return s
		}
		path.setAttribute('d', line(p))

		const smp = []
		for (let i = 0; i < lastHistory.length - this._plot_smooth_window; i++) {
			let s = 0
			for (let k = 0; k < this._plot_smooth_window; k++) {
				s += lastHistory[i + k]
			}
			smp.push([i + this._plot_smooth_window, s / this._plot_smooth_window])
		}
		if (smp.length > 0) {
			sm_path.setAttribute('d', line(smp.map(p => pp(...p))))
			avetxt.innerText = `Mean(${this._plot_smooth_window}): ${fmtNum(smp[smp.length - 1]?.[1])}`
		}
	}
}
