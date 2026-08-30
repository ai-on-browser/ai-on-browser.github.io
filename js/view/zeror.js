import ZeroR from '../../lib/model/zeror.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.require = { preprocess: 'discrete' }
	const controller = new Controller(platform)

	controller.input.button('Fit').on('click', () => {
		const model = new ZeroR()
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		const pred = model.predict(platform.testInput(10))
		platform.testResult(pred.map(v => (v ? +v : -1)))
	})
}
