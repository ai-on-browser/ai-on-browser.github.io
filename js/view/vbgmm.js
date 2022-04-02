import VBGMM from '../../lib/model/vbgmm.js'
import Controller from '../controller.js'

class VBGMMPlotter {
	constructor(svg, model) {
		this._r = svg.append('g').attr('class', 'centroids2')
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
		let cecl = this._r
			.append('ellipse')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('stroke', getCategoryColor(category))
			.attr('stroke-width', 2)
			.attr('fill-opacity', 0)
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

		ell.attr('rx', c * Math.sqrt(su2) * this._scale)
			.attr('ry', c * Math.sqrt(sv2) * this._scale)
			.attr(
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
			this._set_el_attr(ecl.transition().duration(this._duration), i)
		})
	}
}

var dispVBGMM = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null
	let plotter = null

	const fitModel = cb => {
		if (!model) {
			const k = +elm.select('[name=k]').property('value')
			const a = +elm.select('[name=alpha]').property('value')
			const b = +elm.select('[name=beta]').property('value')
			model = new VBGMM(a, b, k)
			model.init(platform.trainInput)
		}
		model.fit()
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		elm.select('[name=clusters]').text(model.effectivity.reduce((s, v) => s + (v ? 1 : 0), 0))
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

	elm.append('span').text(' alpha ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'alpha')
		.attr('min', 0)
		.attr('max', 10)
		.attr('value', 1.0e-3)
	elm.append('span').text(' beta ')
	elm.append('input').attr('type', 'number').attr('name', 'beta').attr('min', 0).attr('max', 10).attr('value', 1.0e-3)
	elm.append('span').text(' k ')
	elm.append('input').attr('type', 'number').attr('name', 'k').attr('min', 1).attr('max', 1000).attr('value', 10)
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			plotter?.terminate()
			plotter = null
			elm.select('[name=clusters]').text(0)
			platform.init()
		})
		.step(fitModel)
		.epoch()
	elm.append('span').text(' Clusters: ')
	elm.append('span').attr('name', 'clusters')
	return () => {
		plotter?.terminate()
	}
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.terminate = dispVBGMM(platform.setting.ml.configElement, platform)
}
