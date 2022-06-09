import BaseRenderer from './base.js'

const LoadedRLRenderClass = {}

export default class RLRenderer extends BaseRenderer {
	constructor(manager) {
		super(manager)

		this._size = [960, 500]
		const r = this.setting.render.addItem('rl')

		this._svg = d3
			.select(r)
			.append('svg')
			.style('border', '1px solid #000000')
			.attr('width', `${this._size[0]}px`)
			.attr('height', `${this._size[1]}px`)

		this._subrender = null
	}

	get svg() {
		return this._svg
	}

	get platform() {
		return this._manager.platform
	}

	get width() {
		return this._size[0]
	}

	set width(value) {
		this._size[0] = value
		this._svg.attr('width', `${value}px`)
	}

	get height() {
		return this._size[1]
	}

	set height(value) {
		this._size[1] = value
		this._svg.attr('height', `${value}px`)
	}

	get env() {
		return this._manager.platform.env
	}

	async init() {
		const type = this._manager.platform.type
		this._svg.selectAll('*').remove()
		this._subrender?.close?.()
		this._subrender = null
		if (LoadedRLRenderClass[type] === true) {
			return
		}
		if (LoadedRLRenderClass[type]) {
			this._subrender = new LoadedRLRenderClass[type](this)
			this._subrender.init(this._svg)
		} else if (type !== '') {
			LoadedRLRenderClass[type] = true
			return import(`./rl/${type}.js`).then(m => {
				LoadedRLRenderClass[type] = m.default
				if (this._manager.platform.type !== type) {
					return
				}
				this._subrender = new m.default(this)
				this._subrender.init(this._svg)
			})
		}
	}

	render(...args) {
		this._subrender?.render(this._svg, ...args)
	}

	terminate() {
		this._subrender?.close?.()
		this.setting.render.removeItem('rl')
		super.terminate()
	}
}
