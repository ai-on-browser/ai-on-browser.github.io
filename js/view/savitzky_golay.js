import SavitzkyGolayFilter from '../../lib/model/savitzky_golay.js'

var dispSG = function (elm, platform) {
	const fitModel = () => {
		const k = +elm.select('[name=k]').property('value')
		const tx = platform.trainInput
		const model = new SavitzkyGolayFilter(k)
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

	elm.append('span').text('k')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'k')
		.attr('min', 3)
		.attr('max', 100)
		.attr('value', 5)
		.attr('step', 2)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	dispSG(platform.setting.ml.configElement, platform)
}
