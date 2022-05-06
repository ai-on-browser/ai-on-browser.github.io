import ENN from '../../lib/model/enn.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new ENN(v.value, k.value)

		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		const categories = model.predict(platform.testInput(v.value === 0 ? 10 : 4))
		platform.testResult(categories)
	}

	const v = controller.input.number({
		label: ' version ',
		min: 0,
		max: 2,
		value: 1,
	})
	const k = controller.input.number({
		label: ' k ',
		min: 1,
		max: 100,
		value: 5,
	})
	controller.input.button('Calculate').on('click', fitModel)
}
