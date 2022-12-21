import IKNN from '../../lib/model/iknn.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'Y. Song, J. Huang, D. Zhou, H. Zha, C. L. Giles',
		title: 'IKNN: Informative K-Nearest Neighbor Pattern Classification',
		year: 2007,
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new IKNN(k.value, i.value)

		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		const categories = model.predict(platform.testInput(4))
		platform.testResult(categories)
	}

	const k = controller.input.number({ label: 'k', min: 1, max: 1000, value: 100 })
	const i = controller.input.number({ label: 'i', min: 1, max: 1000, value: 5 })
	controller.input.button('Calculate').on('click', fitModel)
}
