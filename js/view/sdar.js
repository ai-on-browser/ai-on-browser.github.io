import SDAR from '../../lib/model/sdar.js'

var dispSDAR = function (elm, platform) {
	const fitModel = () => {
		const p = +elm.select('[name=p]').property('value')
		const c = +elm.select('[name=c]').property('value')
		const tx = platform.trainInput
		const model = new SDAR()
		const pred = []
		for (let i = 0; i < c; pred[i++] = []);
		for (let d = 0; d < tx[0].length; d++) {
			const xd = tx.map(v => v[d])
			const p = model.predict(xd, c)
			for (let i = 0; i < pred.length; i++) {
				pred[i][d] = p[i]
			}
		}
		platform.trainResult = pred
	}

	elm.append('span').text('p')
	elm.append('input').attr('type', 'number').attr('name', 'p').attr('min', 1).attr('max', 1000).attr('value', 1)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	elm.append('span').text('predict count')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'c')
		.attr('min', 1)
		.attr('max', 100)
		.attr('value', 100)
		.on('change', fitModel)
}

export default function (platform) {
	platform.setting.ml.draft = true
	platform.setting.ml.usage = 'Click and add data point. Click "fit" to update.'
	dispSDAR(platform.setting.ml.configElement, platform)
}
