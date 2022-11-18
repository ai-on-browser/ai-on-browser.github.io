import { BasePlatform } from './base.js'
import LinePlotter from '../renderer/util/lineplot.js'
import DocumentScatterRenderer from '../renderer/document.js'

export default class DocumentPlatform extends BasePlatform {
	constructor(task, manager) {
		super(task, manager)
		this._renderer.terminate()
		this._renderer = new DocumentScatterRenderer(manager)
	}

	init() {
		this.render()
		if (this._loss) {
			this._loss.terminate()
			this._loss = null
		}
	}

	get trainInput() {
		return this.datas.x[0].map(v => v.toLowerCase())
	}

	set trainResult(value) {
		this._renderer.trainResult = value
	}

	testInput() {
		return this._renderer.testData()
	}

	testResult(value) {
		this._renderer.testResult(value)
	}

	render() {
		this._renderer.render()
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
