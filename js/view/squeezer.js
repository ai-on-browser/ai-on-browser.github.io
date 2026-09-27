import Squeezer from '../../lib/model/squeezer.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.require = { preprocess: 'discrete' }
	platform.setting.ml.reference = {
		author: 'H. Zengyou, X. Xiaofei, D. Shengchun',
		title: 'Squeezer: An Efficient Algorithm for Clustering Categorical Data',
		year: 2002,
	}
	const controller = new Controller(platform)

	const fitModel = () => {
		const model = new Squeezer(s.value)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred
	}

	const s = controller.input.number({ label: ' s ', min: 0, max: 1000, step: 0.1, value: 0.1 }).on('change', fitModel)
	controller.input.button('Fit').on('click', fitModel)
}
