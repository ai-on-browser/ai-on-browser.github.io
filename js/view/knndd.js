import KNNDD from '../../lib/model/knndd.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'J. H. M. Janssens, I. Flesch, E. O. Postma',
		title: 'Outlier Detection with One-Class Classifiers from ML and KDD',
		year: 2009,
	}
	const controller = new Controller(platform)

	const calc = () => {
		const th = threshold.value
		const model = new KNNDD(k.value)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v > th)
	}

	const k = controller.input.number({ label: ' k ', min: 1, max: 100, value: 5 })
	const threshold = controller.input
		.number({ label: ' threshold ', min: 0, max: 1000, step: 0.1, value: 3 })
		.on('change', calc)
	controller.input.button('Calculate').on('click', calc)
}
