import ScatterRenderer from '../renderer/scatter.js'
import LinePlotter from '../renderer/util/lineplot.js'

import { DataPointStarPlotter, DataPoint, DataLine } from '../utils.js'
import TableRenderer from '../renderer/table.js'

export class BasePlatform {
	constructor(task, manager) {
		this._manager = manager

		this._renderer = [new ScatterRenderer(manager)]
	}

	get task() {
		return this._manager.task
	}

	get setting() {
		return this._manager.setting
	}

	get svg() {
		return this._renderer[0].svg
	}

	get width() {
		return this._renderer[0].width
	}

	set width(value) {
		this._renderer[0].width = value
	}

	get height() {
		return this._renderer[0].height
	}

	set height(value) {
		this._renderer[0].height = value
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

	render() {
		this._renderer.forEach(rend => rend.render())
	}

	terminate() {
		this._renderer.forEach(rend => rend.terminate())
	}
}

export class DefaultPlatform extends BasePlatform {
	constructor(task, manager) {
		super(task, manager)
		this._renderer.push(new TableRenderer(manager))

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
		} else if (
			this.task === 'AD' ||
			this.task === 'DR' ||
			this.task === 'FS' ||
			this.task === 'TF' ||
			this.task === 'GR'
		) {
			this._renderer.forEach(rend => (rend.trainResult = value))
		} else {
			throw new Error(`Invalid task ${this.task}`)
		}
	}

	testInput(step = 10) {
		const tiles = this._renderer[0].testData(step)
		if (this.task === 'CF' || this.task === 'RG') {
			tiles.push(
				...(this.datas.dimension > 0 ? this.datas.x : this.datas.index.map((v, i) => [isNaN(v) ? i : v]))
			)
		}
		return tiles
	}

	testResult(pred) {
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
			this._renderer.forEach(rend => (rend.trainResult = p))
		}
		this._renderer[0].testResult(pred)
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
		this.svg.querySelector('g.centroids')?.remove()
		this._renderer.forEach(rend => rend.init())
		this.render()
		if (this._loss) {
			this._loss.terminate()
			this._loss = null
			this.setting.footer.replaceChildren()
		}
	}

	centroids(center, cls, { line = false, duration = 0 } = {}) {
		let centroidSvg = this.svg.querySelector('g.centroids')
		if (!centroidSvg) {
			centroidSvg = document.createElementNS('http://www.w3.org/2000/svg', 'g')
			centroidSvg.classList.add('centroids')
			this.svg.appendChild(centroidSvg)
			const cline = document.createElementNS('http://www.w3.org/2000/svg', 'g')
			cline.classList.add('c-line')
			centroidSvg.appendChild(cline)
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
		const p = this._renderer[0].points
		for (let k = 0; k < p.length; k++) {
			if (this._centroids_line[k]?._from !== p[k] || !line) {
				this._centroids_line[k]?.remove()
				this._centroids_line[k] = null
			}
		}
		this._centroids = center.map((c, i) => {
			let dp = Array.isArray(cls) ? existCentroids.find(e => e.category === cls[i]) : existCentroids[i]
			if (!dp) {
				dp = new DataPoint(centroidSvg, this._renderer[0].toPoint(c), Array.isArray(cls) ? cls[i] : cls)
				dp.plotter(DataPointStarPlotter)
			}
			if (line) {
				const p = this._renderer[0].points
				const y = this.datas.y
				for (let k = 0; k < p.length; k++) {
					if (y[k] === cls[i]) {
						if (!this._centroids_line[k]) {
							this._centroids_line[k] = new DataLine(centroidSvg.querySelector('.c-line'), p[k], dp)
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
				c.move(this._renderer[0].toPoint(center[i]), duration)
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
			this._loss = new LinePlotter(this.setting.footer)
			this._getEvaluateElm().innerText = orgText
		}
		this._loss.add(value)
	}

	terminate() {
		this.setting.task.configElement.replaceChildren()
		this.setting.footer.innerText = ''
		super.terminate()
	}
}
