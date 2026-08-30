import NaiveBayes from '../../lib/model/naive_bayes.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		title: 'Naive Bayes classifier (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Naive_Bayes_classifier',
	}
	const controller = new Controller(platform)

	const calcBayes = () => {
		const model = new NaiveBayes({ name: dist.value, a: a.value })
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		const px = platform.testInput(3)
		if (platform.task === 'DE') {
			const pred = model.probability(px).map(p => p.reduce((s, v) => s + v, 0))
			platform.testResult(pred)
		} else {
			platform.testResult(model.predict(px).map(v => v ?? -1))
		}
	}

	const dist = controller.select({ label: 'Distribution ', values: ['gaussian', 'multinomial'] }).on('change', () => {
		multinomialConf.element.style.display = dist.value === 'multinomial' ? 'inline' : 'none'
		if (dist.value === 'multinomial') {
			platform.setting.ml.require = { preprocess: 'discrete' }
		} else {
			platform.setting.ml.require = null
		}
		calcBayes()
	})
	const multinomialConf = controller.span()
	multinomialConf.element.style.display = 'none'
	const a = multinomialConf.input.number({ label: 'alpha', max: 10, min: 0, step: 0.1, value: 1 })
	controller.input.button('Calculate').on('click', calcBayes)
}
