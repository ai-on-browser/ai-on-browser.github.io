import MaximumLikelihoodEstimator from '../../lib/model/maximum_likelihood.js'

var dispMaximumLikelihoodEstimator = function (elm, platform) {
	const fitModel = () => {
		const distribution = elm.select('[name=distribution]').property('value')
		const model = new MaximumLikelihoodEstimator(distribution)
		model.fit(platform.trainInput)

		const pred = model.predict(platform.testInput(4))
		const min = Math.min(...pred)
		const max = Math.max(...pred)
		platform.testResult(pred.map(v => specialCategory.density((v - min) / (max - min))))
	}

	elm.append('select')
		.attr('name', 'distribution')
		.selectAll('option')
		.data(['normal'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispMaximumLikelihoodEstimator(platform.setting.ml.configElement, platform)
}
