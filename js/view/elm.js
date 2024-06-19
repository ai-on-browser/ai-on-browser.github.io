import { ELMClassifier, ELMRegressor } from '../../lib/model/elm.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		title: 'Extreme learning machine (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Extreme_learning_machine',
	}
	const controller = new Controller(platform)
	const calc = () => {
		const model =
			platform.task === 'CF'
				? new ELMClassifier(size.value, activation.value)
				: new ELMRegressor(size.value, activation.value)
		let y = platform.trainOutput

		if (platform.task === 'CF') {
			y = y.map(v => v[0])
		}
		model.fit(platform.trainInput, y)
		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
	}

	const activation = controller.select({
		label: ' Activation ',
		values: ['sigmoid', 'tanh', 'elu', 'leaky_relu', 'gaussian', 'softplus', 'softsign', 'identity'],
	})
	const size = controller.input.number({ label: ' size ', min: 1, max: 100, value: 10 })
	controller.input.button('Calculate').on('click', calc)
}
