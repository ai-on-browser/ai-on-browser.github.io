import QuantileRegression from '../../../lib/model/quantile_regression.js'
import Controller from '../controller.js'

var dispQuantile = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		const t = +elm.select('[name=t]').property('value')
		const lr = +elm.select('[name=lr]').property('value')
		if (!model) {
			model = new QuantileRegression(t, lr)
		}
		model.lr = lr
		model.fit(platform.trainInput, platform.trainInput)

		let pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
	}

	elm.append('span').text(' t ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 't')
		.attr('value', 0.5)
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', 0.1)
	const slbConf = controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	})
	elm.append('span').text(' learning rate ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'lr')
		.attr('value', 0.001)
		.attr('min', 0)
		.attr('max', 10)
		.attr('step', 0.001)
	slbConf.step(fitModel).epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispQuantile(platform.setting.ml.configElement, platform)
}
