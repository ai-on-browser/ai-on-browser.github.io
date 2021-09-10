import SavitzkyGolayFilter from '../lib/model/savitzky_golay.js'

var dispSG = function (elm, platform) {
	const fitModel = () => {
		const k = +elm.select('[name=k]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			const model = new SavitzkyGolayFilter(k)
			const pred = model.predict(tx)
			pred_cb(pred)
		})
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
