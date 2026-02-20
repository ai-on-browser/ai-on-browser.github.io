import ScatterRenderer from '../renderer/scatter.js'
import TableRenderer from '../renderer/table.js'
import CentroidPlotter from '../renderer/util/centroids.js'
import LinePlotter from '../renderer/util/lineplot.js'

export class BasePlatform {
	constructor(manager) {
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
	constructor(manager) {
		super(manager)
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
		let x = this.datas.dimension > 0 ? this.datas.x : this.datas.index.map((v, i) => [Number.isNaN(+v) ? i : v])
		for (const preprocess of this._manager.preprocesses) {
			x = preprocess.apply(x, { dofit: true })
		}
		return x
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
			this._renderer.forEach(rend => {
				rend.trainResult = value
			})
		} else {
			throw new Error(`Invalid task ${this.task}`)
		}
	}

	testInput(step = 10) {
		let tiles = this._renderer[0].testData(step)
		if (this.task === 'CF' || this.task === 'RG' || this.task === 'RL') {
			tiles.push(
				...(this.datas.dimension > 0
					? this.datas.x
					: this.datas.index.map((v, i) => [Number.isNaN(+v) ? i : v]))
			)
		}
		for (const preprocess of this._manager.preprocesses) {
			tiles = preprocess.apply(tiles, { dofit: false })
		}
		return tiles
	}

	testResult(pred) {
		if (this.task === 'CF' || this.task === 'RG' || this.task === 'RL') {
			const p = pred.slice(pred.length - this.datas.length)
			const t = this.datas.y
			pred = pred.slice(0, pred.length - this.datas.length)
			if (this.task === 'CF' || this.task === 'RL') {
				let acc = 0
				for (let i = 0; i < t.length; i++) {
					if (t[i] === p[i]) {
						acc++
					}
				}
				this._getEvaluateElm().innerText = `Accuracy:${acc / t.length}`
			} else if (this.task === 'RG') {
				let rmse = 0
				for (let i = 0; i < t.length; i++) {
					rmse += (t[i] - p[i]) ** 2
				}
				this._getEvaluateElm().innerText = `RMSE:${Math.sqrt(rmse / t.length)}`
			}
			this._renderer.forEach(rend => {
				rend.trainResult = p
			})
		}
		this._renderer[0].testResult(pred)
	}

	init() {
		this._cur_dimension = this.setting.dimension
		this.setting.footer.innerText = ''
		if (this._centroids) {
			this._centroids.terminate()
			this._centroids = null
		}
		this._renderer.forEach(rend => rend.init())
		this.render()
		if (this._loss) {
			this._loss.terminate()
			this._loss = null
			this.setting.footer.replaceChildren()
		}
	}

	invertScale(x) {
		for (const preprocess of this._manager.preprocesses) {
			if (preprocess.inverse) {
				if (Array.isArray(x[0])) {
					x = preprocess.inverse(x)
				} else {
					x = preprocess.inverse([x])[0]
				}
			}
		}
		return x
	}

	centroids(center, cls, { line = false, duration = 0 } = {}) {
		if (!this._centroids) {
			this._centroids = new CentroidPlotter(this._renderer[0])
		}
		center = this.invertScale(center)
		this._centroids.set(center, cls, { line, duration })
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
