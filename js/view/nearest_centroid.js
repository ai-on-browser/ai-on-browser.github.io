import NearestCentroid from '../../lib/model/nearest_centroid.js'

var dispNearestCentroid = function (elm, platform) {
	const calcNearestCentroid = function () {
		const metric = elm.select('[name=metric]').property('value')
		let model = new NearestCentroid(metric)
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		const pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
	}

	elm.append('select')
		.attr('name', 'metric')
		.selectAll('option')
		.data(['euclid', 'manhattan', 'chebyshev'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcNearestCentroid)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispNearestCentroid(platform.setting.ml.configElement, platform)
	platform.setting.ml.detail = `
For each category $ C_k $, the centroid $ c_k $ is defined as
$$
c_k = \\frac{1}{|C_k|} \\sum_{x \\in C_k} x
$$
The category of data $ x $ is estimated as
$$
\\argmin_k \\| x - c_k \\|^2
$$
`
}
