import { XGBoost, XGBoostClassifier } from '../../lib/model/xgboost.js'
import Controller from '../controller.js'

var dispXGBoost = function (elm, platform) {
	const controller = new Controller(platform)
	const task = platform.task
	let model = null
	const fitModel = cb => {
		const lambda = +elm.select('[name=lambda]').property('value')
		const lr = +elm.select('[name=lr]').property('value')
		const md = +elm.select('[name=maxd]').property('value')
		const itr = +elm.select('[name=itr]').property('value')
		const srate = +elm.select('input[name=srate]').property('value')
		if (!model) {
			if (task === 'CF') {
				model = new XGBoostClassifier(md, srate, lambda, lr)
				model.init(
					platform.trainInput,
					platform.trainOutput.map(v => v[0])
				)
			} else {
				model = new XGBoost(md, srate, lambda, lr)
				model.init(platform.trainInput, platform.trainOutput)
			}
		}
		for (let i = 0; i < itr; i++) {
			model.fit()
		}

		let pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
		cb && cb()
	}

	elm.append('span').text(' max depth = ')
	elm.append('input').attr('type', 'number').attr('name', 'maxd').attr('value', 1).attr('min', 1).attr('max', 10)
	elm.append('span').text(' Sampling rate ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'srate')
		.property('value', 0.8)
		.attr('min', 0.1)
		.attr('max', 1)
		.attr('step', 0.1)
	elm.append('span').text(' lambda = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'lambda')
		.attr('value', 0.1)
		.attr('min', 0.1)
		.attr('max', 10)
		.attr('step', 0.1)
	elm.append('span').text(' learning rate = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'lr')
		.attr('value', 0.1)
		.attr('min', 0)
		.attr('max', 10)
		.attr('step', 0.1)
	const slbConf = controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	})
	elm.append('span').text(' Iteration ')
	elm.append('input').attr('type', 'number').attr('name', 'itr').attr('value', 1).attr('min', 1).attr('max', 100)
	slbConf.step(fitModel).epoch(() => model.size)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispXGBoost(platform.setting.ml.configElement, platform)
}
