export default class BaseRenderer {
	constructor(manager) {
		this._manager = manager
	}

	get setting() {
		return this._manager.setting
	}

	get datas() {
		return this._manager.datas
	}

	init() {}

	render() {
		if (!this._will_render) {
			this._will_render = true
			Promise.resolve().then(() => {
				if (this._will_render) {
					this._will_render = false
					this._render()
				}
			})
		}
	}

	_render() {}

	terminate() {
		this._will_render = false
	}
}
