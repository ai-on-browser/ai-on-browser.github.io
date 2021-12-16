import NaiveBayes from '../../lib/model/naive_bayes.js'

var dispNaiveBayes = function (elm, platform) {
	let model = new NaiveBayes()

	const calcBayes = cb => {
		platform.fit((tx, ty) => {
			model.fit(
				tx,
				ty.map(v => v[0])
			)
			platform.predict((px, pred_cb) => {
				if (platform.task === 'DE') {
					const pred = model.probability(px).map(p => p.reduce((s, v) => s + v, 0))
					const min = Math.min(...pred)
					const max = Math.max(...pred)
					pred_cb(pred.map(v => specialCategory.density((v - min) / (max - min))))
				} else {
					pred_cb(model.predict(px))
				}
				cb && cb()
			}, 3)
		})
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
