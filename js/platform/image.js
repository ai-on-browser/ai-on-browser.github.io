import { BasePlatform } from './base.js'
import ImageData from '../data/image.js'
import ImageRenderer from '../renderer/image.js'

export default class ImagePlatform extends BasePlatform {
	constructor(manager) {
		super(manager)

		this._reduce_algorithm = 'mean'
		this._color_space = 'rgb'
		this._normalize = false
		this._step = 10

		this._binary_threshold = 180

		this._renderer.forEach(rend => rend.terminate())
		this._renderer = [new ImageRenderer(manager)]

		const elm = this.setting.task.configElement
		elm.append('Color space')
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
		value = this._to2d(value, this.trainInput, this._step)
		this._renderer.forEach(rend => (rend.trainResult = value))
	}

	testInput(step = 8) {
		const data = this.datas.x[0]
		const x = this.datas._reduce(data, step, this._reduce_algorithm)
		if (this.task === 'DN') {
			for (let i = 0; i < x.length; i++) {
				for (let j = 0; j < x[i].length; j++) {
					for (let k = 0; k < x[i][j].length; k++) {
						x[i][j][k] = Math.max(0, Math.min(255, x[i][j][k] + Math.floor(Math.random() * 50 - 25)))
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
				p.push(pred.slice(i, i + this.__pred[0][0].length))
			}
			pred = p
		}
		pred = this._to2d(pred, this.__pred_x, this.__pred_step)
		this._renderer.forEach(rend => rend.testResult(pred))
	}

	_to2d(data, pred, step) {
		const imdata = Array.from({ length: pred.length * step }, () => [])
		for (let i = 0, s = 0, p = 0; i < pred.length; i++, s += step) {
			for (let j = 0, t = 0; j < pred[i].length; j++, p++, t += step) {
				for (let u = 0; u < step; u++) {
					for (let v = 0; v < step; v++) {
						imdata[s + u][t + v] = data[p]
					}
				}
			}
		}
		return imdata
	}

	init() {
		this._renderer.forEach(rend => rend.init())
		this.render()
	}

	terminate() {
		this.setting.task.configElement.replaceChildren()
		super.terminate()
	}
}
