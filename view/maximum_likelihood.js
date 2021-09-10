import MaximumLikelihoodEstimator from '../lib/model/maximum_likelihood.js'

var dispMaximumLikelihoodEstimator = function (elm, platform) {
	const fitModel = () => {
		const distribution = elm.select('[name=distribution]').property('value')
		const model = new MaximumLikelihoodEstimator(distribution)
		platform.fit((tx, ty) => {
			model.fit(tx)

			platform.predict((px, pred_cb) => {
				const pred = model.predict(px)
				const min = Math.min(...pred)
				const max = Math.max(...pred)
				pred_cb(pred.map(v => specialCategory.density((v - min) / (max - min))))
			}, 4)
		})
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
