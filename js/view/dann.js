import DiscriminantAdaptiveNearestNeighbor from '../../lib/model/dann.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'T. Hastie, R. Tibshirani',
		title: 'Discriminant Adaptive Nearest Neighbor Classification',
		year: 1996,
	}
	const controller = new Controller(platform)
	const calc = () => {
		const ty = platform.trainOutput.map(v => v[0])
		const model = new DiscriminantAdaptiveNearestNeighbor(undefined, iteration.value)
		model.fit(platform.trainInput, ty)
		const categories = model.predict(platform.testInput(10))
		platform.testResult(categories)
	}

	const iteration = controller.input.number({ label: ' iteration ', min: 0, max: 100, value: 1 })
	controller.input.button('Calculate').on('click', calc)
}
