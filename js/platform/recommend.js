import { BasePlatform } from './base.js'
import TableRenderer from '../renderer/table.js'

export default class RecommendPlatform extends BasePlatform {
	constructor(task, manager) {
		super(task, manager)
		this._renderer.push(new TableRenderer(manager))
		this.setting.render.selectItem('table')
	}

	get trainInput() {
		const x = this.datas.originalX.map(r => {
			return r.filter(v => v !== null)
		})
		return x
	}

	set trainResult(value) {
		this._pred = value
	}

	testInput() {
		return this.datas.x
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
