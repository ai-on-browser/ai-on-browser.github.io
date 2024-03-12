import { BasePlatform } from './base.js'
import TableRenderer from '../renderer/table.js'

export default class RecommendPlatform extends BasePlatform {
	constructor(manager) {
		super(manager)
		this._renderer.push(new TableRenderer(manager))
		this.setting.render.selectItem('table')
	}

	get trainInput() {
		let x = this.datas.originalX.map(r => {
			return r.filter(v => v !== null)
		})
		for (const preprocess of this._manager.preprocesses) {
			x = preprocess.apply(x, { dofit: true })
		}
		return x
	}

	set trainResult(value) {
		this._pred = value
	}

	testInput() {
		let x = this.datas.x
		for (const preprocess of this._manager.preprocesses) {
			x = preprocess.apply(x, { dofit: false })
		}
		return x
	}

	testResult(value) {
		this._pred = value
	}

	init() {
		this._renderer.forEach(rend => rend.init())
		this.render()
	}

	terminate() {
		this.setting.task.configElement.replaceChildren()
		this.setting.footer.innerText = ''
		super.terminate()
	}
}
