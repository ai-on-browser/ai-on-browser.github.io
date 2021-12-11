import DemingRegression from '../../lib/model/deming.js'

var dispDeming = function (elm, platform) {
	const fitModel = () => {
		platform.fit((tx, ty) => {
			const d = +elm.select('[name=d]').property('value')
			const model = new DemingRegression(d)
			model.fit(
				tx.map(v => v[0]),
				ty.map(v => v[0])
			)
			platform.predict((px, pred_cb) => {
				pred_cb(model.predict(px.map(v => v[0])))
			}, 1)
		})
	}

	elm.append('span').text(' d ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'd')
		.attr('value', 1)
		.attr('min', 0)
		.attr('step', 0.1)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Fit" button. This model works with 1D data only.'
	dispDeming(platform.setting.ml.configElement, platform)
}
