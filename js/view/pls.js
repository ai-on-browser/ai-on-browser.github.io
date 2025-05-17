import PLS from '../../lib/model/pls.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'Partial least squares regression (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Partial_least_squares_regression',
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const dim = platform.datas.dimension
		const model = new PLS(l.value)
		model.init(platform.trainInput, platform.trainOutput)
		model.fit()

		const pred = model.predict(platform.testInput(dim === 1 ? 100 : 4))
		platform.testResult(pred)
	}

	const l = controller.input.number({
		label: ' l = ',
		min: 1,
		max: platform.datas.dimension,
		value: platform.datas.dimension,
	})
	controller.input.button('Fit').on('click', () => fitModel())
}
