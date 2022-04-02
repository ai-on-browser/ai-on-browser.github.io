import NaiveBayes from '../../lib/model/naive_bayes.js'

var dispNaiveBayes = function (elm, platform) {
	let model = new NaiveBayes()

	const calcBayes = cb => {
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
	dispNaiveBayes(platform.setting.ml.configElement, platform)
}
