import FastMap from '../../lib/model/fastmap.js'

var dispFastMap = function (elm, platform) {
	platform.setting.ml.reference = {
		author: 'C. Faloutsos, KI. Lin',
		title: 'FastMap: A fast algorithm for indexing, data-mining and visualization of traditional and multimedia datasets',
		year: 1995,
	}
	const fitModel = () => {
		const dim = platform.dimension
		const pred = new FastMap().predict(platform.trainInput, dim)
		platform.trainResult = pred
	}
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispFastMap(platform.setting.ml.configElement, platform)
}
