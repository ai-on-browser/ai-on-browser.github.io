import ButterworthFilter from '../../lib/model/butterworth.js'

var dispButterworth = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Butterworth filter (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Butterworth_filter',
	}
	const fitModel = () => {
		const n = +elm.select('[name=n]').property('value')
		const c = +elm.select('[name=c]').property('value')
		const tx = platform.trainInput
		const model = new ButterworthFilter(n, c)
		const pred = []
		for (let i = 0; i < tx.length; pred[i++] = []);
		for (let d = 0; d < tx[0].length; d++) {
			const xd = tx.map(v => v[d])
			const p = model.predict(xd)
			for (let i = 0; i < pred.length; i++) {
				pred[i][d] = p[i]
			}
		}
		platform.trainResult = pred
	}

	elm.append('span').text('n')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'n')
		.attr('min', 1)
		.attr('max', 100)
		.attr('value', 2)
		.on('change', fitModel)
	elm.append('span').text('cutoff rate')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'c')
		.attr('min', 0)
		.attr('max', 1)
		.attr('value', 0.9)
		.attr('step', 0.01)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	dispButterworth(platform.setting.ml.configElement, platform)
}
