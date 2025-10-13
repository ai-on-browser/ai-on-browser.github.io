import { EventEmitter } from '../../utils.js'

export default class IOSelector {
	constructor(r) {
		this._r = r.appendChild(document.createElement('div'))

		this._columns = []
		this._object = []
		this._target = -1

		this._objselector = null
		this._tarselector = null

		this._emitter = new EventEmitter()
	}

	get object() {
		return this._object
	}

	get objectNames() {
		return this._object.map(i => this._columns[i])
	}

	set object(obj) {
		this._object = obj.concat()
		if (this._objselector) {
			for (const opt of this._objselector.options) {
				opt.selected = false
			}
			for (let i = 0; i < obj.length; i++) {
				this._objselector.options.item(obj[i]).selected = true
			}
		}
	}

	get target() {
		return this._target
	}

	get targetName() {
		return this._columns[this._target]
	}

	set target(tar) {
		this._target = tar
		if (this._tarselector) {
			this._tarselector.options.item(tar + 1).selected = true
		}
	}

	set columns(columns) {
		this._columns = columns
		this._readySelector()
	}

	set onchange(cb) {
		this._emitter.on('change', cb)
	}

	_readySelector() {
		this._r.replaceChildren()
		if (this._columns.length > 1) {
			const islct = (this._objselector = document.createElement('select'))
			islct.multiple = true
			islct.onchange = () => {
				this._object = []
				let unslctval = ''
				let oreset = false
				for (const opt of islct.options) {
					if (opt.selected) {
						this._object.push(this._columns.indexOf(opt.value))
						if (opt.value === oslct.value) {
							oreset = true
						}
					} else if (!unslctval) {
						unslctval = opt.value
					}
				}
				if (oreset) {
					this._target = this._columns.indexOf(unslctval)
					oslct.value = unslctval
				}
				this._emitter.emit('change', {
					object: this._object,
					target: this._target,
				})
			}
			islct.size = Math.min(4, this._columns.length)
			if (this._columns.length <= 4) {
				islct.style.overflowY = 'hidden'
			}
			this._r.append('Input', islct)
			const oslct = (this._tarselector = document.createElement('select'))
			oslct.onchange = () => {
				let hasislct = false
				for (const opt of islct.selectedOptions) {
					if (opt.value === oslct.value) {
						opt.selected = false
						this._object = this._object.filter(i => this._columns[i] !== opt.value)
						hasislct = true
						break
					}
				}
				if (hasislct || (oslct.value === '' && this._target >= 0)) {
					for (const opt of islct.options) {
						if (opt.value === this._columns[this._target]) {
							opt.selected = true
							this._object.push(this._target)
						}
					}
				}
				this._target = this._columns.indexOf(oslct.value)
				this._emitter.emit('change', {
					object: this._object,
					target: this._target,
				})
			}
			this._r.append('Output', oslct)

			oslct.appendChild(document.createElement('option'))
			for (const column of this._columns) {
				const opt = document.createElement('option')
				opt.value = opt.innerText = column
				islct.appendChild(opt)
				oslct.appendChild(opt.cloneNode(true))
			}
			islct.size = Math.min(4, islct.options.length)
			for (let i = 0; i < this._columns.length - 1; i++) {
				islct.options[i].selected = this._object.includes(i)
			}
			oslct.value = this._columns[this._target]
		}
	}

	clear() {
		this._r.replaceChildren()
		this._columns = []
		this._object = []
		this._target = -1
	}

	terminate() {
		this._r.remove()
	}
}
