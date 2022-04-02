import ADALINE from '../../lib/model/adaline.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

var dispADALINE = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null
	const calc = cb => {
		const method = elm.select('[name=method]').property('value')
		const rate = +elm.select('[name=rate]').property('value')
		if (!model) {
			model = new EnsembleBinaryModel(function () {
				return new ADALINE(rate)
			}, method)
			const y = platform.trainOutput.map(v => v[0])
			model.init(platform.trainInput, y)
		}
		model.fit()

		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
		cb && cb()
	}

	elm.append('select')
		.attr('name', 'method')
		.selectAll('option')
		.data(['oneone', 'onerest'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('span').text(' Learning rate ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'rate')
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
		.attr('value', 0.1)
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	dispADALINE(platform.setting.ml.configElement, platform)
}
