import { KMeansModel } from '../lib/model/kmeans.js'

import NeuralGas from '../lib/model/neural_gas.js'

var dispNeuralGas = function (elm, platform) {
	const model = new KMeansModel()
	model.method = new NeuralGas()

	const fitPoints = () => {
		platform.predict((px, pred_cb) => {
			const pred = model.predict(px)
			pred_cb(pred.map(v => v + 1))
			elm.select('[name=l]').property('value', model.method._l)
		}, 4)
	}

	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		const l = +elm.select('[name=l]').property('value')
		const m = +elm.select('[name=m]').property('value')
		model.method = new NeuralGas(l, m)
		model.clear()
		elm.select('[name=clusternumber]').text(model.size + ' clusters')
		platform.init()
	})
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Add centroid')
		.on('click', () => {
			model.add(platform.datas.x)
			platform.fit((tx, ty, pred_cb) => {
				const pred = model.predict(tx)
				pred_cb(pred.map(v => v + 1))
			})
			platform.centroids(
				model.centroids,
				model.centroids.map((c, i) => i + 1),
				{ line: true }
			)
			fitPoints()
			elm.select('[name=clusternumber]').text(model.size + ' clusters')
		})
	elm.append('span').attr('name', 'clusternumber').style('padding', '0 10px').text('0 clusters')
	elm.append('span').text(' l ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'l')
		.attr('max', 10)
		.attr('step', 0.1)
		.attr('value', 1)
		.on('change', () => {
			const l = +elm.select('[name=l]').property('value')
			model.method._l = l
		})
	elm.append('span').text('*=')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'm')
		.attr('max', 1)
		.attr('min', 0.01)
		.attr('step', 0.01)
		.attr('value', 0.99)
		.on('change', () => {
			const m = +elm.select('[name=m]').property('value')
			model.method._m = m
		})
	slbConf.step(cb => {
		if (model.size === 0) {
			cb && cb()
			return
		}
		platform.fit((tx, ty, pred_cb) => {
			model.fit(tx)
			const pred = model.predict(platform.datas.x)
			pred_cb(pred.map(v => v + 1))
		})
		platform.centroids(
			model.centroids,
			model.centroids.map((c, i) => i + 1),
			{
				line: true,
				duration: 100,
			}
		)
		fitPoints()
		cb && setTimeout(cb, 100)
	})
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	dispNeuralGas(platform.setting.ml.configElement, platform)
}
