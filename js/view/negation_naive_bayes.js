import NegationNaiveBayes from '../../lib/model/negation_naive_bayes.js'

var dispNegationNaiveBayes = function (elm, platform) {
	let model = new NegationNaiveBayes()

	const calcBayes = cb => {
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		platrofm.testResult(model.predict(platform.testInput(3)))
		cb && cb()
	}

	elm.append('span').text('Distribution ')
	elm.append('select')
		.attr('name', 'distribution')
		.on('change', calcBayes)
		.selectAll('option')
		.data(['gaussian'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcBayes)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispNegationNaiveBayes(platform.setting.ml.configElement, platform)
}
