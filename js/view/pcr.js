import PCR from '../../lib/model/pcr.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'Principal component regression (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Principal_component_regression',
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const dim = platform.datas.dimension
		const model = new PCR()
		model.fit(platform.trainInput, platform.trainOutput)

		const pred = model.predict(platform.testInput(dim === 1 ? 100 : 4))
		platform.testResult(pred)
	}

	controller.input.button('Fit').on('click', () => fitModel())
}
