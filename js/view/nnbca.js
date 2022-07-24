import NNBCA from '../../lib/model/nnbca.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new NNBCA()

		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		const categories = model.predict(platform.testInput(4))
		platform.testResult(categories.map(v => v ?? -1))
	}

	controller.input.button('Calculate').on('click', fitModel)
}
