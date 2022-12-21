import LMNN from '../../lib/model/lmnn.js'
import Controller from '../controller.js'

var dispLMNN = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Large margin nearest neighbor (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Large_margin_nearest_neighbor',
	}
	const controller = new Controller(platform)
	let learn_epoch = 0
	let model = null

	const fitModel = cb => {
		if (!model) {
			return
		}

		const iteration = +elm.select('[name=iteration]').property('value')
		for (let i = 0; i < iteration; i++) {
			model.fit()
		}
		const pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
		learn_epoch += iteration

		cb && cb()
	}

	elm.append('span').text(' gamma ')
	elm.append('input').attr('type', 'number').attr('name', 'gamma').attr('value', 5).attr('min', 1).attr('max', 1000)
	elm.append('span').text(' lambda ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'lambda')
		.attr('value', 0.5)
		.attr('min', 0)
		.attr('max', 10)
		.attr('step', 0.1)
	elm.select('[name=method]').property('value', 'multinomial')
	const slbConf = controller.stepLoopButtons().init(() => {
		learn_epoch = 0
		const gamma = +elm.select('[name=gamma]').property('value')
		const lambda = +elm.select('[name=lambda]').property('value')
		model = new LMNN(gamma, lambda)
		model.init(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		platform.init()
	})
	elm.append('span').text(' Iteration ')
	elm.append('select')
		.attr('name', 'iteration')
		.selectAll('option')
		.data([1, 10, 100, 1000])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	slbConf.step(fitModel).epoch(() => learn_epoch)
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	dispLMNN(platform.setting.ml.configElement, platform)
}
