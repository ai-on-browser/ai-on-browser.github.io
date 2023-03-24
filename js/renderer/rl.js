import BaseRenderer from './base.js'

const LoadedRLRenderClass = {}

export default class RLRenderer extends BaseRenderer {
	constructor(manager) {
		super(manager)

		this._size = [960, 500]
		const r = this.setting.render.addItem('rl')

		this._root = document.createElement('div')
		this._root.style.border = '1px solid #000000'
		this._root.style.width = `${this._size[0]}px`
		this._root.style.height = `${this._size[1]}px`
		this._root.style.position = 'relative'
		r.appendChild(this._root)

		this._subrender = null
	}

	get svg() {
		return this._root
	}

	get platform() {
		return this._manager.platform
	}

	get width() {
		return this._size[0]
	}

	set width(value) {
		this._size[0] = value
		this._root.style.width = `${value}px`
	}

	get height() {
		return this._size[1]
	}

	set height(value) {
		this._size[1] = value
		this._root.style.height = `${value}px`
	}

	get env() {
		return this._manager.platform.env
	}

	async init() {
		const type = this._manager.platform.type
		this._root.replaceChildren()
		this._subrender?.close?.()
		this._subrender = null
		if (LoadedRLRenderClass[type] === true) {
			return
		}
		if (LoadedRLRenderClass[type]) {
			this._subrender = new LoadedRLRenderClass[type](this)
			this._subrender.init(this._root)
		} else if (type !== '') {
			LoadedRLRenderClass[type] = true
			return import(`./rl/${type}.js`).then(m => {
				LoadedRLRenderClass[type] = m.default
				if (this._manager.platform.type !== type) {
					return
				}
				this._subrender = new m.default(this)
				this._subrender.init(this._root)
			})
		}
	}

	render(...args) {
		this._subrender?.render(this._root, ...args)
	}

	terminate() {
		this._subrender?.close?.()
		this.setting.render.removeItem('rl')
		super.terminate()
	}
}
