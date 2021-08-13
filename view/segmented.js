import SegmentedRegression from '../model/segmented.js'

var dispSegmentedRegression = function (elm, platform) {
	const fitModel = () => {
		platform.fit((tx, ty) => {
			const s = +elm.select('[name=s]').property('value')
			const model = new SegmentedRegression(s)
			model.fit(tx, ty)

			platform.predict((px, pred_cb) => {
				const pred = model.predict(px)
				pred_cb(pred)
			}, 1)
		})
	}

	elm.append('span').text('Segments ')
	elm.append('input').attr('type', 'number').attr('name', 's').attr('min', 1).attr('max', 10).attr('value', 3)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Fit" button. This model works with 1D data only.'
	dispSegmentedRegression(platform.setting.ml.configElement, platform)
}
