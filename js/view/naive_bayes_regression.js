import NaiveBayesRegression from '../../lib/model/naive_bayes_regression.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit".'
	platform.setting.ml.reference = {
		author: 'E. Frank, L. Trigg, G. Holmes, I. H. Witten',
		title: 'Naive Bayes for Regression',
		year: 1999,
	}
	const controller = new Controller(platform)

	controller.input.button('Fit').on('click', () => {
		const input = platform.trainInput
		const model = new NaiveBayesRegression(Array(input[0].length).fill(false))
		model.fit(
			input,
			platform.trainOutput.map(v => v[0])
		)
		const pred = model.predict(platform.testInput(20))
		platform.testResult(pred)
	})
}
