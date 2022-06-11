import BaseRenderer from './base.js'

export default class ImageRenderer extends BaseRenderer {
	constructor(manager) {
		super(manager)

		this._size = [0, 0]
		const r = this.setting.render.addItem('image')
		this._root = document.createElement('div')
		r.appendChild(this._root)
		this._root.style.position = 'relative'
		this._root.style.border = '1px solid black'
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

	init() {
		this._root.replaceChildren()
	}

	render() {
		this._root.querySelector('canvas.base-img')?.remove()
		if (!this.datas || !this.datas.x || !Array.isArray(this.datas.x[0]) || !Array.isArray(this.datas.x[0][0])) {
			return
		}

		const data = this.datas.x[0]
		const x = this.datas._applySpace(
			data,
			this._manager.platform._color_space,
			this._manager.platform._normalize,
			this._manager.platform._binary_threshold
		)
		const d = x[0][0].length

		const canvas = document.createElement('canvas')
		canvas.classList.add('base-img')
		canvas.style.position = 'absolute'
		canvas.width = data[0].length
		canvas.height = data.length
		const context = canvas.getContext('2d')
		const imdata = context.createImageData(canvas.width, canvas.height)
		for (let i = 0, c = 0; i < canvas.height; i++) {
			for (let j = 0; j < canvas.width; j++, c += 4) {
				imdata.data[c] = x[i][j][0]
				if (d === 1) {
					imdata.data[c + 1] = x[i][j][0]
					imdata.data[c + 2] = x[i][j][0]
					imdata.data[c + 3] = 255
				} else if (d === 3) {
					imdata.data[c + 1] = x[i][j][1]
					imdata.data[c + 2] = x[i][j][2]
					imdata.data[c + 3] = 255
				} else {
					imdata.data[c + 1] = x[i][j][1]
					imdata.data[c + 2] = x[i][j][2]
					imdata.data[c + 3] = x[i][j][3]
				}
			}
		}
		context.putImageData(imdata, 0, 0)

		if (this._root.firstChild) {
			this._root.insertBefore(canvas, this._root.firstChild)
		} else {
			this._root.appendChild(canvas)
		}

		this.width = canvas.width
		this.height = canvas.height
	}

	terminate() {
		this.setting.render.removeItem('image')
		super.terminate()
	}
}
