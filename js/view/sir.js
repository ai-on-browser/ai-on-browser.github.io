import SlicedInverseRegression from '../../lib/model/sir.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'Sliced inverse regression (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Sliced_inverse_regression',
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const dim = platform.dimension
		const model = new SlicedInverseRegression(s.value, dim)
		const y = model.predict(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		platform.trainResult = y
	}

	const s = controller.input.number({ label: 's', min: 1, max: 100, value: 10 }).on('change', fitModel)
	controller.input.button('Fit').on('click', fitModel)
}
