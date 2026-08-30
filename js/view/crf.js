import CRF from '../../lib/model/crf.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.require = { preprocess: 'discrete' }
	const controller = new Controller(platform)
	let model = null
	let epoch = 0
	const fitModel = () => {
		if (!model) {
			model = new CRF()
		}
		const tx = platform.trainInput
		for (let i = 0; i < iteration.value; i++) {
			model.fit(
				tx,
				platform.trainOutput.map(v => Array(tx[0].length).fill(v[0]))
			)
		}
		epoch += iteration.value
		const pred = model.predict(platform.testInput(10))
		platform.testResult(pred.map(v => v[0] ?? -1))
	}

	const slbConf = controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	})
	const iteration = controller.input.number({ label: ' iteration ', min: 1, max: 1000, value: 1 })
	slbConf.step(fitModel).epoch(() => epoch)
}
