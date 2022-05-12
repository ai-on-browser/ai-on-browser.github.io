import Matrix from '../../lib/util/matrix.js'

import { GMM, SemiSupervisedGMM, GMR } from '../../lib/model/gmm.js'
import Controller from '../controller.js'
import { specialCategory, getCategoryColor } from '../utils.js'

class GMMPlotter {
	// see http://d.hatena.ne.jp/natsutan/20110421/1303344155
	constructor(svg, model, grayscale = false) {
		this._r = svg.append('g').attr('class', 'centroids2')
		this._model = model
		this._size = 0
		this._circle = []
		this._grayscale = grayscale
		this._duration = 200
	}

	terminate() {
		this._r.remove()
	}

	_set_el_attr(ell, i) {
		if (!this._model._m[i]) {
			return
		}
		const cn = this._model._m[i].value
		const s = this._model._s[i].value
		const su2 = (s[0] + s[3] + Math.sqrt((s[0] - s[3]) ** 2 + 4 * s[1] ** 2)) / 2
		const sv2 = (s[0] + s[3] - Math.sqrt((s[0] - s[3]) ** 2 + 4 * s[1] ** 2)) / 2
		const c = 2.146
		let t = (360 * Math.atan((su2 - s[0]) / s[1])) / (2 * Math.PI)
		if (isNaN(t)) {
			t = 0
		}

		ell.attr('rx', c * Math.sqrt(su2) * 1000)
			.attr('ry', c * Math.sqrt(sv2) * 1000)
			.attr('transform', 'translate(' + cn[0] * 1000 + ',' + cn[1] * 1000 + ') ' + 'rotate(' + t + ')')
	}

	add(category) {
		this._size++

		const cecl = this._r
			.append('ellipse')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('stroke', this._grayscale ? 'gray' : getCategoryColor(category || this._size))
			.attr('stroke-width', 2)
			.attr('fill-opacity', 0)
		this._set_el_attr(cecl, this._size - 1)
		this._circle.push(cecl)
	}

	clear() {
		this._circle.forEach(c => c.remove())
		this._circle = []
		this._size = 0
	}

	move() {
		this._circle.forEach((ecl, i) => {
			this._set_el_attr(ecl.transition().duration(this._duration), i)
		})
	}
}

var dispGMM = function (elm, platform) {
	const svg = platform.svg
	const mode = platform.task
	const controller = new Controller(platform)

	const grayscale = mode !== 'CT' && mode !== 'SC' && mode !== 'RG'
	let model = new GMM()
	if (mode === 'SC') {
		model = new SemiSupervisedGMM()
	} else if (mode === 'RG') {
		model = new GMR()
	}
	const plotter = new GMMPlotter(svg, model, grayscale)
	const fitModel = (doFit, cb) => {
		if (mode === 'AD') {
			const threshold = +elm.select('[name=threshold]').property('value')
			if (doFit) model.fit(platform.trainInput)
			const outliers = model.probability(platform.trainInput).map(v => {
				return 1 - v.reduce((a, v) => a * Math.exp(-v), 1) < threshold
			})
			platform.trainResult = outliers
			const outlier_tiles = model.probability(platform.testInput(3)).map(v => {
				return 1 - v.reduce((a, v) => a * Math.exp(-v), 1) < threshold
			})
			platform.testResult(outlier_tiles)
		} else if (mode === 'DE') {
			if (doFit) model.fit(platform.trainInput)
			const pred = model.probability(platform.testInput(8)).map(p => Math.max(...p))
			const min = Math.min(...pred)
			const max = Math.max(...pred)
			platform.testResult(pred.map(v => specialCategory.density((v - min) / (max - min))))
		} else if (mode === 'SC') {
			if (doFit)
				model.fit(
					platform.trainInput,
					platform.trainOutput.map(v => v[0])
				)
			platform.trainResult = model.predict(platform.trainInput)
			const pred = model.predict(platform.testInput(4))
			platform.testResult(pred)
		} else if (mode === 'GR') {
			const tx = platform.trainInput
			if (doFit) model.fit(tx)
			const p = []
			if (model._k > 0) {
				for (let i = 0; i < tx.length; i++) {
					let r = Math.random()
					let k = 0
					for (; k < model._p.length; k++) {
						if ((r -= model._p[k]) <= 0) {
							break
						}
					}
					p.push(Matrix.randn(1, tx[0].length, model._m[k], model._s[k]).value)
				}
			}
			platform.trainResult = p
		} else if (mode === 'RG') {
			if (doFit) {
				model.fit(platform.trainInput, platform.trainOutput)
				const pred = model.predict(platform.testInput(4))
				platform.testResult(pred)
			}
		} else {
			if (doFit) model.fit(platform.trainInput)
			platform.trainResult = model.predict(platform.trainInput).map(v => v + 1)
		}
		if (mode === 'RG') {
			// platform.centroids(model._mx.map(m => m.value), model._my.map(m => m.value[0]), {duration: 200})
			elm.select('[name=clusternumber]').text(model._k + ' clusters')
		} else {
			plotter.move()
			platform.centroids(
				model._m.map(m => m.value),
				grayscale ? 0 : mode === 'SC' ? model.categories : model._m.map((m, i) => i + 1),
				{ duration: 200 }
			)
			elm.select('[name=clusternumber]').text(model._k + ' clusters')
		}
	}

	const slbConf = controller.stepLoopButtons()
	if (mode === 'SC') {
		slbConf.init(() => {
			model.clear()
			model.init(
				platform.trainInput,
				platform.trainOutput.map(v => v[0])
			)
			for (let k = 0; k < model._k; k++) {
				plotter.add(model.categories[k])
			}
			fitModel(false)
		})
	} else {
		elm.append('input')
			.attr('type', 'button')
			.attr('value', 'Add cluster')
			.on('click', () => {
				model.add()
				plotter.add()
				fitModel(false)
			})
	}
	elm.append('span').attr('name', 'clusternumber').style('padding', '0 10px').text('0 clusters')
	if (mode === 'AD') {
		elm.append('span').text(' threshold = ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'threshold')
			.attr('value', 0.5)
			.attr('min', 0)
			.attr('max', 1)
			.property('required', true)
			.attr('step', 0.1)
			.on('change', () => fitModel(false))
	}
	slbConf.step(cb => {
		fitModel(true)
		setTimeout(() => cb && cb(), 200)
	})
	if (mode !== 'SC') {
		elm.append('input')
			.attr('type', 'button')
			.attr('value', 'Clear')
			.on('click', () => {
				model && model.clear()
				plotter.clear()
				elm.select('[name=clusternumber]').text('0 clusters')
				platform.init()
			})
	}
	return () => {
		plotter.terminate()
	}
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Finally, click "Step" button repeatedly.'
	platform.setting.terminate = dispGMM(platform.setting.ml.configElement, platform)
}
