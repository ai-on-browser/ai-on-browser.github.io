import SVR from '../../lib/model/svr.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	let model = null
	let learn_epoch = 0

	const calcSVR = () => {
		for (let i = 0; i < +iteration.value; i++) {
			model.fit()
		}
		learn_epoch += +iteration.value
		const pred = model.predict(platform.testInput(8))
		platform.testResult(pred)
	}

	const kernel = controller.select(['gaussian', 'linear']).on('change', () => {
		if (kernel.value === 'gaussian') {
			gamma.element.style.display = 'inline'
		} else {
			gamma.element.style.display = 'none'
		}
	})
	const gamma = controller.input.number({ value: 0.1, min: 0.1, max: 10.0, step: 0.1 })
	const slbConf = controller.stepLoopButtons().init(() => {
		model = new SVR({ name: kernel.value, d: gamma.value })
		model.init(platform.trainInput, platform.trainOutput)
		learn_epoch = 0
		platform.init()
	})
	const iteration = controller.select({ label: ' Iteration ', values: [1, 10, 100, 1000] })
	slbConf.step(calcSVR).epoch(() => learn_epoch)
}
