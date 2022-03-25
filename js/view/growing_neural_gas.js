import GrowingNeuralGas from '../../lib/model/growing_neural_gas.js'
import Controller from '../controller.js'

var dispGrowingNeuralGas = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null

	const slbConf = controller.stepLoopButtons().init(() => {
		const l = +elm.select('[name=l]').property('value')
		const m = +elm.select('[name=m]').property('value')
		model = new GrowingNeuralGas(l, m)
		elm.select('[name=clusternumber]').text(model.size + ' clusters')
		platform.init()
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
		.attr('min', 0.0001)
		.attr('step', 0.0001)
		.attr('value', 0.9999)
		.on('change', () => {
			const m = +elm.select('[name=m]').property('value')
			model._m = m
		})
	slbConf.step(cb => {
		platform.fit((tx, ty, pred_cb) => {
			model.fit(tx)
			const pred = model.predict(tx)
			pred_cb(pred.map(v => v + 1))
		})
		platform.centroids(
			model._nodes,
			model._nodes.map((c, i) => i + 1),
			{
				line: true,
				duration: 10,
			}
		)
		platform.predict((px, pred_cb) => {
			const pred = model.predict(px)
			pred_cb(pred.map(v => v + 1))
			elm.select('[name=l]').property('value', model._l)
		}, 4)
		elm.select('[name=clusternumber]').text(model.size + ' clusters')
		cb && setTimeout(cb, 10)
	})
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	dispGrowingNeuralGas(platform.setting.ml.configElement, platform)
}
