import { BasePlatform } from './base.js'
import TableRenderer from '../renderer/table.js'

export default class RecommendPlatform extends BasePlatform {
	constructor(task, manager) {
		super(task, manager)
		this._renderer.terminate()
		this._renderer = new TableRenderer(manager)
	}

	init() {
		this._renderer.init()
		this.render()
	}

	render() {
		this._renderer.render()
	}

	fit(fit_cb) {
		const x = this.datas.x.map(r => {
			return r
				.map((v, j) => (this.datas._input_category_names[j] ? this.datas._input_category_names[j][v] : v))
				.filter(v => v !== null)
		})
		fit_cb(x, null, pred => {
			this._pred = pred
		})
	}

	predict(pred_cb) {
		const x = this.datas.x
		pred_cb(x, pred => {
			this._pred = pred
		})
	}

	terminate() {
		const elm = this.setting.task.configElement
		elm.selectAll('*').remove()
		this.setting.footer.text('')
		super.terminate()
	}
}
