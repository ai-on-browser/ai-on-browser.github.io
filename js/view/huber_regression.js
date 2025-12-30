import HuberRegression from '../../lib/model/huber_regression.js'
import Controller from '../controller.js'

var dispHR = (elm, platform) => {
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		if (!model) {
			const method = elm.select('[name=method]').property('value')
			const e = +elm.select('[name=e]').property('value')
			const lr = +elm.select('[name=lr]').property('value')
			model = new HuberRegression(e, method, lr)
		}
		model.fit(platform.trainInput, platform.trainOutput)

		const pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
	}

	elm.append('select')
		.attr('name', 'method')
		.on('change', () => {
			const method = elm.select('[name=method]').property('value')
			lrelm.style('display', method === 'gd' ? null : 'none')
		})
		.selectAll('option')
		.data(['rls', 'gd'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('span').text(' e ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'e')
		.attr('value', 1)
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
	const lrelm = elm.append('span').text(' rate ').style('display', 'none')
	lrelm
		.append('input')
		.attr('type', 'number')
		.attr('name', 'lr')
		.attr('value', 1)
		.attr('min', 0)
		.attr('max', 10)
		.attr('step', 0.01)
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispHR(platform.setting.ml.configElement, platform)
}
