import MovingMedian from '../../lib/model/moving_median.js'

var dispMovingMedian = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Moving average (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Moving_average#Moving_median',
	}
	const fitModel = () => {
		const k = +elm.select('[name=k]').property('value')
		let tx = platform.trainInput
		const model = new MovingMedian()
		const pred = []
		for (let i = 0; i < tx.length; pred[i++] = []);
		for (let d = 0; d < tx[0].length; d++) {
			const xd = tx.map(v => v[d])
			const p = model.predict(xd, k)
			for (let i = 0; i < pred.length; i++) {
				pred[i][d] = p[i]
			}
		}
		platform.trainResult = pred
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
