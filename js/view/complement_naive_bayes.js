import ComplementNaiveBayes from '../../lib/model/complement_naive_bayes.js'

var dispComplementNaiveBayes = function (elm, platform) {
	let model = new ComplementNaiveBayes()

	const calcBayes = () => {
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		platform.testResult(model.predict(platform.testInput(3)))
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
	dispComplementNaiveBayes(platform.setting.ml.configElement, platform)
}
