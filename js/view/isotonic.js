import IsotonicRegression from '../../lib/model/isotonic.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.require = { dimension: 1 }
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new IsotonicRegression()
		model.fit(
			platform.trainInput.map(v => v[0]),
			platform.trainOutput.map(v => v[0])
		)
		platform.testResult(model.predict(platform.testInput(1).map(v => v[0])))
	}

	controller.input.button('Fit').on('click', () => fitModel())
}
