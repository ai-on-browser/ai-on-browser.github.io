import MCD from '../../lib/model/mcd.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	let model = null

	const calcMCD = () => {
		if (!model) model = new MCD(platform.trainInput, srate.value)
		model.fit()
		const outliers = model.predict(platform.trainInput).map(v => v > threshold.value)
		platform.trainResult = outliers
		const outlier_tiles = model.predict(platform.testInput(3)).map(v => v > threshold.value)
		platform.testResult(outlier_tiles)
	}

	const srate = controller.input.number({ label: ' Sampling rate ', min: 0.1, max: 1, step: 0.1, value: 0.9 })
	const threshold = controller.input
		.number({ label: ' threshold = ', min: 0, max: 10, step: 0.1, value: 2 })
		.on('change', () => calcMCD())
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			calcMCD()
		})
		.step(calcMCD)
}
