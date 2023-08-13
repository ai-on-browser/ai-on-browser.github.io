import ENaN from '../../lib/model/enan.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'J. Feng, Q. Zhu, J. Huang, L. Yang',
		title: 'Extend natural neighbor: a novel classification method with self-adaptive neighborhood parameters in different stages',
		year: 2016,
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new ENaN()

		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		const categories = model.predict(platform.testInput(4))
		platform.testResult(categories)
	}

	controller.input.button('Calculate').on('click', fitModel)
}
