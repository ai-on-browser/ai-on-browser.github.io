import NaiveBayes from '../../lib/model/naive_bayes.js'
import Controller from '../controller.js'
import { specialCategory } from '../utils.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	let model = new NaiveBayes()

	const calcBayes = () => {
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		if (platform.task === 'DE') {
			const pred = model.probability(platform.testInput(3)).map(p => p.reduce((s, v) => s + v, 0))
			const min = Math.min(...pred)
			const max = Math.max(...pred)
			platform.testResult(pred.map(v => specialCategory.density((v - min) / (max - min))))
		} else {
			platform.testResult(model.predict(platform.testInput(3)))
		}
	}

	controller.select({ label: 'Distribution ', values: ['gaussian'] }).on('change', calcBayes)
	controller.input.button('Calculate').on('click', calcBayes)
}
