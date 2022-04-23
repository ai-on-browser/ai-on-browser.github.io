import FuzzyKNN from '../../lib/model/fuzzy_knearestneighbor.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	const calc = function () {
		if (platform.datas.length === 0) {
			return
		}
		const model = new FuzzyKNN(k.value, m.value)
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		const categories = model.categories
		const pred = model
			.predict(platform.testInput(4))
			.map(p => p.reduce((s, v, k) => (s[0] > v ? s : [v, k]), [p[0], 0]))
		platform.testResult(pred.map(v => categories[v[1]]))
	}

	const k = controller.input.number({
		label: ' k = ',
		min: 1,
		max: 100,
		value: 5,
	})
	const m = controller.input.number({
		label: ' m = ',
		min: 1.1,
		max: 10,
		step: 0.1,
		value: 2,
	})
	controller.input.button('Calculate').on('click', calc)
}
