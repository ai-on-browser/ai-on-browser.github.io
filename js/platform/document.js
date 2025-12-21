import DocumentScatterRenderer from '../renderer/document.js'
import LinePlotter from '../renderer/util/lineplot.js'
import { BasePlatform } from './base.js'

export default class DocumentPlatform extends BasePlatform {
	constructor(manager) {
		super(manager)
		this._renderer.forEach(rend => rend.terminate())
		this._renderer = [new DocumentScatterRenderer(manager)]
	}

	init() {
		this.render()
		if (this._loss) {
			this._loss.terminate()
			this._loss = null
		}
	}

	get trainInput() {
		let x = this.datas.x[0].map(v => v.toLowerCase())
		for (const preprocess of this._manager.preprocesses) {
			x = preprocess.apply(x, { dofit: true })
		}
		return x
	}

	set trainResult(value) {
		this._renderer.forEach(rend => (rend.trainResult = value))
	}

	testInput() {
		let x = this._renderer[0].testData()
		for (const preprocess of this._manager.preprocesses) {
			x = preprocess.apply(x, { dofit: false })
		}
		return x
	}

	testResult(value) {
		this._renderer[0].testResult(value)
	}

	plotLoss(value) {
		if (!this._loss) {
			this._loss = new LinePlotter(this.setting.footer)
		}
		this._loss.add(value)
	}

	terminate() {
		if (this._loss) {
			this._loss.terminate()
		}
		super.terminate()
	}
}
