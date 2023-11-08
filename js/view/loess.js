import LOESS from '../../lib/model/loess.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new LOESS()
		model.fit(platform.trainInput, platform.trainOutput)
		platform.testResult(model.predict(platform.testInput(10)))
	}

	controller.input.button('Fit').on('click', () => fitModel())
}
