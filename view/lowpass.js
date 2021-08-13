import { LowpassFilter } from '../model/lowpass.js'

var dispLowpass = function (elm, platform) {
	const fitModel = () => {
		const c = +elm.select('[name=c]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			const model = new LowpassFilter(c)
			const pred = model.predict(tx)
			pred_cb(pred)
		})
	}

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
	dispLowpass(platform.setting.ml.configElement, platform)
}
