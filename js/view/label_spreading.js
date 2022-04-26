import LabelSpreading from '../../lib/model/label_spreading.js'
import Controller from '../controller.js'

var dispLabelSpreading = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		if (!model) {
			const sigma = +elm.select('[name=sigma]').property('value')
			model = new LabelSpreading(alpha.value, method.value, sigma, k.value)
			model.init(
				platform.trainInput,
				platform.trainOutput.map(v => v[0])
			)
		}
		model.fit()
		platform.trainResult = model.predict()
	}
	const method = controller.select(['rbf', 'knn']).on('change', function () {
		const value = method.value
		paramSpan.selectAll('*').style('display', 'none')
		paramSpan.selectAll(`.${value}`).style('display', 'inline')
	})
	const paramSpan = elm.append('span')
	paramSpan.append('span').classed('rbf', true).text('s =')
	paramSpan
		.append('input')
		.attr('type', 'number')
		.attr('name', 'sigma')
		.classed('rbf', true)
		.attr('min', 0.01)
		.attr('max', 100)
		.attr('step', 0.01)
		.property('value', 1)
	const k = controller.input.number({
		label: 'k =',
		min: 1,
		max: 1000,
		value: 10,
	})
	const alpha = controller.input.number({
		label: 'alpha',
		min: 0,
		max: 1,
		step: 0.1,
		value: 0.2,
	})
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(cb => {
			fitModel()
			cb && cb()
		})
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Finally, click "Step" button repeatedly.'
	dispLabelSpreading(platform.setting.ml.configElement, platform)
}
