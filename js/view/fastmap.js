import fastMap from '../../lib/model/fastmap.js'

var dispFastMap = function (elm, platform) {
	const fitModel = cb => {
		const dim = platform.dimension
		platform.fit((tx, ty, pred_cb) => {
			const pred = fastMap(tx, dim)
			pred_cb(pred)
			cb && cb()
		})
	}
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispFastMap(platform.setting.ml.configElement, platform)
}
