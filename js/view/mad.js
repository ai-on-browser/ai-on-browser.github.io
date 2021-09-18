import MAD from '../../lib/model/mad.js'

var dispMAD = function (elm, platform) {
	const calcMAD = function () {
		platform.fit((tx, ty, cb) => {
			const threshold = +elm.select('[name=threshold]').property('value')
			const model = new MAD()
			model.fit(tx)
			const outliers = model.predict(tx).map(v => v > threshold)
			cb(outliers)
			platform.predict((px, pred_cb) => {
				const outlier_tiles = model.predict(px).map(v => v > threshold)
				pred_cb(outlier_tiles)
			}, 3)
		})
	}

	elm.append('span').text(' threshold = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'threshold')
		.attr('value', 2)
		.attr('min', 0)
		.attr('max', 10)
		.property('required', true)
		.attr('step', 0.1)
		.on('change', function () {
			calcMAD()
		})
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcMAD)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispMAD(platform.setting.ml.configElement, platform)
}