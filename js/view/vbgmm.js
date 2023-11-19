import VBGMM from '../../lib/model/vbgmm.js'
import Controller from '../controller.js'
import { getCategoryColor } from '../utils.js'

class VBGMMPlotter {
	constructor(svg, model) {
		this._r = document.createElementNS('http://www.w3.org/2000/svg', 'g')
		svg.append(this._r)
		this._model = model
		this._size = model._k
		this._circle = []
		this._rm = []
		this._duration = 200
		this._scale = 1000

		for (let i = 0; i < this._size; i++) {
			this.add(i + 1)
		}
	}

	terminate() {
		this._r.remove()
	}

	add(category) {
		const cecl = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
		cecl.setAttribute('cx', 0)
		cecl.setAttribute('cy', 0)
		cecl.setAttribute('stroke', getCategoryColor(category))
		cecl.setAttribute('stroke-width', 2)
		cecl.setAttribute('fill-opacity', 0)
		cecl.style.transitionDuration = this._duration + 'ms'
		this._r.append(cecl)
		this._set_el_attr(cecl, this._size - 1)
		this._circle.push(cecl)
		this._rm.push(false)
	}

	_set_el_attr(ell, i) {
		let cn = this._model.means.row(i).value
		let s = this._model.covs[i].value
		const su2 = (s[0] + s[3] + Math.sqrt((s[0] - s[3]) ** 2 + 4 * s[1] ** 2)) / 2
		const sv2 = (s[0] + s[3] - Math.sqrt((s[0] - s[3]) ** 2 + 4 * s[1] ** 2)) / 2
		const c = 2.146
		let t = (360 * Math.atan((su2 - s[0]) / s[1])) / (2 * Math.PI)
		if (isNaN(t)) {
			t = 0
		}

		ell.setAttribute('rx', c * Math.sqrt(su2) * this._scale)
		ell.setAttribute('ry', c * Math.sqrt(sv2) * this._scale)
		ell.setAttribute(
			'transform',
			'translate(' + cn[0] * this._scale + ',' + cn[1] * this._scale + ') ' + 'rotate(' + t + ')'
		)
	}

	move() {
		for (let i = 0; i < this._circle.length; i++) {
			if (!this._model.effectivity[i]) {
				if (!this._rm[i]) {
					this._circle[i].remove()
				}
				this._rm[i] = true
			}
		}
		this._circle.forEach((ecl, i) => {
			if (this._rm[i]) return
			this._set_el_attr(ecl, i)
		})
	}
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	const controller = new Controller(platform)
	let model = null
	let plotter = null

	const fitModel = cb => {
		if (!model) {
			model = new VBGMM(alpha.value, beta.value, k.value)
			model.init(platform.trainInput)
		}
		model.fit()
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		clusters.value = model.effectivity.reduce((s, v) => s + (v ? 1 : 0), 0)
		if (!plotter) {
			plotter = new VBGMMPlotter(platform.svg, model)
		}
		plotter.move()
		const effectivity = model.effectivity
		const means = model.means
			.toArray()
			.map((v, i) => [v, i])
			.filter((r, i) => effectivity[i])
		platform.centroids(
			means.map(v => v[0]),
			means.map(v => v[1] + 1),
			{ duration: 200 }
		)
		setTimeout(() => {
			cb && cb()
		}, 200)
	}

	const alpha = controller.input.number({ label: ' alpha ', min: 0, max: 10, value: 1.0e-3 })
	const beta = controller.input.number({ label: ' beta ', min: 0, max: 10, value: 1.0e-3 })
	const k = controller.input.number({ label: ' k ', min: 1, max: 1000, value: 10 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			plotter?.terminate()
			plotter = null
			clusters.value = '0'
			platform.init()
		})
		.step(fitModel)
		.epoch()
	const clusters = controller.text({ label: ' Clusters: ' })
	platform.setting.terminate = () => {
		plotter?.terminate()
	}
}
