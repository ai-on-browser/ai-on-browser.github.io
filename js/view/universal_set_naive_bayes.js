import UniversalSetNaiveBayes from '../../lib/model/universal_set_naive_bayes.js'

var dispUniversalSetNaiveBayes = function (elm, platform) {
	let model = new UniversalSetNaiveBayes()

	const calcBayes = cb => {
		platform.fit((tx, ty) => {
			model.fit(
				tx,
				ty.map(v => v[0])
			)
			platform.predict((px, pred_cb) => {
				pred_cb(model.predict(px))
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
	dispUniversalSetNaiveBayes(platform.setting.ml.configElement, platform)
}
