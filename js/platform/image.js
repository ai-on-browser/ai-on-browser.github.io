import { BasePlatform } from './base.js'
import ImageData from '../data/image.js'
import ImageRenderer from '../renderer/image.js'

export default class ImagePlatform extends BasePlatform {
	constructor(task, manager) {
		super(task, manager)

		this._reduce_algorithm = 'mean'
		this._color_space = 'rgb'
		this._normalize = false
		this._step = 10

		this._binary_threshold = 180

		this._renderer.terminate()
		this._renderer = new ImageRenderer(manager)

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
		elm.append(' overwrap ')
		const opacity = document.createElement('input')
		opacity.name = 'opacity'
		opacity.type = 'range'
		opacity.min = 0
		opacity.max = 1
		opacity.step = 0.1
		opacity.value = 0.5
		opacity.oninput = () => {
			this._renderer.resultOpacity = opacity.value
		}
		this._renderer.resultOpacity = opacity.value
		elm.appendChild(opacity)
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
		this._renderer._displayResult(this.trainInput, value, this._step)
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
				const v = []
				for (let k = 0; k < this.__pred[0][0].length; k++) {
					v.push(pred[i + k])
				}
				p.push(v)
			}
			pred = p
		}
		this._pred = pred
		this._renderer._displayResult(this.__pred_x, pred, this.__pred_step)
	}

	init() {
		this._renderer.init()
		this.render()
	}

	render() {
		this._renderer.render()
	}

	terminate() {
		this.setting.task.configElement.replaceChildren()
		super.terminate()
	}
}
