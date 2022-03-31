import MixtureDiscriminant from '../../lib/model/mda.js'
import Controller from '../controller.js'

var dispMDA = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null
	const calc = cb => {
		if (!model) {
			const r = +elm.select('[name=r]').property('value')
			model = new MixtureDiscriminant(r)
			model.init(
				platform.trainInput,
				platform.trainOutput.map(v => v[0])
			)
		}
		model.fit()
		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
		cb && cb()
	}

	elm.append('span').text(' r ')
	elm.append('input').attr('type', 'number').attr('name', 'r').attr('min', 1).attr('max', 100).attr('value', 10)
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
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispMDA(platform.setting.ml.configElement, platform)
}
