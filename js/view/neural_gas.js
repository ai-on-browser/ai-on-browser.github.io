import NeuralGas from '../../lib/model/neural_gas.js'
import Controller from '../controller.js'

var dispNeuralGas = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Neural gas (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Neural_gas',
	}
	const controller = new Controller(platform)
	let model = new NeuralGas()

	const fitPoints = () => {
		const pred = model.predict(platform.testInput(4))
		platform.testResult(pred.map(v => v + 1))
		elm.select('[name=l]').property('value', model._l)
	}

	const slbConf = controller.stepLoopButtons().init(() => {
		const l = +elm.select('[name=l]').property('value')
		const m = +elm.select('[name=m]').property('value')
		model = new NeuralGas(l, m)
		elm.select('[name=clusternumber]').text(model.size + ' clusters')
		platform.init()
	})
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Add centroid')
		.on('click', () => {
			model.add(platform.trainInput)
			const pred = model.predict(platform.trainInput)
			platform.trainResult = pred.map(v => v + 1)
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
			model._l = l
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
			model._m = m
		})
	slbConf.step(cb => {
		if (model.size === 0) {
			cb && cb()
			return
		}
		model.fit(platform.trainInput)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
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
