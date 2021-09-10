import NearestCentroid from '../lib/model/nearest_centroid.js'

var dispNearestCentroid = function (elm, platform) {
	const calcNearestCentroid = function () {
		const metric = elm.select('[name=metric]').property('value')
		platform.fit((tx, ty) => {
			let model = new NearestCentroid(metric)
			model.fit(
				tx,
				ty.map(v => v[0])
			)
			platform.predict((px, pred_cb) => {
				const pred = model.predict(px)
				pred_cb(pred)
			}, 4)
		})
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
