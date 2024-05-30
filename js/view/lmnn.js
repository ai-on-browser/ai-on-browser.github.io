import LMNN from '../../lib/model/lmnn.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.ml.reference = {
		title: 'Large margin nearest neighbor (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Large_margin_nearest_neighbor',
	}
	const controller = new Controller(platform)
	let learn_epoch = 0
	let model = null

	const fitModel = () => {
		if (!model) {
			return
		}

		for (let i = 0; i < +iteration.value; i++) {
			model.fit()
		}
		const pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
		learn_epoch += +iteration.value
	}

	const gamma = controller.input.number({ label: ' gamma ', min: 1, max: 1000, value: 5 })
	const lambda = controller.input.number({ label: ' lambda ', min: 0, max: 10, step: 0.1, value: 0.5 })
	const slbConf = controller.stepLoopButtons().init(() => {
		learn_epoch = 0
		model = new LMNN(gamma.value, lambda.value)
		model.init(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		platform.init()
	})
	const iteration = controller.select({ label: ' Iteration ', values: [1, 10, 100, 1000] })
	slbConf.step(fitModel).epoch(() => learn_epoch)
}
