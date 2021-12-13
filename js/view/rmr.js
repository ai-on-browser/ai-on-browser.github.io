import RepeatedMedianRegression from '../../lib/model/rmr.js'

var dispRMR = function (elm, platform) {
	const fitModel = cb => {
		const dim = platform.datas.dimension
		platform.fit((tx, ty) => {
			const model = new RepeatedMedianRegression()
			model.fit(
				tx.map(v => v[0]),
				ty.map(v => v[0])
			)
			platform.predict((px, pred_cb) => {
				pred_cb(model.predict(px.map(v => v[0])))
			}, 1)
		})
	}

	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Fit" button. This model works with 1D data only.'
	dispRMR(platform.setting.ml.configElement, platform)
}
