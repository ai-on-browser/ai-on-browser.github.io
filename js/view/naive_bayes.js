import NaiveBayes from '../../lib/model/naive_bayes.js'
import Matrix from '../../lib/util/matrix.js'
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
		let tx = platform.trainInput
		let px = platform.testInput(3)
		if (dist.value === 'multinomial') {
			const d = discrete.value
			const x = Matrix.fromArray(tx)
			const max = x.max()
			const min = x.min()
			tx = tx.map(r => r.map(v => Math.floor(((v - min) / (max - min)) * d)))
			px = px.map(r => r.map(v => Math.floor(((v - min) / (max - min)) * d)))
		}
		model.fit(
			tx,
			platform.trainOutput.map(v => v[0])
		)
		if (platform.task === 'DE') {
			const pred = model.probability(px).map(p => p.reduce((s, v) => s + v, 0))
			platform.testResult(pred)
		} else {
			platform.testResult(model.predict(px))
		}
	}

	const dist = controller.select({ label: 'Distribution ', values: ['gaussian', 'multinomial'] }).on('change', () => {
		multinomialConf.element.style.display = dist.value === 'multinomial' ? 'inline' : 'none'
		calcBayes()
	})
	const multinomialConf = controller.span()
	multinomialConf.element.style.display = 'none'
	const discrete = multinomialConf.input.number({ label: 'discrete', max: 100, min: 2, value: 10 })
	const a = multinomialConf.input.number({ label: 'alpha', max: 10, min: 0, step: 0.1, value: 1 })
	controller.input.button('Calculate').on('click', calcBayes)
}
