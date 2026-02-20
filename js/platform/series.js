import LineRenderer from '../renderer/line.js'
import LinePlotter from '../renderer/util/lineplot.js'
import { BasePlatform } from './base.js'

export default class SeriesPlatform extends BasePlatform {
	constructor(manager) {
		super(manager)
		this._renderer.forEach(rend => rend.terminate())
		this._renderer = [new LineRenderer(manager)]
	}

	get trainInput() {
		let x = this.datas.dimension > 0 ? this.datas.x : this.datas.y.map(v => [v])
		for (const preprocess of this._manager.preprocesses) {
			x = preprocess.apply(x, { dofit: true })
		}
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
		this._renderer.forEach(rend => rend.testResult(value))
		this.render()
	}

	set threshold(value) {
		this._renderer.forEach(rend => rend.updateThreshold(value))
	}

	init() {
		if (this._loss) {
			this._loss.terminate()
			this._loss = null
		}

		this._renderer.forEach(rend => rend.init())
		if (this.datas) {
			this.datas.clip = false
			this._renderer.forEach(rend => {
				rend._pred_count = 0
			})
			this.render()
		}
	}

	render() {
		if (this.datas) {
			this._renderer.forEach(rend => rend.render())
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

	resetPredicts() {
		this._renderer.forEach(rend => rend.resetPredicts())
	}

	plotLoss(value) {
		if (!this._loss) {
			this._loss = new LinePlotter(this.setting.footer)
		}
		this._loss.add(value)
	}

	terminate() {
		if (this.datas) {
			this.datas.clip = true
		}
		if (this._loss) {
			this._loss.terminate()
		}
		super.terminate()
	}
}
