import cumulativeMovingAverage from '../../lib/model/cumulative_moving_average.js'

var dispMovingAverage = function (elm, platform) {
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			const pred = cumulativeMovingAverage(tx)
			pred_cb(pred)
		})
	}

	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	dispMovingAverage(platform.setting.ml.configElement, platform)
}
