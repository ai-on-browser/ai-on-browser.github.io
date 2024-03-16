import BaseRenderer from './base.js'
import { specialCategory, getCategoryColor } from '../utils.js'
import ImageLoader from '../data/loader/image.js'

export default class ImageRenderer extends BaseRenderer {
	constructor(manager) {
		super(manager)

		this._size = [0, 0]

		const r = this.setting.render.addItem('image')
		const menu = document.createElement('div')
		r.appendChild(menu)
		menu.append(' overwrap ')

		this._opacity = document.createElement('input')
		this._opacity.name = 'opacity'
		this._opacity.type = 'range'
		this._opacity.min = 0
		this._opacity.max = 1
		this._opacity.step = 0.1
		this._opacity.value = 0.5
		this._opacity.oninput = () => {
			if (this._overlay) {
				this._overlay.style.opacity = this._opacity.value
			}
		}
		menu.appendChild(this._opacity)

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

	set trainResult(value) {
		this._displayResult(value)
	}

	init() {
		this._overlay?.remove()
		this._root.replaceChildren()
	}

	render() {
		this._root.querySelector('canvas.base-img')?.remove()
		if (!this.datas || !this.datas.x || !Array.isArray(this.datas.x[0]) || !Array.isArray(this.datas.x[0][0])) {
			return
		}

		const data = this.datas.x[0]
		const x = this._manager.platform._color_space
			? ImageLoader.applySpace(
					data,
					this._manager.platform._color_space,
					this._manager.platform._normalize,
					this._manager.platform._binary_threshold
			  )
			: data
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

	testResult(pred) {
		this._displayResult(pred)
	}

	_displayResult(data) {
		this._overlay?.remove()

		const canvas = document.createElement('canvas')
		canvas.classList.add('overlay')
		canvas.style.position = 'absolute'
		canvas.style.opacity = this._opacity.value
		canvas.width = this.width
		canvas.height = this.height
		const ctx = canvas.getContext('2d')
		const imdata = ctx.createImageData(canvas.width, canvas.height)
		for (let i = 0, p = 0; i < this.height; i++) {
			for (let j = 0; j < this.width; j++, p += 4) {
				const color = [0, 0, 0, 0]
				if (Array.isArray(data[i][j])) {
					color[0] = data[i][j][0]
					color[3] = 255
					if (data[i][j].length === 1) {
						color[1] = data[i][j][0]
						color[2] = data[i][j][0]
					} else {
						color[1] = data[i][j][1]
						color[2] = data[i][j][2]
					}
				} else if (data[i][j] === true || data[i][j] === false) {
					if (data[i][j]) {
						const cc = getCategoryColor(specialCategory.error)
						color[0] = cc.r
						color[1] = cc.g
						color[2] = cc.b
						color[3] = (cc.opacity ?? 1) * 255
					} else {
						color[0] = 255
						color[1] = 255
						color[2] = 255
						color[3] = 255
					}
				} else {
					const cc = getCategoryColor(data[i][j])
					color[0] = cc.r
					color[1] = cc.g
					color[2] = cc.b
					color[3] = (cc.opacity ?? 1) * 255
				}
				imdata.data[p] = color[0]
				imdata.data[p + 1] = color[1]
				imdata.data[p + 2] = color[2]
				imdata.data[p + 3] = color[3]
			}
		}
		ctx.putImageData(imdata, 0, 0)

		this._root.appendChild(canvas)
		this._overlay = canvas
	}

	terminate() {
		this.setting.render.removeItem('image')
		super.terminate()
	}
}
