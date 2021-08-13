import movingMedian from '../model/moving_median.js'

var dispMovingMedian = function (elm, platform) {
	const fitModel = () => {
		const k = +elm.select('[name=k]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			const pred = movingMedian(tx, k)
			pred_cb(pred)
		})
	}

	const kelm = elm.append('span')
	kelm.append('span').text('k')
	kelm.append('input')
		.attr('type', 'number')
		.attr('name', 'k')
		.attr('min', 1)
		.attr('max', 100)
		.attr('value', 5)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	dispMovingMedian(platform.setting.ml.configElement, platform)
}
