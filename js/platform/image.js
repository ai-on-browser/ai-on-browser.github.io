import { BasePlatform } from './base.js'
import ImageData from '../data/image.js'
import { specialCategory, getCategoryColor } from '../utils.js'

export default class ImagePlatform extends BasePlatform {
	constructor(task, manager) {
		super(task, manager)

		this._reduce_algorithm = 'mean'
		this._color_space = 'rgb'
		this._normalize = false
		this._step = 10

		this._binary_threshold = 180

		const elm = this.setting.task.configElement
		elm.appendChild(document.createTextNode('Color space'))
		const cselm = document.createElement('select')
		cselm.name = 'space'
		cselm.onchange = () => {
			this._color_space = cselm.value
			threshold.style.display = this._color_space === 'binary' ? null : 'none'
			this.render()
		}
		for (const cs of Object.keys(ImageData.colorSpaces).map(k => ImageData.colorSpaces[k])) {
			const opt = document.createElement('option')
			opt.value = cs
			opt.innerText = cs
			cselm.appendChild(opt)
		}
		elm.appendChild(cselm)
		const threshold = document.createElement('input')
		threshold.type = 'number'
		threshold.name = 'threshold'
		threshold.min = 0
		threshold.max = 255
		threshold.value = this._binary_threshold
		threshold.style.display = 'none'
		threshold.onchange = () => {
			this._binary_threshold = threshold.value
			this.render()
		}
		elm.appendChild(threshold)
		elm.appendChild(document.createTextNode(' overwrap '))
		this._opacity = document.createElement('input')
		this._opacity.name = 'opacity'
		this._opacity.type = 'range'
		this._opacity.min = 0
		this._opacity.max = 1
		this._opacity.step = 0.1
		this._opacity.value = 0.5
		this._opacity.oninput = () => {
			let imelm = this._r.select('g.predict-img')
			if (imelm.size() > 0) {
				imelm.attr('opacity', this._opacity.value)
			}
		}
		elm.appendChild(this._opacity)
	}

	set colorSpace(value) {
		this._color_space = value
		this.setting.task.configElement.querySelector('[name=space]').value = value
		this.setting.task.configElement.querySelector('[name=threshold]').style.display =
			this._color_space === 'binary' ? null : 'none'
		this.render()
	}

	get trainInput() {
		const data = this.datas.x[0]
		const x = this.datas._applySpace(
			this.datas._reduce(data, this._step, this._reduce_algorithm),
			this._color_space,
			this._normalize,
			this._binary_threshold
		)
		return x
	}

	set trainResult(value) {
		this._pred = value
		this._displayResult(this.trainInput, value, this._step)
	}

	testInput(step = 8) {
		const data = this.datas.x[0]
		const x = this.datas._reduce(data, step, this._reduce_algorithm)
		if (this.task === 'DN') {
			for (let i = 0; i < x.length; i++) {
				for (let j = 0; j < x[i].length; j++) {
					for (let k = 0; k < x[i][j].length; k++) {
						x[i][j][k] = Math.max(0, Math.min(255, x[i][j][k] + Math.floor(Math.random() * 510 - 255)))
					}
				}
			}
		}
		const sx = this.datas._applySpace(x, this._color_space, this._normalize, this._binary_threshold)
		this.__pred = sx
		this.__pred_x = x
		this.__pred_step = step
		return sx
	}

	testResult(pred) {
		if (!Array.isArray(pred[0])) {
			const p = []
			for (let i = 0; i < pred.length; i += this.__pred[0][0].length) {
				const v = []
				for (let k = 0; k < this.__pred[0][0].length; k++) {
					v.push(pred[i + k])
				}
				p.push(v)
			}
			pred = p
		}
		this._pred = pred
		this._displayResult(this.__pred_x, pred, this.__pred_step)
	}

	init() {
		if (this.svg.select('g.im-render').size() === 0) {
			this.svg.append('g').classed('im-render', true).style('transform', 'scale(1, -1) translate(0, -100%)')
		}
		this._r = this.svg.select('g.im-render')
		this._r.selectAll('*').remove()

		this.render()
	}

	render() {
		let imelm = this._r.select('g.target-image')
		if (imelm.size() === 0) {
			imelm = this._r.insert('g', ':first-child').classed('target-image', true)
		}

		if (!this.datas || !this.datas.x || !Array.isArray(this.datas.x[0]) || !Array.isArray(this.datas.x[0][0])) {
			return
		}

		const data = this.datas.x[0]
		const x = this.datas._applySpace(data, this._color_space, this._normalize, this._binary_threshold)
		const d = x[0][0].length

		const canvas = document.createElement('canvas')
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

		imelm.selectAll('*').remove()
		imelm
			.append('image')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', canvas.width)
			.attr('height', canvas.height)
			.attr('xlink:href', canvas.toDataURL())

		this._manager.platform.width = canvas.width
		this._manager.platform.height = canvas.height
	}

	_displayResult(org, data, step) {
		let imelm = this._r.select('g.predict-img')
		if (imelm.size() === 0) {
			imelm = this._r.append('g').attr('opacity', this._opacity.value).classed('predict-img', true)
		}
		imelm.selectAll('*').remove()

		const canvas = document.createElement('canvas')
		canvas.width = this.width
		canvas.height = this.height
		const ctx = canvas.getContext('2d')
		const imdata = ctx.createImageData(canvas.width, canvas.height)
		for (let i = 0, p = 0; i < org.length; i++) {
			for (let j = 0; j < org[i].length; j++, p++) {
				const color = [0, 0, 0, 0]
				if (Array.isArray(data[p])) {
					color[0] = data[p][0]
					color[3] = 255
					if (data[p].length === 1) {
						color[1] = data[p][0]
						color[2] = data[p][0]
					} else {
						color[1] = data[p][1]
						color[2] = data[p][2]
					}
				} else if (data[p] === true || data[p] === false) {
					if (data[p]) {
						const cc = getCategoryColor(specialCategory.error)
						color[0] = cc.r
						color[1] = cc.g
						color[2] = cc.b
						color[3] = cc.opacity * 255
					} else {
						color[0] = 255
						color[1] = 255
						color[2] = 255
						color[3] = 255
					}
				} else {
					const cc = getCategoryColor(data[p])
					color[0] = cc.r
					color[1] = cc.g
					color[2] = cc.b
					color[3] = cc.opacity * 255
				}
				for (let s = 0; s < step; s++) {
					for (let t = 0; t < step; t++) {
						const c = ((i * step + s) * canvas.width + j * step + t) * 4
						imdata.data[c] = color[0]
						imdata.data[c + 1] = color[1]
						imdata.data[c + 2] = color[2]
						imdata.data[c + 3] = color[3]
					}
				}
			}
		}
		ctx.putImageData(imdata, 0, 0)
		imelm
			.append('image')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', canvas.width)
			.attr('height', canvas.height)
			.attr('xlink:href', canvas.toDataURL())
	}

	terminate() {
		this._r.remove()
		this.setting.task.configElement.replaceChildren()
		super.terminate()
	}
}
