import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		title: 'Online machine learning (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Online_machine_learning#Online_learning:_recursive_least_squares',
	}
	const controller = new Controller(platform)
	const calc = () => {
		let model = null
		if (platform.task === 'CF') {
			model = new EnsembleBinaryModel(() => new RecursiveLeastSquares(), method.value)
		} else {
			model = new RecursiveLeastSquares()
		}
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)

		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
	}

	let method
	if (platform.task === 'CF') {
		method = controller.select(['oneone', 'onerest'])
	}
	controller.input.button('Calculate').on('click', calc)
}
