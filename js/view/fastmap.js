import FastMap from '../../lib/model/fastmap.js'

var dispFastMap = function (elm, platform) {
	const fitModel = cb => {
		const dim = platform.dimension
		const pred = new FastMap().predict(platform.trainInput, dim)
		platform.trainResult = pred
		cb && cb()
	}
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispFastMap(platform.setting.ml.configElement, platform)
}
